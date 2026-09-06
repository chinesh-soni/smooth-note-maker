import React, { useState, useRef } from 'react';
import { NoteMetadata, TemplateType } from '@/types/note';
import { NoteList } from './NoteList';
import { SearchBar } from './SearchBar';
import { UserMenu } from '@/components/auth/UserMenu';
import {
  Plus,
  ChevronDown,
  FileText,
  Grid,
  CheckSquare,
  Sparkles,
  RefreshCw,
  FolderOpen,
  Upload,
  BookOpen,
  PanelLeftClose,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NoteSidebarProps {
  notes: NoteMetadata[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: (template: TemplateType) => void;
  onRenameNote: (id: string, newTitle: string) => void;
  onDuplicateNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onExportNote: (id: string) => void;
  onImportNote: (file: File) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: 'updated' | 'title' | 'created';
  onSortChange: (sort: 'updated' | 'title' | 'created') => void;
  driveFolderId?: string | null;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const NoteSidebar: React.FC<NoteSidebarProps> = ({
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  onRenameNote,
  onDuplicateNote,
  onDeleteNote,
  onExportNote,
  onImportNote,
  onRefresh,
  isRefreshing,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  driveFolderId,
  isOpen,
  onToggleOpen,
}) => {
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportNote(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-72 sm:w-80 bg-slate-50/95 dark:bg-slate-950/95 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out sm:static sm:translate-x-0 ${
        isOpen ? 'translate-x-0 shadow-2xl sm:shadow-none' : '-translate-x-full'
      }`}
    >
      {/* Top Header: App Branding */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
              Smooth Note Maker
            </h1>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
              OneNote Edition
            </span>
          </div>
        </div>

        <button
          onClick={onToggleOpen}
          className="sm:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          <PanelLeftClose className="w-5 h-5" />
        </button>
      </div>

      {/* Action Bar: New Note & Templates */}
      <div className="p-3 border-b border-slate-200/60 dark:border-slate-800/60 space-y-2.5">
        <div className="relative">
          <div className="flex rounded-xl shadow-sm overflow-hidden border border-purple-600/30">
            <button
              onClick={() => onCreateNote('blank')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-700 hover:bg-purple-800 text-white font-medium text-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Note</span>
            </button>
            <button
              onClick={() => setShowTemplateMenu(!showTemplateMenu)}
              className="px-2.5 bg-purple-800 hover:bg-purple-900 text-white border-l border-purple-600/40 transition-colors"
              title="Note Templates"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Template Dropdown Menu */}
          {showTemplateMenu && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-1.5 z-40 animate-fade-in text-xs space-y-0.5">
              <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Create from Template
              </div>
              <button
                onClick={() => {
                  onCreateNote('blank');
                  setShowTemplateMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 text-left"
              >
                <Plus className="w-3.5 h-3.5 text-purple-600" />
                <span>Blank Canvas</span>
              </button>
              <button
                onClick={() => {
                  onCreateNote('lined');
                  setShowTemplateMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 text-left"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Lined Notebook Paper</span>
              </button>
              <button
                onClick={() => {
                  onCreateNote('grid');
                  setShowTemplateMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 text-left"
              >
                <Grid className="w-3.5 h-3.5 text-emerald-600" />
                <span>Grid Math Graph</span>
              </button>
              <button
                onClick={() => {
                  onCreateNote('meeting');
                  setShowTemplateMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 text-left"
              >
                <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>Meeting Notes</span>
              </button>
              <button
                onClick={() => {
                  onCreateNote('brainstorm');
                  setShowTemplateMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 text-left"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Brainstorm Mindmap</span>
              </button>
            </div>
          )}
        </div>

        {/* Search & Sort */}
        <SearchBar
          query={searchQuery}
          onChange={onSearchChange}
          sortBy={sortBy}
          onSortChange={onSortChange}
        />
      </div>

      {/* Note List Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Notes ({notes.length})
          </span>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1 rounded text-slate-400 hover:text-purple-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Refresh notes from Google Drive"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-purple-600' : ''}`} />
          </button>
        </div>

        <NoteList
          notes={notes}
          activeNoteId={activeNoteId}
          onSelectNote={onSelectNote}
          onRenameNote={onRenameNote}
          onDuplicateNote={onDuplicateNote}
          onDeleteNote={onDeleteNote}
          onExportNote={onExportNote}
        />
      </div>

      {/* Import File Button */}
      <div className="px-3 py-2 border-t border-slate-200/60 dark:border-slate-800/60">
        <input
          ref={fileInputRef}
          type="file"
          accept=".excalidraw,.json"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 text-slate-600 dark:text-slate-400 hover:text-purple-700 dark:hover:text-purple-300 text-xs font-medium transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Import .excalidraw</span>
        </button>
      </div>

      {/* Bottom User Profile & Drive Info */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 flex items-center justify-between">
        <UserMenu driveFolderId={driveFolderId} />
      </div>
    </aside>
  );
};
