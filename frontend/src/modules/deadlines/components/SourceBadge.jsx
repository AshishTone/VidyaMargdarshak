import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export default function SourceBadge({ sourceName, sourceUrl, lastCheckedAt }) {
  const formattedDate = lastCheckedAt
    ? new Date(lastCheckedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : 'Recently';

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
      <div className="flex items-center gap-1.5 min-w-0">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-700 shrink-0" />
        <span className="truncate">
          Source: <strong className="text-slate-700 font-medium">{sourceName}</strong>
        </span>
        <span className="text-slate-300">•</span>
        <span className="text-slate-400 shrink-0">Verified: {formattedDate}</span>
      </div>

      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 font-medium text-blue-700 hover:text-blue-900 hover:underline shrink-0"
        >
          <span>Official Portal</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
