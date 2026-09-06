import React from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onChange: (query: string) => void;
  sortBy: 'updated' | 'title' | 'created';
  onSortChange: (sort: 'updated' | 'title' | 'created') => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] rounded-xl border border-[#333333] focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-cyan-500 transition-all">
      <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
      <input
        type="text"
        placeholder="Search notes..."
        value={query}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
      />
      {query && (
        <button
          onClick={() => onChange('')}
          className="p-0.5 text-slate-400 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Quick sort toggle */}
      <button
        onClick={() => {
          const nextSort = sortBy === 'updated' ? 'title' : sortBy === 'title' ? 'created' : 'updated';
          onSortChange(nextSort);
        }}
        className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-[#2d2d2d] rounded transition-colors"
        title={`Sort by: ${sortBy === 'updated' ? 'Last Edited' : sortBy === 'title' ? 'Alphabetical' : 'Date Created'}`}
      >
        <ArrowUpDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
