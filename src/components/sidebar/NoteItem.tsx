import React, { useState, useRef, useEffect } from 'react';
import { NoteMetadata } from '@/types/note';
import { formatRelativeTime } from '@/lib/utils/date';
import {
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  Download,
  Cloud,
  Check,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { clsx } from 'clsx';

interface NoteItemProps {
  note: NoteMetadata;
  isActive: boolean;
  onSelect: () => void;
  onRename: (newTitle: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onExport: () => void;
}

export const NoteItem: React.FC<NoteItemProps> = ({
  note,
  isActive,
  onSelect,
  onRename,
  onDuplicate,
  onDelete,
  onExport,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [titleInput, setTitleInput] = useState(note.title);

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitleInput(note.title);
  }, [note.title]);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 185);
    }
    setIsMenuOpen((prev) => !prev);
  };

  const handleSaveRename = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (titleInput.trim()) {
      onRename(titleInput.trim());
    }
    setIsRenaming(false);
  };

  const handleCancelRename = () => {
    setTitleInput(note.title);
    setIsRenaming(false);
  };

  return (
    <div
      onClick={() => !isRenaming && onSelect()}
      className={clsx(
        'group relative flex items-start justify-between p-3 rounded-xl cursor-pointer transition-all border text-left select-none',
        isActive
          ? 'bg-[#2d2d2d] border-cyan-500/80 shadow-sm'
          : 'bg-[#252525]/80 border-[#333333] hover:bg-[#2a2a2a] hover:border-[#404040]',
        isMenuOpen ? 'z-30' : 'z-0'
      )}
    >
      {/* Active Indicator Bar (OneNote style left edge) */}
      {isActive && (
        <div className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-500 rounded-r-full shadow-sm" />
      )}

      <div className="flex-1 min-w-0 pr-2">
        {isRenaming ? (
          <form onSubmit={handleSaveRename} className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <input
              ref={inputRef}
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="w-full text-xs font-semibold px-2 py-1 bg-[#1e1e1e] border border-cyan-500 rounded text-white focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Escape') handleCancelRename();
              }}
            />
            <button
              type="submit"
              className="p-1 text-emerald-500 hover:bg-[#2d2d2d] rounded"
              title="Save"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleCancelRename}
              className="p-1 text-slate-400 hover:bg-[#2d2d2d] rounded"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <h4
                className={clsx(
                  'text-xs font-semibold truncate',
                  isActive
                    ? 'text-white font-bold'
                    : 'text-slate-300 group-hover:text-white'
                )}
              >
                {note.title || 'Untitled Note'}
              </h4>
            </div>

            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
              <span>{formatRelativeTime(note.updatedAt)}</span>
              {note.driveFileId && (
                <span className="flex items-center gap-0.5 text-cyan-400 font-normal">
                  <Cloud className="w-3 h-3" />
                  <span>Drive</span>
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* 3-Dots Menu */}
      {!isRenaming && (
        <div className="relative flex-shrink-0" ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <button
            ref={buttonRef}
            onClick={handleToggleMenu}
            className={clsx(
              'p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-[#2d2d2d] transition-opacity',
              isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'
            )}
            aria-label="Note options"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {isMenuOpen && (
            <div
              className={clsx(
                "absolute right-0 w-36 bg-[#252525] rounded-xl shadow-2xl border border-[#3d3d3d] py-1.5 z-50 animate-fade-in text-xs",
                openUpwards ? "bottom-full mb-1.5" : "top-full mt-1.5"
              )}
            >
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsRenaming(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-200 hover:bg-[#333333] hover:text-white text-left transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Rename</span>
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onDuplicate();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-200 hover:bg-[#333333] hover:text-white text-left transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Duplicate</span>
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onExport();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-200 hover:bg-[#333333] hover:text-white text-left transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Export file</span>
              </button>
              <div className="border-t border-[#333333] my-1" />
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onDelete();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 text-left transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
