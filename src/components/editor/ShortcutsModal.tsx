import React from 'react';
import { Modal } from '@/components/ui/Modal';
import {
  PenTool,
  Type,
  Eraser,
  MousePointer,
  Square,
  Diamond,
  Circle,
  ArrowRight,
  Minus,
  Image,
  Hand,
  Lock,
  RotateCcw,
  RotateCw,
  Trash2,
  Copy,
  PanelLeft,
  Eye,
  ZoomIn,
} from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  icon?: React.ReactNode;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  const toolShortcuts: ShortcutItem[] = [
    { keys: ['7', 'P'], description: 'Draw / Pen (Freedraw)', icon: <PenTool className="w-3.5 h-3.5 text-purple-400" /> },
    { keys: ['8', 'T'], description: 'Text Tool', icon: <Type className="w-3.5 h-3.5 text-blue-400" /> },
    { keys: ['0', 'E'], description: 'Eraser', icon: <Eraser className="w-3.5 h-3.5 text-pink-400" /> },
    { keys: ['1', 'V'], description: 'Selection Arrow', icon: <MousePointer className="w-3.5 h-3.5 text-cyan-400" /> },
    { keys: ['2', 'R'], description: 'Rectangle', icon: <Square className="w-3.5 h-3.5 text-emerald-400" /> },
    { keys: ['3', 'D'], description: 'Diamond', icon: <Diamond className="w-3.5 h-3.5 text-amber-400" /> },
    { keys: ['4', 'O'], description: 'Ellipse / Circle', icon: <Circle className="w-3.5 h-3.5 text-orange-400" /> },
    { keys: ['5', 'A'], description: 'Arrow', icon: <ArrowRight className="w-3.5 h-3.5 text-indigo-400" /> },
    { keys: ['6', 'L'], description: 'Line', icon: <Minus className="w-3.5 h-3.5 text-teal-400" /> },
    { keys: ['9'], description: 'Insert Image', icon: <Image className="w-3.5 h-3.5 text-emerald-400" /> },
    { keys: ['H'], description: 'Hand / Pan Canvas', icon: <Hand className="w-3.5 h-3.5 text-yellow-400" /> },
    { keys: ['Q'], description: 'Toggle Tool Lock (Stay in mode)', icon: <Lock className="w-3.5 h-3.5 text-rose-400" /> },
  ];

  const viewShortcuts: ShortcutItem[] = [
    { keys: ['Ctrl', 'B'], description: 'Toggle Notebooks Sidebar', icon: <PanelLeft className="w-3.5 h-3.5 text-cyan-400" /> },
    { keys: ['Alt', 'Z'], description: 'Toggle Clean Canvas (Hide / Show Overlays)', icon: <Eye className="w-3.5 h-3.5 text-indigo-400" /> },
    { keys: ['Space', 'Drag'], description: 'Pan Canvas', icon: <Hand className="w-3.5 h-3.5 text-yellow-400" /> },
    { keys: ['Ctrl', '+ / -'], description: 'Zoom In / Out', icon: <ZoomIn className="w-3.5 h-3.5 text-slate-400" /> },
    { keys: ['Shift', '1'], description: 'Zoom to Fit All Elements', icon: <ZoomIn className="w-3.5 h-3.5 text-slate-400" /> },
  ];

  const editShortcuts: ShortcutItem[] = [
    { keys: ['Ctrl', 'Z'], description: 'Undo Last Action', icon: <RotateCcw className="w-3.5 h-3.5 text-slate-400" /> },
    { keys: ['Ctrl', 'Y'], description: 'Redo', icon: <RotateCw className="w-3.5 h-3.5 text-slate-400" /> },
    { keys: ['Delete'], description: 'Delete Selected', icon: <Trash2 className="w-3.5 h-3.5 text-rose-400" /> },
    { keys: ['Ctrl', 'D'], description: 'Duplicate Selected', icon: <Copy className="w-3.5 h-3.5 text-cyan-400" /> },
    { keys: ['Esc'], description: 'Cancel / Deselect', icon: <span className="text-xs text-slate-400">Esc</span> },
  ];

  const renderSection = (title: string, items: ShortcutItem[]) => (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 rounded-lg bg-[#222] border border-[#333] hover:border-[#444] transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0 pr-2">
              {item.icon}
              <span className="text-xs text-slate-200 truncate">{item.description}</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {item.keys.map((k, kIdx) => (
                <kbd
                  key={kIdx}
                  className="px-2 py-0.5 text-[11px] font-mono font-bold text-cyan-300 bg-[#161616] border border-[#3d3d3d] rounded shadow-sm"
                >
                  {k}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      description="Quickly switch tools and navigate without touching floating menus"
      maxWidth="lg"
    >
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        {renderSection('Drawing & Shape Tools', toolShortcuts)}
        {renderSection('Sidebar & View Controls', viewShortcuts)}
        {renderSection('Editing & History', editShortcuts)}
      </div>
    </Modal>
  );
};
