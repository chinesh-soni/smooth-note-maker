'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Note } from '@/types/note';
import { Spinner } from '@/components/ui/Spinner';
import { sanitizeElementsForDarkTheme } from '@/lib/excalidraw/sanitize';

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
  zenMode?: boolean;
}

export const ExcalidrawWrapper: React.FC<ExcalidrawWrapperProps> = ({
  note,
  onChange,
  zenMode = false,
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
    // Enforce Excalidraw dark theme (#ffffff viewBackgroundColor inverts to solid #121212 dark, stroke #1e1e1e inverts to white ink)
    const enforceDark = () => {
      const currentElements = api.getSceneElements() || [];
      const sanitized = sanitizeElementsForDarkTheme(currentElements);
      api.updateScene({
        elements: sanitized,
        appState: {
          ...api.getAppState(),
          viewBackgroundColor: '#ffffff',
          gridSize: null,
          theme: 'dark',
          currentItemStrokeColor: '#1e1e1e',
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

      const sanitized = sanitizeElementsForDarkTheme(note.elements || []);
      excalidrawAPIRef.current.updateScene({
        elements: sanitized,
        appState: {
          ...note.appState,
          viewBackgroundColor: '#ffffff',
          gridSize: null,
          theme: 'dark',
          currentItemStrokeColor: '#1e1e1e',
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
          viewBackgroundColor: '#ffffff',
          gridSize: null,
          theme: 'dark',
          currentItemStrokeColor: appState.currentItemStrokeColor || '#1e1e1e',
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

  // Memoize initialData per note ID (Native dark theme: viewBackgroundColor #ffffff -> #121212, stroke #1e1e1e -> crisp white)
  const initialData = React.useMemo(
    () => ({
      elements: sanitizeElementsForDarkTheme(note.elements || []),
      appState: {
        viewBackgroundColor: '#ffffff',
        gridSize: null,
        theme: 'dark' as const,
        currentItemStrokeColor: '#1e1e1e',
        zoom: note.appState?.zoom || { value: 1 },
        scrollX: note.appState?.scrollX || 0,
        scrollY: note.appState?.scrollY || 0,
      },
      files: note.files || {},
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [note.id]
  );

  // Floating HUD when tool changes via shortcut
  const [toolHud, setToolHud] = useState<{ label: string; icon: string; shortcut: string } | null>(null);
  const toolHudTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToolHud = useCallback((label: string, icon: string, shortcut: string) => {
    if (toolHudTimerRef.current) clearTimeout(toolHudTimerRef.current);
    setToolHud({ label, icon, shortcut });
    toolHudTimerRef.current = setTimeout(() => {
      setToolHud(null);
    }, 1200);
  }, []);

  // Bulletproof global keyboard shortcut listener for tools
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in any text inputs or Excalidraw's inline text editor
      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable ||
        target?.closest('.excalidraw-wysiwyg') ||
        target?.classList.contains('excalidraw-wysiwyg')
      ) {
        return;
      }

      // Ignore if modifier keys like Ctrl, Cmd, Alt are pressed
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      const key = e.key.toLowerCase();
      const TOOL_MAP: Record<string, { type: any; label: string; icon: string; shortcut: string }> = {
        '1': { type: 'selection', label: 'Selection', icon: '👆', shortcut: '1 / V' },
        'v': { type: 'selection', label: 'Selection', icon: '👆', shortcut: '1 / V' },
        '2': { type: 'rectangle', label: 'Rectangle', icon: '🔲', shortcut: '2 / R' },
        'r': { type: 'rectangle', label: 'Rectangle', icon: '🔲', shortcut: '2 / R' },
        '3': { type: 'diamond', label: 'Diamond', icon: '🔷', shortcut: '3 / D' },
        'd': { type: 'diamond', label: 'Diamond', icon: '🔷', shortcut: '3 / D' },
        '4': { type: 'ellipse', label: 'Ellipse', icon: '⭕', shortcut: '4 / O' },
        'o': { type: 'ellipse', label: 'Ellipse', icon: '⭕', shortcut: '4 / O' },
        '5': { type: 'arrow', label: 'Arrow', icon: '➡️', shortcut: '5 / A' },
        'a': { type: 'arrow', label: 'Arrow', icon: '➡️', shortcut: '5 / A' },
        '6': { type: 'line', label: 'Line', icon: '📏', shortcut: '6 / L' },
        'l': { type: 'line', label: 'Line', icon: '📏', shortcut: '6 / L' },
        '7': { type: 'freedraw', label: 'Draw / Pen', icon: '✏️', shortcut: '7 / P' },
        'p': { type: 'freedraw', label: 'Draw / Pen', icon: '✏️', shortcut: '7 / P' },
        'x': { type: 'freedraw', label: 'Draw / Pen', icon: '✏️', shortcut: '7 / P' },
        '8': { type: 'text', label: 'Text', icon: '🅰️', shortcut: '8 / T' },
        't': { type: 'text', label: 'Text', icon: '🅰️', shortcut: '8 / T' },
        '9': { type: 'image', label: 'Image', icon: '🖼️', shortcut: '9' },
        '0': { type: 'eraser', label: 'Eraser', icon: '🧹', shortcut: '0 / E' },
        'e': { type: 'eraser', label: 'Eraser', icon: '🧹', shortcut: '0 / E' },
        'h': { type: 'hand', label: 'Hand / Pan', icon: '✋', shortcut: 'H' },
      };

      if (key === 'q') {
        e.preventDefault();
        if (excalidrawAPIRef.current) {
          const appState = excalidrawAPIRef.current.getAppState();
          const locked = !appState.activeTool?.locked;
          excalidrawAPIRef.current.setActiveTool({
            ...appState.activeTool,
            locked,
          });
          showToolHud(locked ? 'Tool Locked' : 'Tool Unlocked', locked ? '🔒' : '🔓', 'Q');
        }
        return;
      }

      const match = TOOL_MAP[key];
      if (match && excalidrawAPIRef.current) {
        e.preventDefault();
        excalidrawAPIRef.current.setActiveTool({ type: match.type });
        showToolHud(match.label, match.icon, match.shortcut);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showToolHud]);

  // Keep Excalidraw's internal zenMode state in sync
  useEffect(() => {
    if (excalidrawAPIRef.current) {
      excalidrawAPIRef.current.updateScene({
        appState: {
          ...excalidrawAPIRef.current.getAppState(),
          zenModeEnabled: zenMode,
        },
      });
    }
  }, [zenMode]);

  return (
    <div
      className="w-full h-full relative excalidraw-container bg-[#121212]"
      data-focus-mode={zenMode ? 'true' : 'false'}
    >
      {/* Floating HUD feedback indicator for active tool */}
      {toolHud && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-fade-in flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1e1e1e]/90 backdrop-blur-md border border-[#383838] shadow-2xl text-white text-xs font-semibold">
          <span className="text-sm">{toolHud.icon}</span>
          <span>{toolHud.label}</span>
          <span className="text-[10px] text-cyan-300 bg-[#2a2a2a] px-1.5 py-0.5 rounded font-mono border border-[#444]">
            {toolHud.shortcut}
          </span>
        </div>
      )}

      <ExcalidrawComponent
        theme="dark"
        zenModeEnabled={zenMode}
        handleKeyboardGlobally={true}
        autoFocus={true}
        excalidrawAPI={handleExcalidrawAPI}
        initialData={initialData}
        onChange={handleChange}
        UIOptions={UI_OPTIONS}
      />
    </div>
  );
};
