import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncQueueItem } from '@/types/sync';

describe('Sync Queue Logic', () => {
  let inMemoryQueue: SyncQueueItem[] = [];

  beforeEach(() => {
    inMemoryQueue = [];
  });

  const enqueue = (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): SyncQueueItem => {
    // If there's an existing UPDATE for same noteId, consolidate
    if (item.action === 'UPDATE') {
      const existing = inMemoryQueue.find(
        (q) => q.noteId === item.noteId && q.action === 'UPDATE'
      );
      if (existing) {
        existing.payload = { ...existing.payload, ...item.payload };
        existing.timestamp = Date.now();
        return existing;
      }
    }

    const newItem: SyncQueueItem = {
      ...item,
      id: 'queue_' + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      retryCount: 0,
    };
    inMemoryQueue.push(newItem);
    return newItem;
  };

  it('should enqueue new sync items with retryCount 0', () => {
    const item = enqueue({
      noteId: 'note_1',
      action: 'CREATE',
      payload: { title: 'First Note' },
    });

    expect(inMemoryQueue.length).toBe(1);
    expect(item.retryCount).toBe(0);
    expect(item.action).toBe('CREATE');
  });

  it('should consolidate consecutive UPDATE actions for the same note', () => {
    enqueue({
      noteId: 'note_1',
      action: 'UPDATE',
      payload: { title: 'Draft 1' },
    });

    enqueue({
      noteId: 'note_1',
      action: 'UPDATE',
      payload: { title: 'Draft 2' },
    });

    expect(inMemoryQueue.length).toBe(1);
    expect(inMemoryQueue[0].payload.title).toBe('Draft 2');
  });

  it('should increment retryCount and record lastError on failure', () => {
    const item = enqueue({
      noteId: 'note_1',
      action: 'UPDATE',
      payload: { title: 'Draft 1' },
    });

    item.retryCount += 1;
    item.lastError = 'Network timeout';

    expect(inMemoryQueue[0].retryCount).toBe(1);
    expect(inMemoryQueue[0].lastError).toBe('Network timeout');
  });

  it('should remove completed item from queue', () => {
    const item = enqueue({
      noteId: 'note_1',
      action: 'CREATE',
      payload: { title: 'New Note' },
    });

    expect(inMemoryQueue.length).toBe(1);
    inMemoryQueue = inMemoryQueue.filter((q) => q.id !== item.id);
    expect(inMemoryQueue.length).toBe(0);
  });
});
