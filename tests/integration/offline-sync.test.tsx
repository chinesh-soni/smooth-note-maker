import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSyncQueue } from '@/hooks/useSyncQueue';
import * as syncQueueDb from '@/lib/db/sync-queue';

vi.mock('@/lib/db/sync-queue');

describe('useSyncQueue Offline Sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [{ id: 'queue-item-1', success: true }],
      }),
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should process pending queue items when online', async () => {
    vi.mocked(syncQueueDb.hasPendingSyncActions).mockResolvedValue(true);
    vi.mocked(syncQueueDb.getPendingSyncActions).mockResolvedValue([
      {
        id: 'queue-item-1',
        noteId: 'note-1',
        action: 'UPDATE',
        payload: { title: 'Offline Updated Note' },
        timestamp: Date.now(),
        retryCount: 0,
      },
    ]);

    const { result } = renderHook(() => useSyncQueue());

    await act(async () => {
      await result.current.processQueue();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/drive/sync',
      expect.objectContaining({
        method: 'POST',
      })
    );

    expect(syncQueueDb.removeSyncAction).toHaveBeenCalledWith('queue-item-1');
  });

  it('should mark items failed when sync endpoint returns error for an item', async () => {
    vi.mocked(syncQueueDb.hasPendingSyncActions).mockResolvedValue(true);
    vi.mocked(syncQueueDb.getPendingSyncActions).mockResolvedValue([
      {
        id: 'queue-item-2',
        noteId: 'note-2',
        action: 'UPDATE',
        payload: { title: 'Failed Item Note' },
        timestamp: Date.now(),
        retryCount: 0,
      },
    ]);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [{ id: 'queue-item-2', success: false, error: 'Rate limit' }],
      }),
    } as any);

    const { result } = renderHook(() => useSyncQueue());

    await act(async () => {
      await result.current.processQueue();
    });

    expect(syncQueueDb.markSyncActionFailed).toHaveBeenCalledWith('queue-item-2', 'Rate limit');
    expect(syncQueueDb.removeSyncAction).not.toHaveBeenCalled();
  });
});
