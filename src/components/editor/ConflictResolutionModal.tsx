import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ConflictInfo } from '@/types/sync';
import { formatRelativeTime, formatFullDateTime } from '@/lib/utils/date';
import { AlertTriangle, Cloud, Laptop, Copy } from 'lucide-react';

interface ConflictResolutionModalProps {
  conflict: ConflictInfo | null;
  onKeepRemote: () => void;
  onKeepLocal: () => void;
  onSaveCopy: () => void;
  onClose: () => void;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  conflict,
  onKeepRemote,
  onKeepLocal,
  onSaveCopy,
  onClose,
}) => {
  if (!conflict) return null;

  return (
    <Modal
      isOpen={Boolean(conflict)}
      onClose={onClose}
      title="Conflict Detected"
      description="This note was modified in Google Drive from another session or device."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Comparison Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Remote Card */}
          <div className="p-4 rounded-xl border border-cyan-700/60 bg-cyan-950/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-2">
                <Cloud className="w-4 h-4" />
                <span>Google Drive Version</span>
              </div>
              <p className="text-xs text-slate-400 mb-1">
                Modified: <span className="font-semibold text-slate-200">{formatFullDateTime(conflict.remoteModifiedTime)}</span>
              </p>
              <p className="text-xs text-slate-400">
                Elements: {conflict.remoteNote?.elements?.length || 0}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 text-xs"
              onClick={onKeepRemote}
            >
              Keep Drive Version
            </Button>
          </div>

          {/* Local Card */}
          <div className="p-4 rounded-xl border border-blue-700/60 bg-blue-950/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400 mb-2">
                <Laptop className="w-4 h-4" />
                <span>Current Device Version</span>
              </div>
              <p className="text-xs text-slate-400 mb-1">
                Modified: <span className="font-semibold text-slate-200">{formatFullDateTime(conflict.localUpdatedAt)}</span>
              </p>
              <p className="text-xs text-slate-400">
                Elements: {conflict.localNote?.elements?.length || 0}
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="mt-4 text-xs"
              onClick={onKeepLocal}
            >
              Overwrite Drive
            </Button>
          </div>
        </div>

        {/* Third Option: Save as Copy */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Want to keep both versions without losing changes?
          </span>
          <Button variant="secondary" size="sm" onClick={onSaveCopy} className="text-xs">
            <Copy className="w-3.5 h-3.5 mr-1" />
            Save as New Copy
          </Button>
        </div>
      </div>
    </Modal>
  );
};
