import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutosave } from '@/hooks/useAutosave';
import { Note } from '@/types/note';

// Mock indexeddb and fetch
vi.mock('@/lib/db/indexeddb', () => ({
  saveNoteLocally: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/db/sync-queue', () => ({
  enqueueSyncAction: vi.fn().mockResolvedValue({ id: 'mock-sync-1' }),
}));

describe('useAutosave Integration', () => {
  const sampleNote: Note = {
    id: 'note-100',
    title: 'Autosave Test',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    driveFileId: 'drive-100',
    remoteModifiedTime: new Date().toISOString(),
    elements: [],
    appState: {},
    files: {},
    version: 1,
  };

  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        file: {
          id: 'drive-100',
          name: 'Autosave Test.excalidraw',
          modifiedTime: new Date().toISOString(),
        },
      }),
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should immediately set status to saving-local and debounce Drive sync by 700ms', async () => {
    const { result } = renderHook(() => useAutosave());

    expect(result.current.syncStatus).toBe('idle');

    // Trigger saveNote
    await act(async () => {
      await result.current.saveNote(sampleNote);
    });

    expect(result.current.syncStatus).toBe('saved-local');
    expect(global.fetch).not.toHaveBeenCalled();

    // Fast forward 699ms
    act(() => {
      vi.advanceTimersByTime(699);
    });
    expect(global.fetch).not.toHaveBeenCalled();

    // Fast forward 1ms more (total 700ms)
    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/drive/files/drive-100',
      expect.objectContaining({
        method: 'PUT',
      })
    );
  });

  it('should execute immediate sync when saveNow is called', async () => {
    const { result } = renderHook(() => useAutosave());

    await act(async () => {
      await result.current.saveNow(sampleNote);
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result.current.syncStatus).toBe('saved');
    expect(result.current.lastSavedTime).not.toBeNull();
  });

  it('should handle failed sync and set status to error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Google Drive quota exceeded' }),
    } as any);

    const { result } = renderHook(() => useAutosave());

    await act(async () => {
      await result.current.saveNow(sampleNote);
    });

    expect(result.current.syncStatus).toBe('error');
    expect(result.current.errorMessage).toContain('quota exceeded');
  });
});
