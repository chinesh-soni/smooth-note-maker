'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Note } from '@/types/note';
import { Spinner } from '@/components/ui/Spinner';

// Dynamically import Excalidraw with SSR disabled
const ExcalidrawComponent = dynamic(
  async () => {
    const mod = await import('@excalidraw/excalidraw');
    return mod.Excalidraw;
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full w-full bg-slate-50 dark:bg-slate-950">
        <Spinner size="lg" />
        <p className="mt-3 text-xs text-slate-500 font-medium">Loading canvas...</p>
      </div>
    ),
  }
);

// Static UI Options to avoid re-creating on every render
const UI_OPTIONS = {
  canvasActions: {
    changeViewBackgroundColor: true,
    clearCanvas: true,
    export: {
      saveFileToDisk: true,
    },
    loadScene: true,
    saveToActiveFile: false,
    toggleTheme: true,
  },
};

interface ExcalidrawWrapperProps {
  note: Note;
  onChange: (note: Note) => void;
}

import { sanitizeDarkStrokesToWhite } from '@/lib/excalidraw/sanitize';

// Static UI Options to avoid re-creating on every render

export const ExcalidrawWrapper: React.FC<ExcalidrawWrapperProps> = ({
  note,
  onChange,
}) => {
  const excalidrawAPIRef = useRef<any>(null);
  const activeNoteIdRef = useRef<string>(note.id);
  const isInternalChangeRef = useRef<boolean>(false);

  const noteRef = useRef<Note>(note);
  useEffect(() => {
    noteRef.current = note;
  }, [note]);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Stable API setter that doesn't trigger component re-renders
  const handleExcalidrawAPI = useCallback((api: any) => {
    excalidrawAPIRef.current = api;
    // Enforce clean OneNote black background, white pen stroke, and convert existing dark strokes
    const enforceDark = () => {
      const currentElements = api.getSceneElements() || [];
      const sanitized = sanitizeDarkStrokesToWhite(currentElements);
      api.updateScene({
        elements: sanitized,
        appState: {
          ...api.getAppState(),
          viewBackgroundColor: '#1b1b1b',
          gridSize: null,
          theme: 'dark',
          currentItemStrokeColor: '#ffffff',
        },
      });
    };

    enforceDark();
    setTimeout(enforceDark, 50);
    setTimeout(enforceDark, 150);
  }, []);

  // When active note changes from outside (switching notes in library)
  useEffect(() => {
    if (activeNoteIdRef.current !== note.id && excalidrawAPIRef.current) {
      activeNoteIdRef.current = note.id;

      const sanitized = sanitizeDarkStrokesToWhite(note.elements || []);
      excalidrawAPIRef.current.updateScene({
        elements: sanitized,
        appState: {
          ...note.appState,
          viewBackgroundColor: '#1b1b1b',
          gridSize: null,
          theme: 'dark',
          currentItemStrokeColor: '#ffffff',
          collaborators: undefined,
        },
      });

      if (note.files) {
        excalidrawAPIRef.current.addFiles(Object.values(note.files));
      }
    }
  }, [note.id]);

  // Stable change handler with 0 dependencies so Excalidraw never sees a changing prop
  const handleChange = useCallback(
    (elements: readonly any[], appState: Record<string, any>, files: Record<string, any>) => {
      const current = noteRef.current;

      const updatedNote: Note = {
        ...current,
        elements,
        appState: {
          viewBackgroundColor: '#1b1b1b',
          gridSize: null,
          theme: 'dark',
          currentItemStrokeColor: appState.currentItemStrokeColor || '#ffffff',
          zoom: appState.zoom,
          scrollX: appState.scrollX,
          scrollY: appState.scrollY,
        },
        files: files || {},
        updatedAt: Date.now(),
      };

      onChangeRef.current(updatedNote);
    },
    []
  );

  // Memoize initialData per note ID (OneNote black theme default with white strokes)
  const initialData = React.useMemo(
    () => ({
      elements: sanitizeDarkStrokesToWhite(note.elements || []),
      appState: {
        viewBackgroundColor: '#1b1b1b',
        gridSize: null,
        theme: 'dark' as const,
        currentItemStrokeColor: '#ffffff',
        zoom: note.appState?.zoom || { value: 1 },
        scrollX: note.appState?.scrollX || 0,
        scrollY: note.appState?.scrollY || 0,
      },
      files: note.files || {},
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [note.id]
  );

  return (
    <div className="w-full h-full relative excalidraw-container bg-[#1b1b1b]">
      <ExcalidrawComponent
        theme="dark"
        excalidrawAPI={handleExcalidrawAPI}
        initialData={initialData}
        onChange={handleChange}
        UIOptions={UI_OPTIONS}
      />
    </div>
  );
};
