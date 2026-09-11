import React, { useState } from 'react';
import { NoteMetadata } from '@/types/note';
import { NoteItem } from './NoteItem';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { SearchX } from 'lucide-react';

interface NoteListProps {
  notes: NoteMetadata[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onRenameNote: (id: string, newTitle: string) => void;
  onDuplicateNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onExportNote: (id: string) => void;
}

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  activeNoteId,
  onSelectNote,
  onRenameNote,
  onDuplicateNote,
  onDeleteNote,
  onExportNote,
}) => {
  const [deletingNote, setDeletingNote] = useState<NoteMetadata | null>(null);

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <SearchX className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-xs">No notes found</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {notes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            isActive={note.id === activeNoteId}
            onSelect={() => onSelectNote(note.id)}
            onRename={(newTitle) => onRenameNote(note.id, newTitle)}
            onDuplicate={() => onDuplicateNote(note.id)}
            onDelete={() => setDeletingNote(note)}
            onExport={() => onExportNote(note.id)}
          />
        ))}
      </div>

      <DeleteConfirmModal
        isOpen={Boolean(deletingNote)}
        onClose={() => setDeletingNote(null)}
        onConfirm={() => {
          if (deletingNote) {
            onDeleteNote(deletingNote.id);
            setDeletingNote(null);
          }
        }}
        noteTitle={deletingNote?.title || 'Note'}
      />
    </>
  );
};
