import { Note, StoredExcalidrawFile } from '@/types/note';
import { validateExcalidrawFile } from './validator';

export const APP_VERSION = '1.0.0';
export const APP_SOURCE = 'https://smooth-note-maker.vercel.app';

/**
 * Serializes a Note object into standard .excalidraw JSON string for Google Drive and export.
 */
export function serializeNoteToExcalidrawJson(note: Note): string {
  const payload: StoredExcalidrawFile = {
    type: 'excalidraw',
    version: 2,
    source: APP_SOURCE,
    elements: note.elements || [],
    appState: {
      viewBackgroundColor: note.appState?.viewBackgroundColor || '#121212',
      gridSize: note.appState?.gridSize || null,
      theme: note.appState?.theme || 'dark',
      zoom: note.appState?.zoom || { value: 1 },
      scrollX: note.appState?.scrollX || 0,
      scrollY: note.appState?.scrollY || 0,
    },
    files: note.files || {},
    metadata: {
      id: note.id,
      title: note.title,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      appVersion: APP_VERSION,
      version: note.version || 1,
    },
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Deserializes an .excalidraw JSON string into a Note object.
 */
export function deserializeExcalidrawJsonToNote(
  jsonString: string,
  fallbackMetadata?: Partial<Note>
): Note {
  const result = validateExcalidrawFile(JSON.parse(jsonString));
  if (!result.isValid || !result.sanitizedData) {
    throw new Error(result.error || 'Failed to deserialize note');
  }

  const { elements, appState, files, metadata } = result.sanitizedData;
  const now = Date.now();

  return {
    id: metadata?.id || fallbackMetadata?.id || 'note_' + now,
    title: metadata?.title || fallbackMetadata?.title || 'Untitled Note',
    createdAt: metadata?.createdAt || fallbackMetadata?.createdAt || now,
    updatedAt: metadata?.updatedAt || fallbackMetadata?.updatedAt || now,
    lastSyncedAt: fallbackMetadata?.lastSyncedAt || now,
    driveFileId: fallbackMetadata?.driveFileId || null,
    version: metadata?.version || fallbackMetadata?.version || 1,
    tags: metadata?.tags || fallbackMetadata?.tags || [],
    isPinned: metadata?.isPinned || fallbackMetadata?.isPinned || false,
    elements: elements || [],
    appState: appState || {},
    files: files || {},
  };
}
