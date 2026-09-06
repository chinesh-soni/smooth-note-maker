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
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 focus-within:ring-2 focus-within:ring-purple-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
      <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
      <input
        type="text"
        placeholder="Search notes..."
        value={query}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
      />
      {query && (
        <button
          onClick={() => onChange('')}
          className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
        className="p-1 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
        title={`Sort by: ${sortBy === 'updated' ? 'Last Edited' : sortBy === 'title' ? 'Alphabetical' : 'Date Created'}`}
      >
        <ArrowUpDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
