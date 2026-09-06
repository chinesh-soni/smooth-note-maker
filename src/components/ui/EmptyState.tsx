import React from 'react';
import { BookOpen, Plus, Sparkles, FileText, Grid, CheckSquare } from 'lucide-react';
import { Button } from './Button';
import { TemplateType } from '@/types/note';

interface EmptyStateProps {
  onCreateNote: (template: TemplateType) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateNote }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto p-8 text-center animate-fade-in">
      <div className="w-20 h-20 mb-6 rounded-2xl bg-cyan-950/60 flex items-center justify-center text-cyan-400 shadow-inner border border-cyan-800/40">
        <BookOpen className="w-10 h-10" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">
        Welcome to Smooth Note Maker
      </h2>
      <p className="text-slate-400 text-sm mb-8 leading-relaxed">
        Your OneNote-inspired handwritten notes and canvas library. Everything is autosaved and synced directly to your private Google Drive folder.
      </p>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <button
          onClick={() => onCreateNote('blank')}
          className="flex items-center gap-3 p-3.5 rounded-xl border border-[#333333] bg-[#222222] hover:border-cyan-500 hover:shadow-lg transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan-950/60 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">
              Blank Note
            </div>
            <div className="text-xs text-slate-400">
              Clean freeform canvas
            </div>
          </div>
        </button>

        <button
          onClick={() => onCreateNote('lined')}
          className="flex items-center gap-3 p-3.5 rounded-xl border border-[#333333] bg-[#222222] hover:border-cyan-500 hover:shadow-lg transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-950/60 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">
              Lined Paper
            </div>
            <div className="text-xs text-slate-400">
              Classic ruled notebook
            </div>
          </div>
        </button>

        <button
          onClick={() => onCreateNote('grid')}
          className="flex items-center gap-3 p-3.5 rounded-xl border border-[#333333] bg-[#222222] hover:border-cyan-500 hover:shadow-lg transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">
              Grid Graph
            </div>
            <div className="text-xs text-slate-400">
              Math & sketches
            </div>
          </div>
        </button>

        <button
          onClick={() => onCreateNote('meeting')}
          className="flex items-center gap-3 p-3.5 rounded-xl border border-[#333333] bg-[#222222] hover:border-cyan-500 hover:shadow-lg transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-950/60 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">
              Meeting Notes
            </div>
            <div className="text-xs text-slate-400">
              Agenda & action items
            </div>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#1e1e1e] px-4 py-2 rounded-full border border-[#2d2d2d]">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>Tip: All notes support handwritten stylus, pen styles, and shapes.</span>
      </div>
    </div>
  );
};
