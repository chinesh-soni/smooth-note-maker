import React, { useState, useEffect, useRef } from 'react';
import { Note } from '@/types/note';
import { SyncStatus } from '@/types/sync';
import { SyncBadge } from '@/components/ui/SyncBadge';
import { Button } from '@/components/ui/Button';
import {
  PanelLeft,
  Download,
  Save,
  Check,
  X,
  Edit2,
  FileImage,
  Share2,
} from 'lucide-react';

interface EditorHeaderProps {
  note: Note | null;
  syncStatus: SyncStatus;
  lastSavedTime: number | null;
  errorMessage: string | null;
  onSaveNow: () => void;
  onRename: (newTitle: string) => void;
  onExportExcalidraw: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  note,
  syncStatus,
  lastSavedTime,
  errorMessage,
  onSaveNow,
  onRename,
  onExportExcalidraw,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(note?.title || '');
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (note) {
      setTitleInput(note.title);
    }
  }, [note?.title]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleSaveTitle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (titleInput.trim() && note && titleInput.trim() !== note.title) {
      onRename(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between gap-4 select-none z-20">
      {/* Left: Sidebar Toggle & Note Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        {note ? (
          <div className="flex items-center gap-2 min-w-0">
            {isEditingTitle ? (
              <form onSubmit={handleSaveTitle} className="flex items-center gap-1">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="text-sm font-semibold px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-purple-500 rounded-md focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setTitleInput(note.title);
                      setIsEditingTitle(false);
                    }
                  }}
                />
                <button
                  type="submit"
                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTitleInput(note.title);
                    setIsEditingTitle(false);
                  }}
                  className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div
                onClick={() => setIsEditingTitle(true)}
                className="group flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs md:max-w-sm">
                  {note.title || 'Untitled Note'}
                </h2>
                <Edit2 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        ) : (
          <span className="text-sm font-medium text-slate-400">No active note</span>
        )}
      </div>

      {/* Right: Sync Status & Action Buttons */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {note && (
          <SyncBadge
            status={syncStatus}
            lastSavedTime={lastSavedTime}
            errorMessage={errorMessage}
            onRetry={onSaveNow}
          />
        )}

        {note && (
          <>
            <button
              onClick={onExportExcalidraw}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Export as .excalidraw file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <Button
              size="sm"
              variant="outline"
              onClick={onSaveNow}
              disabled={syncStatus === 'syncing-drive'}
              className="text-xs"
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              <span>Save Now</span>
            </Button>
          </>
        )}
      </div>
    </header>
  );
};
