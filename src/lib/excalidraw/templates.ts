import { TemplateType, Note } from '@/types/note';
import { generateId } from '@/lib/utils/id';

/**
 * Generates elements and initial state for various templates.
 */
export function createTemplateNote(type: TemplateType, title?: string): Partial<Note> {
  const noteId = generateId();
  const now = Date.now();

  let elements: any[] = [];
  let appState: Record<string, any> = {
    viewBackgroundColor: '#121212',
    theme: 'dark',
    currentItemStrokeColor: '#ffffff',
  };

  switch (type) {
    case 'lined':
      appState.viewBackgroundColor = '#121212';
      elements = createLinedPaperElements();
      break;

    case 'grid':
      appState.viewBackgroundColor = '#121212';
      appState.gridSize = null;
      elements = createGridElements();
      break;

    case 'meeting':
      appState.viewBackgroundColor = '#121212';
      elements = createMeetingNotesElements();
      break;

    case 'brainstorm':
      appState.viewBackgroundColor = '#121212';
      elements = createBrainstormElements();
      break;

    case 'blank':
    default:
      appState.viewBackgroundColor = '#121212';
      elements = [];
      break;
  }

  const defaultTitles: Record<TemplateType, string> = {
    blank: 'Untitled Note',
    lined: 'Lined Notebook Page',
    grid: 'Grid Graph Note',
    meeting: 'Meeting Minutes',
    brainstorm: 'Brainstorm & Ideas',
  };

  return {
    id: noteId,
    title: title || defaultTitles[type] || 'Untitled Note',
    createdAt: now,
    updatedAt: now,
    version: 1,
    elements,
    appState,
    files: {},
    isPinned: false,
    tags: [type !== 'blank' ? type : 'general'],
  };
}

function createLinedPaperElements(): any[] {
  const lines: any[] = [];
  // Title rule
  lines.push({
    id: 'header_line',
    type: 'line',
    x: 40,
    y: 90,
    width: 800,
    height: 0,
    points: [[0, 0], [800, 0]],
    strokeColor: '#f43f5e', // red margin/header line
    backgroundColor: 'transparent',
    fillStyle: 'hachure',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 0,
    opacity: 60,
    groupIds: ['paper_lines'],
    locked: true,
  });

  // Notebook horizontal lines
  for (let y = 140; y <= 1000; y += 40) {
    lines.push({
      id: `line_${y}`,
      type: 'line',
      x: 40,
      y,
      width: 800,
      height: 0,
      points: [[0, 0], [800, 0]],
      strokeColor: '#334155', // chalk slate ruled lines
      backgroundColor: 'transparent',
      fillStyle: 'hachure',
      strokeWidth: 1,
      strokeStyle: 'solid',
      roughness: 0,
      opacity: 70,
      groupIds: ['paper_lines'],
      locked: true,
    });
  }

  return lines;
}

function createGridElements(): any[] {
  // Grid note header text
  return [
    {
      id: 'grid_header',
      type: 'text',
      x: 60,
      y: 40,
      width: 250,
      height: 30,
      text: '📐 Engineering & Math Notes',
      fontSize: 20,
      fontFamily: 1,
      textAlign: 'left',
      verticalAlign: 'top',
      strokeColor: '#f8fafc',
      backgroundColor: 'transparent',
      roughness: 0,
      opacity: 100,
      locked: false,
    },
  ];
}

function createMeetingNotesElements(): any[] {
  const nowStr = new Date().toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return [
    {
      id: 'm_title',
      type: 'text',
      x: 60,
      y: 40,
      width: 400,
      height: 40,
      text: `📝 Meeting Notes - ${nowStr}`,
      fontSize: 24,
      fontFamily: 1,
      strokeColor: '#f8fafc', // bright chalk title
      locked: false,
    },
    {
      id: 'box_agenda',
      type: 'rectangle',
      x: 60,
      y: 100,
      width: 380,
      height: 220,
      strokeColor: '#8b5cf6',
      backgroundColor: '#1e1b4b',
      fillStyle: 'solid',
      strokeWidth: 2,
      roughness: 1,
      roundness: { type: 3 },
      locked: false,
    },
    {
      id: 'txt_agenda',
      type: 'text',
      x: 80,
      y: 115,
      width: 340,
      height: 180,
      text: '📌 Agenda & Discussion\n\n• Topic 1:\n• Topic 2:\n• Key Takeaways:',
      fontSize: 16,
      fontFamily: 1,
      strokeColor: '#f8fafc',
      locked: false,
    },
    {
      id: 'box_actions',
      type: 'rectangle',
      x: 480,
      y: 100,
      width: 380,
      height: 220,
      strokeColor: '#10b981',
      backgroundColor: '#022c22',
      fillStyle: 'solid',
      strokeWidth: 2,
      roughness: 1,
      roundness: { type: 3 },
      locked: false,
    },
    {
      id: 'txt_actions',
      type: 'text',
      x: 500,
      y: 115,
      width: 340,
      height: 180,
      text: '✅ Action Items\n\n[ ] Task 1 (Assignee)\n[ ] Task 2 (Assignee)\n[ ] Next sync date:',
      fontSize: 16,
      fontFamily: 1,
      strokeColor: '#f8fafc',
      locked: false,
    },
  ];
}

function createBrainstormElements(): any[] {
  return [
    {
      id: 'b_center',
      type: 'ellipse',
      x: 350,
      y: 200,
      width: 200,
      height: 120,
      strokeColor: '#a855f7',
      backgroundColor: '#2e1065',
      fillStyle: 'solid',
      strokeWidth: 2,
      roughness: 1,
      locked: false,
    },
    {
      id: 'b_center_txt',
      type: 'text',
      x: 385,
      y: 245,
      width: 130,
      height: 30,
      text: '💡 Central Idea',
      fontSize: 20,
      fontFamily: 1,
      strokeColor: '#f8fafc',
      locked: false,
    },
  ];
}
