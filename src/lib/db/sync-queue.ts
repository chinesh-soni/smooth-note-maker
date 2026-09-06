import { getDB } from './indexeddb';
import { SyncQueueItem, SyncActionType } from '@/types/sync';
import { Note } from '@/types/note';
import { generateId } from '@/lib/utils/id';

/**
 * Enqueues a sync operation into the offline queue.
 */
export async function enqueueSyncAction(
  action: SyncActionType,
  noteId: string,
  payload: Partial<Note>
): Promise<SyncQueueItem> {
  const db = await getDB();
  const tx = db.transaction('sync_queue', 'readwrite');
  const store = tx.objectStore('sync_queue');

  // If there's an existing pending UPDATE for the same note, consolidate it
  if (action === 'UPDATE') {
    const existing = await store.index('by-noteId').getAll(noteId);
    const updateItem = existing.find((item) => item.action === 'UPDATE');
    if (updateItem) {
      updateItem.payload = { ...updateItem.payload, ...payload };
      updateItem.timestamp = Date.now();
      await store.put(updateItem);
      await tx.done;
      return updateItem;
    }
  }

  const item: SyncQueueItem = {
    id: generateId(),
    noteId,
    action,
    payload,
    timestamp: Date.now(),
    retryCount: 0,
  };

  await store.put(item);
  await tx.done;
  return item;
}

/**
 * Retrieves all pending sync actions sorted by timestamp.
 */
export async function getPendingSyncActions(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  const items = await db.getAllFromIndex('sync_queue', 'by-timestamp');
  return items;
}

/**
 * Removes a resolved sync action from the queue.
 */
export async function removeSyncAction(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('sync_queue', id);
}

/**
 * Updates a sync action with failure details.
 */
export async function markSyncActionFailed(id: string, error: string): Promise<void> {
  const db = await getDB();
  const item = await db.get('sync_queue', id);
  if (item) {
    item.retryCount += 1;
    item.lastError = error;
    await db.put('sync_queue', item);
  }
}

/**
 * Checks if there are any pending sync actions.
 */
export async function hasPendingSyncActions(): Promise<boolean> {
  const db = await getDB();
  const count = await db.count('sync_queue');
  return count > 0;
}
