import { useState, useEffect, useCallback } from 'react';
import {
  getPendingSyncActions,
  removeSyncAction,
  markSyncActionFailed,
  hasPendingSyncActions,
} from '@/lib/db/sync-queue';
import { SyncStatus, SyncQueueItem } from '@/types/sync';

export function useSyncQueue() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [hasPending, setHasPending] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Check pending status
  const checkPending = useCallback(async () => {
    try {
      const pending = await hasPendingSyncActions();
      setHasPending(pending);
    } catch {
      // Ignore in SSR
    }
  }, []);

  // Process all queued items
  const processQueue = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOnline(false);
      return;
    }

    try {
      const items = await getPendingSyncActions();
      if (items.length === 0) {
        setHasPending(false);
        return;
      }

      setIsProcessing(true);

      const response = await fetch('/api/drive/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.warn('Google Drive sync paused: authorization or scope required.');
          return;
        }
        throw new Error('Batch sync failed with status ' + response.status);
      }

      const data = await response.json();
      const results: Array<{ id: string; success: boolean; error?: string }> = data.results || [];

      for (const res of results) {
        if (res.success) {
          await removeSyncAction(res.id);
        } else {
          await markSyncActionFailed(res.id, res.error || 'Sync error');
        }
      }

      await checkPending();
    } catch (err) {
      console.error('Failed to process offline sync queue:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [checkPending]);

  // Online / Offline listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      processQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkPending();
    if (navigator.onLine) {
      processQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [processQueue, checkPending]);

  return {
    isOnline,
    hasPending,
    isProcessing,
    processQueue,
    checkPending,
  };
}
