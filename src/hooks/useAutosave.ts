import { useState, useRef, useCallback, useEffect } from 'react';
import { Note } from '@/types/note';
import { SyncStatus, ConflictInfo } from '@/types/sync';
import { saveNoteLocally } from '@/lib/db/indexeddb';
import { enqueueSyncAction } from '@/lib/db/sync-queue';
import { debounce } from '@/lib/utils/debounce';

interface UseAutosaveProps {
  onConflict?: (conflict: ConflictInfo) => void;
  onDriveFileCreated?: (noteId: string, driveFileId: string, modifiedTime: string) => void;
}

export function useAutosave({ onConflict, onDriveFileCreated }: UseAutosaveProps = {}) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentNoteRef = useRef<Note | null>(null);
  const isSyncingRef = useRef<boolean>(false);

  // Sync to Google Drive backend
  const syncToDrive = useCallback(
    async (noteToSync: Note, force = false) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setSyncStatus('offline');
        await enqueueSyncAction('UPDATE', noteToSync.id, noteToSync);
        return;
      }

      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      setSyncStatus('syncing-drive');
      setErrorMessage(null);

      try {
        if (!noteToSync.driveFileId) {
          // Note not yet in Drive, create it
          const res = await fetch('/api/drive/files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ note: noteToSync }),
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to create note in Drive');
          }

          const data = await res.json();
          const driveFile = data.file;

          if (driveFile) {
            noteToSync.driveFileId = driveFile.id;
            noteToSync.remoteModifiedTime = driveFile.modifiedTime;
            noteToSync.lastSyncedAt = Date.now();
            await saveNoteLocally(noteToSync);

            if (onDriveFileCreated) {
              onDriveFileCreated(noteToSync.id, driveFile.id, driveFile.modifiedTime);
            }
          }
        } else {
          // Existing note in Drive, update it
          const res = await fetch(`/api/drive/files/${noteToSync.driveFileId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              note: noteToSync,
              expectedModifiedTime: noteToSync.remoteModifiedTime,
              force,
            }),
          });

          if (res.status === 409) {
            // Conflict detected
            const conflictData = await res.json();
            setSyncStatus('conflict');

            // Fetch latest remote note to show comparison
            const remoteRes = await fetch(`/api/drive/files/${noteToSync.driveFileId}`);
            if (remoteRes.ok) {
              const remoteData = await remoteRes.json();
              if (onConflict) {
                onConflict({
                  noteId: noteToSync.id,
                  localNote: noteToSync,
                  remoteNote: remoteData.note,
                  remoteModifiedTime: conflictData.remoteModifiedTime,
                  localUpdatedAt: noteToSync.updatedAt,
                });
              }
            }
            return;
          }

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to update note in Drive');
          }

          const data = await res.json();
          const driveFile = data.file;

          if (driveFile) {
            noteToSync.remoteModifiedTime = driveFile.modifiedTime;
            noteToSync.lastSyncedAt = Date.now();
            await saveNoteLocally(noteToSync);
          }
        }

        setSyncStatus('saved');
        setLastSavedTime(Date.now());
      } catch (error: any) {
        console.error('Autosave sync failed:', error);
        setSyncStatus('error');
        const isAuthError =
          error.message?.includes('insufficient authentication scopes') ||
          error.message?.includes('Unauthorized') ||
          error.message?.includes('Access token');

        if (isAuthError) {
          setErrorMessage('Google Drive permission missing. Please sign out and sign in again.');
        } else {
          setErrorMessage(error.message || 'Sync failed');
          // Only add to offline queue if it's not a permanent auth error
          await enqueueSyncAction('UPDATE', noteToSync.id, noteToSync);
        }
      } finally {
        isSyncingRef.current = false;
      }
    },
    [onConflict, onDriveFileCreated]
  );

  const syncToDriveRef = useRef(syncToDrive);
  useEffect(() => {
    syncToDriveRef.current = syncToDrive;
  }, [syncToDrive]);

  // Debounced Drive sync with 700ms delay
  const debouncedDriveSyncRef = useRef(
    debounce((note: Note) => {
      syncToDriveRef.current?.(note);
    }, 700)
  );

  // Triggered whenever note data changes
  const saveNote = useCallback(
    async (note: Note) => {
      currentNoteRef.current = note;
      setSyncStatus('saving-local');

      // 1. Immediately save to local IndexedDB
      try {
        await saveNoteLocally(note);
        setSyncStatus('saved-local');
      } catch (err) {
        console.error('Local IndexedDB save failed:', err);
      }

      // 2. Queue debounced Drive sync (700ms)
      debouncedDriveSyncRef.current(note);
    },
    []
  );

  // Immediate manual "Save Now"
  const saveNow = useCallback(
    async (note?: Note, force = false) => {
      const targetNote = note || currentNoteRef.current;
      if (!targetNote) return;

      debouncedDriveSyncRef.current.cancel();

      // Immediate local save
      setSyncStatus('saving-local');
      await saveNoteLocally(targetNote);
      setSyncStatus('saved-local');

      // Immediate drive sync
      await syncToDriveRef.current(targetNote, force);
    },
    []
  );

  // Clean up debounce timers on unmount
  useEffect(() => {
    return () => {
      debouncedDriveSyncRef.current.cancel();
    };
  }, []);

  const getCurrentNote = useCallback(() => currentNoteRef.current, []);

  return {
    syncStatus,
    setSyncStatus,
    lastSavedTime,
    errorMessage,
    saveNote,
    saveNow,
    getCurrentNote,
  };
}
