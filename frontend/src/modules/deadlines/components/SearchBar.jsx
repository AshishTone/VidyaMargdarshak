import React, { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';

export default function SearchBar({ onSearch, initialQuery = '', isLoading = false, placeholder = '' }) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="w-full">
      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center shadow-sm rounded-2xl bg-white border-2 border-slate-200 focus-within:border-blue-600 transition-all p-1.5">
          <div className="pl-3.5 pr-2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder || "Search by exam, course, or pathway..."}
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none px-2 py-2"
          />

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs sm:text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Checking...</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <span>Find Deadlines</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
