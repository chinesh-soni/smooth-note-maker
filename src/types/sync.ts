import { Note } from './note';

export type SyncStatus =
  | 'idle'
  | 'saving-local'
  | 'saved-local'
  | 'syncing-drive'
  | 'saved'
  | 'offline'
  | 'error'
  | 'conflict';

export type SyncActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'RENAME';

export interface SyncQueueItem {
  id: string; // queue item id
  noteId: string;
  action: SyncActionType;
  payload: Partial<Note>;
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

export interface ConflictInfo {
  noteId: string;
  localNote: Note;
  remoteNote: Note;
  remoteModifiedTime: string;
  localUpdatedAt: number;
}
