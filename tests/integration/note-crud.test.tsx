import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NoteList } from '@/components/sidebar/NoteList';
import { createTemplateNote } from '@/lib/excalidraw/templates';
import { NoteMetadata } from '@/types/note';

describe('Note Library CRUD Operations', () => {
  const sampleNotes: NoteMetadata[] = [
    {
      id: 'note-1',
      title: 'Physics Lecture Notes',
      createdAt: 1700000000000,
      updatedAt: 1700000010000,
      driveFileId: 'drive-file-1',
      version: 1,
    },
    {
      id: 'note-2',
      title: 'Sprint Planning Diagram',
      createdAt: 1700000020000,
      updatedAt: 1700000030000,
      driveFileId: null,
      version: 1,
    },
  ];

  it('should generate valid template notes for all supported templates', () => {
    const blank = createTemplateNote('blank');
    expect(blank.title).toBe('Untitled Note');
    expect(blank.elements?.length).toBe(0);

    const lined = createTemplateNote('lined');
    expect(lined.title).toBe('Lined Notebook Page');
    expect(lined.elements!.length).toBeGreaterThan(5);

    const grid = createTemplateNote('grid');
    expect(grid.title).toBe('Grid Graph Note');
    expect(grid.appState?.gridSize).toBe(20);

    const meeting = createTemplateNote('meeting');
    expect(meeting.title).toBe('Meeting Minutes');
    expect(meeting.elements!.some((el) => el.id === 'box_agenda')).toBe(true);

    const brainstorm = createTemplateNote('brainstorm');
    expect(brainstorm.title).toBe('Brainstorm & Ideas');
  });

  it('should render notes in NoteList and trigger select on click', () => {
    const onSelectNote = vi.fn();
    const onRenameNote = vi.fn();
    const onDuplicateNote = vi.fn();
    const onDeleteNote = vi.fn();
    const onExportNote = vi.fn();

    render(
      <NoteList
        notes={sampleNotes}
        activeNoteId="note-1"
        onSelectNote={onSelectNote}
        onRenameNote={onRenameNote}
        onDuplicateNote={onDuplicateNote}
        onDeleteNote={onDeleteNote}
        onExportNote={onExportNote}
      />
    );

    expect(screen.getByText('Physics Lecture Notes')).toBeInTheDocument();
    expect(screen.getByText('Sprint Planning Diagram')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Sprint Planning Diagram'));
    expect(onSelectNote).toHaveBeenCalledWith('note-2');
  });

  it('should trigger delete confirmation modal when delete is requested', async () => {
    const onDeleteNote = vi.fn();

    render(
      <NoteList
        notes={sampleNotes}
        activeNoteId="note-1"
        onSelectNote={vi.fn()}
        onRenameNote={vi.fn()}
        onDuplicateNote={vi.fn()}
        onDeleteNote={onDeleteNote}
        onExportNote={vi.fn()}
      />
    );

    // Open options menu for the first note
    const menuButtons = screen.getAllByLabelText('Note options');
    fireEvent.click(menuButtons[0]);

    // Click delete option in menu
    const deleteBtn = screen.getByText('Delete');
    fireEvent.click(deleteBtn);

    // Confirmation modal should appear
    expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();

    // Confirm deletion
    const confirmDeleteBtn = screen.getByRole('button', { name: /^Delete$/i });
    fireEvent.click(confirmDeleteBtn);

    expect(onDeleteNote).toHaveBeenCalledWith('note-1');
  });
});
