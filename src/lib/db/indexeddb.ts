import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Note, NoteMetadata } from '@/types/note';
import { SyncQueueItem } from '@/types/sync';

interface SmoothNoteMakerDB extends DBSchema {
  notes: {
    key: string; // note id
    value: NoteMetadata;
    indexes: {
      'by-updatedAt': number;
      'by-driveFileId': string;
    };
  };
  scenes: {
    key: string; // note id
    value: {
      id: string;
      elements: readonly any[];
      appState: Record<string, any>;
      files: Record<string, any>;
      updatedAt: number;
    };
  };
  sync_queue: {
    key: string; // queue item id
    value: SyncQueueItem;
    indexes: {
      'by-timestamp': number;
      'by-noteId': string;
    };
  };
  app_state: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'smooth_note_maker_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<SmoothNoteMakerDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<SmoothNoteMakerDB>> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB is only available in browser'));
  }

  if (!dbPromise) {
    dbPromise = openDB<SmoothNoteMakerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Notes metadata store
        if (!db.objectStoreNames.contains('notes')) {
          const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
          notesStore.createIndex('by-updatedAt', 'updatedAt');
          notesStore.createIndex('by-driveFileId', 'driveFileId');
        }

        // Scenes store (heavy elements & files)
        if (!db.objectStoreNames.contains('scenes')) {
          db.createObjectStore('scenes', { keyPath: 'id' });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('sync_queue')) {
          const queueStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          queueStore.createIndex('by-timestamp', 'timestamp');
          queueStore.createIndex('by-noteId', 'noteId');
        }

        // App state store
        if (!db.objectStoreNames.contains('app_state')) {
          db.createObjectStore('app_state');
        }
      },
    });
  }

  return dbPromise;
}

/**
 * Saves note metadata and scene into IndexedDB cache.
 */
export async function saveNoteLocally(note: Note): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['notes', 'scenes'], 'readwrite');

  const metadata: NoteMetadata = {
    id: note.id,
    title: note.title,
    driveFileId: note.driveFileId,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    lastSyncedAt: note.lastSyncedAt,
    version: note.version || 1,
    remoteModifiedTime: note.remoteModifiedTime,
    tags: note.tags,
    isPinned: note.isPinned,
    elementCount: note.elements?.length || 0,
  };

  const scene = {
    id: note.id,
    elements: note.elements || [],
    appState: note.appState || {},
    files: note.files || {},
    updatedAt: note.updatedAt,
  };

  await Promise.all([
    tx.objectStore('notes').put(metadata),
    tx.objectStore('scenes').put(scene),
    tx.done,
  ]);
}

/**
 * Loads full Note (metadata + scene) by ID from IndexedDB.
 */
export async function loadNoteLocally(id: string): Promise<Note | null> {
  const db = await getDB();
  const [metadata, scene] = await Promise.all([
    db.get('notes', id),
    db.get('scenes', id),
  ]);

  if (!metadata) return null;

  return {
    ...metadata,
    elements: scene?.elements || [],
    appState: scene?.appState || {},
    files: scene?.files || {},
  };
}

/**
 * Loads all notes metadata from local store, sorted by updatedAt descending.
 */
export async function loadAllNotesMetadataLocally(): Promise<NoteMetadata[]> {
  const db = await getDB();
  const notes = await db.getAll('notes');
  return notes.sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Deletes a note from local cache.
 */
export async function deleteNoteLocally(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['notes', 'scenes'], 'readwrite');
  await Promise.all([
    tx.objectStore('notes').delete(id),
    tx.objectStore('scenes').delete(id),
    tx.done,
  ]);
}

/**
 * Saves app setting / state.
 */
export async function setAppState(key: string, value: any): Promise<void> {
  const db = await getDB();
  await db.put('app_state', value, key);
}

/**
 * Retrieves app setting / state.
 */
export async function getAppState<T = any>(key: string): Promise<T | undefined> {
  const db = await getDB();
  return db.get('app_state', key);
}
