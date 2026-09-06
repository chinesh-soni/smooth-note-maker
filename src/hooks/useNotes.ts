import { useState, useEffect, useCallback, useMemo } from 'react';
import { Note, NoteMetadata, TemplateType } from '@/types/note';
import {
  loadAllNotesMetadataLocally,
  loadNoteLocally,
  saveNoteLocally,
  deleteNoteLocally,
  getAppState,
  setAppState,
} from '@/lib/db/indexeddb';
import { createTemplateNote } from '@/lib/excalidraw/templates';
import { generateId } from '@/lib/utils/id';
import { enqueueSyncAction } from '@/lib/db/sync-queue';

export function useNotes() {
  const [notes, setNotes] = useState<NoteMetadata[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true);
  const [isLoadingNote, setIsLoadingNote] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'updated' | 'title' | 'created'>('updated');
  const [driveFolderId, setDriveFolderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load notes metadata from IndexedDB first (instant UI), then fetch from Drive
  const refreshNotes = useCallback(async () => {
    setIsLoadingList(true);
    setError(null);

    try {
      // 1. Instant local load
      const localNotes = await loadAllNotesMetadataLocally();
      if (localNotes.length > 0) {
        setNotes(localNotes);
      }

      // 2. Fetch from Google Drive API if online
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const res = await fetch('/api/drive/files');
        if (res.ok) {
          const data = await res.json();
          const driveFiles = data.files || [];
          setDriveFolderId(data.folderId || null);

          // Map drive files to NoteMetadata
          const driveNoteMap = new Map<string, NoteMetadata>();
          for (const file of driveFiles) {
            const noteId = file.appProperties?.noteId || file.id;
            const title = file.name.replace(/\.excalidraw$/, '');
            const updatedAt = new Date(file.modifiedTime).getTime();
            const createdAt = new Date(file.createdTime).getTime();

            driveNoteMap.set(noteId, {
              id: noteId,
              title,
              driveFileId: file.id,
              createdAt,
              updatedAt,
              remoteModifiedTime: file.modifiedTime,
              version: file.appProperties?.version ? parseInt(file.appProperties.version) : 1,
            });
          }

          // Merge local and remote
          const merged = new Map<string, NoteMetadata>();
          for (const local of localNotes) {
            merged.set(local.id, local);
          }
          for (const [id, remote] of Array.from(driveNoteMap.entries())) {
            const existing = merged.get(id);
            if (!existing || remote.updatedAt > existing.updatedAt) {
              merged.set(id, { ...existing, ...remote });
            }
          }

          const mergedArray = Array.from(merged.values()).sort(
            (a, b) => b.updatedAt - a.updatedAt
          );

          setNotes(mergedArray);

          // Save merged metadata to local store
          for (const meta of mergedArray) {
            const existingFull = await loadNoteLocally(meta.id);
            if (!existingFull) {
              await saveNoteLocally({
                ...meta,
                elements: [],
                appState: {},
                files: {},
              });
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to refresh notes list:', err);
      setError(err.message || 'Failed to refresh notes');
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  // Select and load a note by ID
  const selectNote = useCallback(async (id: string | null) => {
    if (!id) {
      setActiveNoteId(null);
      setActiveNote(null);
      await setAppState('activeNoteId', null);
      return;
    }

    setIsLoadingNote(true);
    setActiveNoteId(id);
    await setAppState('activeNoteId', id);

    try {
      // 1. Try local IndexedDB
      const local = await loadNoteLocally(id);
      if (local && (local.elements?.length > 0 || !local.driveFileId)) {
        const blackboardNote = {
          ...local,
          appState: {
            ...local.appState,
            viewBackgroundColor:
              local.appState?.viewBackgroundColor && local.appState.viewBackgroundColor !== '#ffffff'
                ? local.appState.viewBackgroundColor
                : '#121212',
            theme: 'dark',
          },
        };
        setActiveNote(blackboardNote);
        setIsLoadingNote(false);
        return;
      }

      // 2. If local scene is empty or not found, fetch from Google Drive
      if (local?.driveFileId && typeof navigator !== 'undefined' && navigator.onLine) {
        const res = await fetch(`/api/drive/files/${local.driveFileId}`);
        if (res.ok) {
          const data = await res.json();
          const remoteNote = {
            ...data.note,
            appState: {
              ...data.note.appState,
              viewBackgroundColor:
                data.note.appState?.viewBackgroundColor && data.note.appState.viewBackgroundColor !== '#ffffff'
                  ? data.note.appState.viewBackgroundColor
                  : '#121212',
              theme: 'dark',
            },
          };
          setActiveNote(remoteNote);
          await saveNoteLocally(remoteNote);
          setIsLoadingNote(false);
          return;
        }
      }

      if (local) {
        setActiveNote({
          ...local,
          appState: {
            ...local.appState,
            viewBackgroundColor: '#121212',
            theme: 'dark',
          },
        });
      }
    } catch (err: any) {
      console.error('Failed to load active note:', err);
    } finally {
      setIsLoadingNote(false);
    }
  }, []);

  // Create a new note
  const createNote = useCallback(
    async (template: TemplateType = 'blank', customTitle?: string) => {
      const templateData = createTemplateNote(template, customTitle);
      const newNote: Note = {
        id: templateData.id || generateId(),
        title: templateData.title || 'Untitled Note',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
        driveFileId: null,
        elements: templateData.elements || [],
        appState: templateData.appState || {},
        files: templateData.files || {},
        isPinned: false,
        tags: templateData.tags || [],
      };

      // Save locally
      await saveNoteLocally(newNote);

      // Update state
      setNotes((prev) => [newNote, ...prev]);
      setActiveNote(newNote);
      setActiveNoteId(newNote.id);
      await setAppState('activeNoteId', newNote.id);

      return newNote;
    },
    []
  );

  // Rename a note
  const renameNote = useCallback(
    async (id: string, newTitle: string) => {
      const trimmed = newTitle.trim() || 'Untitled Note';

      // 1. Optimistic local update
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, title: trimmed, updatedAt: Date.now() } : n))
      );

      if (activeNote?.id === id) {
        setActiveNote((prev) => (prev ? { ...prev, title: trimmed, updatedAt: Date.now() } : null));
      }

      const note = await loadNoteLocally(id);
      if (note) {
        note.title = trimmed;
        note.updatedAt = Date.now();
        await saveNoteLocally(note);

        // Update in Google Drive if online
        if (note.driveFileId && typeof navigator !== 'undefined' && navigator.onLine) {
          fetch(`/api/drive/files/${note.driveFileId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: trimmed }),
          }).catch(console.error);
        } else {
          await enqueueSyncAction('RENAME', id, { ...note, title: trimmed });
        }
      }
    },
    [activeNote]
  );

  // Duplicate a note
  const duplicateNote = useCallback(
    async (id: string) => {
      const original = await loadNoteLocally(id);
      if (!original) return;

      const duplicatedNote: Note = {
        ...original,
        id: generateId(),
        title: `${original.title} (Copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        driveFileId: null,
        remoteModifiedTime: null,
        lastSyncedAt: null,
        version: 1,
      };

      await saveNoteLocally(duplicatedNote);
      setNotes((prev) => [duplicatedNote, ...prev]);
      setActiveNote(duplicatedNote);
      setActiveNoteId(duplicatedNote.id);
      await setAppState('activeNoteId', duplicatedNote.id);
      return duplicatedNote;
    },
    []
  );

  // Delete a note
  const deleteNote = useCallback(
    async (id: string) => {
      const target = notes.find((n) => n.id === id);
      const driveFileId = target?.driveFileId;

      // 1. Remove from local stores
      await deleteNoteLocally(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));

      if (activeNoteId === id) {
        const remaining = notes.filter((n) => n.id !== id);
        if (remaining.length > 0) {
          selectNote(remaining[0].id);
        } else {
          setActiveNote(null);
          setActiveNoteId(null);
          await setAppState('activeNoteId', null);
        }
      }

      // 2. Delete from Drive or enqueue
      if (driveFileId && typeof navigator !== 'undefined' && navigator.onLine) {
        fetch(`/api/drive/files/${driveFileId}`, { method: 'DELETE' }).catch(console.error);
      } else if (driveFileId) {
        await enqueueSyncAction('DELETE', id, { driveFileId });
      }
    },
    [notes, activeNoteId, selectNote]
  );

  // Update drive file ID mapping when autosave creates it
  const handleDriveFileCreated = useCallback(
    (noteId: string, driveFileId: string, modifiedTime: string) => {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId ? { ...n, driveFileId, remoteModifiedTime: modifiedTime } : n
        )
      );
      if (activeNote?.id === noteId) {
        setActiveNote((prev) =>
          prev ? { ...prev, driveFileId, remoteModifiedTime: modifiedTime } : null
        );
      }
    },
    [activeNote]
  );

  // Initial load
  useEffect(() => {
    refreshNotes().then(async () => {
      const savedActiveId = await getAppState('activeNoteId');
      if (savedActiveId) {
        selectNote(savedActiveId);
      }
    });
  }, [refreshNotes, selectNote]);

  // Filtered & Sorted notes
  const filteredNotes = useMemo(() => {
    let result = notes;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'created') {
        return b.createdAt - a.createdAt;
      }
      return b.updatedAt - a.updatedAt;
    });
  }, [notes, searchQuery, sortBy]);

  return {
    notes: filteredNotes,
    allNotesCount: notes.length,
    activeNote,
    activeNoteId,
    isLoadingList,
    isLoadingNote,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    driveFolderId,
    error,
    refreshNotes,
    selectNote,
    createNote,
    renameNote,
    duplicateNote,
    deleteNote,
    setActiveNote,
    handleDriveFileCreated,
  };
}
