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
    viewBackgroundColor: '#ffffff',
    theme: 'light',
  };

  switch (type) {
    case 'lined':
      appState.viewBackgroundColor = '#fdfbf7'; // warm paper tone
      elements = createLinedPaperElements();
      break;

    case 'grid':
      appState.viewBackgroundColor = '#f8fafc';
      appState.gridSize = 20;
      elements = createGridElements();
      break;

    case 'meeting':
      elements = createMeetingNotesElements();
      break;

    case 'brainstorm':
      elements = createBrainstormElements();
      break;

    case 'blank':
    default:
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
      strokeColor: '#93c5fd', // light blue ruled lines
      backgroundColor: 'transparent',
      fillStyle: 'hachure',
      strokeWidth: 1,
      strokeStyle: 'solid',
      roughness: 0,
      opacity: 50,
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
      strokeColor: '#1e293b',
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
      strokeColor: '#6220b3', // OneNote purple
      locked: false,
    },
    {
      id: 'box_agenda',
      type: 'rectangle',
      x: 60,
      y: 100,
      width: 380,
      height: 220,
      strokeColor: '#6220b3',
      backgroundColor: '#f5f3ff',
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
      strokeColor: '#1e293b',
      locked: false,
    },
    {
      id: 'box_actions',
      type: 'rectangle',
      x: 480,
      y: 100,
      width: 380,
      height: 220,
      strokeColor: '#059669',
      backgroundColor: '#ecfdf5',
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
      strokeColor: '#064e3b',
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
      strokeColor: '#6220b3',
      backgroundColor: '#f5f3ff',
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
      strokeColor: '#6220b3',
      locked: false,
    },
  ];
}
