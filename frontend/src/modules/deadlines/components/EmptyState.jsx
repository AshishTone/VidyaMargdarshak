import React from 'react';
import { CalendarX, ShieldAlert, ExternalLink, RefreshCw } from 'lucide-react';

export default function EmptyState({
  title = "No official deadlines currently found",
  message = "Conducting authorities have not yet announced upcoming dates for this category, or dates are currently being finalized.",
  officialSources = [],
  onRefresh = null,
  isRefreshing = false
}) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center max-w-2xl mx-auto my-8 shadow-sm">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-100">
        <CalendarX className="w-7 h-7" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
        {message}
      </p>

      {officialSources && officialSources.length > 0 && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-left mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            <ShieldAlert className="w-4 h-4 text-blue-700" />
            <span>Checked Official Portals Directly</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            You can verify latest updates directly on the official portals:
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {officialSources.slice(0, 5).map((src, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800 pr-2 truncate">{src.name}</span>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center gap-1 shrink-0"
                >
                  <span>Check Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs tracking-wide shadow-md transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing from Official Sources...' : 'Check Official Sources Again'}</span>
        </button>
      )}
    </div>
  );
}
