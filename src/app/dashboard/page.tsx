'use client';

import React, { useState, useCallback } from 'react';
import { useNotes } from '@/hooks/useNotes';
import { useAutosave } from '@/hooks/useAutosave';
import { useSyncQueue } from '@/hooks/useSyncQueue';
import { NoteSidebar } from '@/components/sidebar/NoteSidebar';
import { EditorHeader } from '@/components/editor/EditorHeader';
import { ExcalidrawWrapper } from '@/components/editor/ExcalidrawWrapper';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { TemplateType, Note } from '@/types/note';
import { downloadExcalidrawFile, readExcalidrawFromFile } from '@/lib/excalidraw/export';
import { Spinner } from '@/components/ui/Spinner';

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      // Closing sidebar enters full-screen clean note mode (hides overlays)
      // Opening sidebar brings back toolbars
      setIsFocusMode(!next);
      return next;
    });
  };

  const { showToast } = useToast();

  // Initialize Sync Queue
  const { isOnline, hasPending, processQueue } = useSyncQueue();

  // Initialize Notes Library
  const {
    notes,
    allNotesCount,
    activeNote,
    activeNoteId,
    isLoadingList,
    isLoadingNote,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    driveFolderId,
    refreshNotes,
    selectNote,
    createNote,
    renameNote,
    duplicateNote,
    deleteNote,
    setActiveNote,
    handleDriveFileCreated,
  } = useNotes();

  // Initialize Autosave Engine
  const {
    syncStatus,
    setSyncStatus,
    lastSavedTime,
    errorMessage,
    saveNote,
    saveNow,
    getCurrentNote,
  } = useAutosave({
    onDriveFileCreated: handleDriveFileCreated,
  });

  // Handle drawing / note changes - do not trigger root state re-renders on every mouse move
  const handleNoteChange = useCallback(
    (updatedNote: Note) => {
      saveNote(updatedNote);
    },
    [saveNote]
  );

  // Handle note creation
  const handleCreateNote = async (template: TemplateType) => {
    try {
      const newNote = await createNote(template);
      showToast(`Created "${newNote.title}"`, 'success');
      if (window.innerWidth < 640) {
        setIsSidebarOpen(false);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create note', 'error');
    }
  };

  // Handle note export
  const handleExportNote = (id?: string) => {
    const current = getCurrentNote() || activeNote;
    const target = id ? notes.find((n) => n.id === id) : current;
    if (!target) return;

    if (target.id === current?.id) {
      downloadExcalidrawFile(current);
    } else {
      selectNote(target.id).then(() => {
        const latest = getCurrentNote() || activeNote;
        if (latest) downloadExcalidrawFile(latest);
      });
    }
    showToast('Exported .excalidraw file', 'success');
  };

  // Handle note import (.excalidraw JSON)
  const handleImportNote = async (file: File) => {
    try {
      const data = await readExcalidrawFromFile(file);
      const title = file.name.replace(/\.(excalidraw|json)$/i, '');
      const newNote = await createNote('blank', title);

      const importedNote: Note = {
        ...newNote,
        elements: data.elements || [],
        appState: data.appState || {},
        files: data.files || {},
      };

      setActiveNote(importedNote);
      await saveNow(importedNote);
      showToast(`Imported "${title}" successfully`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to import file', 'error');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#1b1b1b]">
      {/* OneNote Left Sidebar */}
      <NoteSidebar
        notes={notes}
        activeNoteId={activeNoteId}
        onSelectNote={(id) => {
          selectNote(id);
          if (typeof window !== 'undefined' && window.innerWidth < 640) {
            setIsSidebarOpen(false);
          }
        }}
        onCreateNote={handleCreateNote}
        onRenameNote={renameNote}
        onDuplicateNote={duplicateNote}
        onDeleteNote={deleteNote}
        onExportNote={handleExportNote}
        onImportNote={handleImportNote}
        onRefresh={refreshNotes}
        isRefreshing={isLoadingList}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        driveFolderId={driveFolderId}
        isOpen={isSidebarOpen}
        onToggleOpen={handleToggleSidebar}
      />

      {/* Main Drawing Workspace */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <EditorHeader
          note={activeNote}
          onRename={(title) => activeNote && renameNote(activeNote.id, title)}
          onExportExcalidraw={() => handleExportNote()}
          onToggleSidebar={handleToggleSidebar}
          isSidebarOpen={isSidebarOpen}
          isFocusMode={isFocusMode}
          onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
        />

        <div className="flex-1 relative overflow-hidden bg-[#1b1b1b]">
          {isLoadingNote ? (
            <div className="flex flex-col items-center justify-center h-full bg-[#1b1b1b]">
              <Spinner size="lg" />
              <p className="mt-3 text-xs text-slate-400 font-medium">Opening blackboard note...</p>
            </div>
          ) : activeNote ? (
            <ExcalidrawWrapper
              key={activeNote.id}
              note={activeNote}
              onChange={handleNoteChange}
              zenMode={isFocusMode}
            />
          ) : (
            <EmptyState onCreateNote={handleCreateNote} />
          )}
        </div>
      </main>
    </div>
  );
}
