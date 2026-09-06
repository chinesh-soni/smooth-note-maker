import React from 'react';
import { SyncStatus } from '@/types/sync';
import { Cloud, CloudOff, RefreshCw, AlertTriangle, Check } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/date';

interface SyncBadgeProps {
  status: SyncStatus;
  lastSavedTime?: number | null;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export const SyncBadge: React.FC<SyncBadgeProps> = ({
  status,
  lastSavedTime,
  errorMessage,
  onRetry,
}) => {
  switch (status) {
    case 'saving-local':
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-800 animate-pulse">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Saving locally...</span>
        </div>
      );

    case 'saved-local':
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700">
          <Cloud className="w-3.5 h-3.5" />
          <span>Saved locally</span>
        </div>
      );

    case 'syncing-drive':
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-purple-700 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-800">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Syncing to Google Drive...</span>
        </div>
      );

    case 'saved':
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
          <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Saved {lastSavedTime ? `(${formatRelativeTime(lastSavedTime)})` : ''}</span>
        </div>
      );

    case 'offline':
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-800 bg-amber-100 dark:bg-amber-900/50 dark:text-amber-200 rounded-full border border-amber-300 dark:border-amber-700">
          <CloudOff className="w-3.5 h-3.5" />
          <span>Offline changes pending</span>
        </div>
      );

    case 'conflict':
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 rounded-full border border-rose-200 dark:border-rose-800">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Conflict detected</span>
        </div>
      );

    case 'error':
      return (
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300 rounded-full border border-red-200 dark:border-red-800 cursor-pointer hover:bg-red-100 transition-colors"
          onClick={onRetry}
          title={errorMessage || 'Click to retry sync'}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Sync failed (Retry)</span>
        </div>
      );

    case 'idle':
    default:
      return null;
  }
};
