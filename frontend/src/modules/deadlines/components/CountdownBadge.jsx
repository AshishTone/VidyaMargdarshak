import React from 'react';
import { getUrgencyConfig } from '../utils/dateUtils';

export default function CountdownBadge({ urgency, daysRemaining, status }) {
  const config = getUrgencyConfig(urgency, daysRemaining);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
        {config.label}
      </span>

      {status === 'tentative' ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
          🟡 Tentative
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          🟢 Confirmed
        </span>
      )}
    </div>
  );
}
