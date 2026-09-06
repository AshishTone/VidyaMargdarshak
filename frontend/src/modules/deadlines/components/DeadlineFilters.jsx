import React from 'react';
import { Filter, X } from 'lucide-react';
import { STATES, EVENT_TYPES } from '../utils/courseNormalizer';

export default function DeadlineFilters({
  filters,
  onChange,
  onReset,
  totalCount = 0,
  isTenth = false
}) {
  const hasActiveFilters = Boolean(
    filters.stream ||
    (filters.state && filters.state !== 'All India') ||
    filters.eventType
  );

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-6">
      <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-700" />
          <span className="text-sm font-bold text-slate-900">Refine Deadlines</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {totalCount} {totalCount === 1 ? 'deadline' : 'deadlines'}
          </span>
          <span className="hidden sm:inline-block text-xs font-medium text-slate-500">
            • Displaying {isTenth ? 'Class 10 (Post-SSC)' : 'Class 12 (Post-HSC)'} deadlines only
          </span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Stream / Pathway */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            {isTenth ? 'Admission Pathway' : 'Academic Stream'}
          </label>
          <select
            value={filters.stream || ''}
            onChange={(e) => onChange({ ...filters, stream: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {isTenth ? (
              <>
                <option value="">All (FYJC & Polytechnic)</option>
                <option value="fyjc">FYJC (Std. 11 Centralized Admission)</option>
                <option value="polytechnic">Polytechnic (Engineering Diploma)</option>
              </>
            ) : (
              <>
                <option value="">All Streams</option>
                <option value="PCM">PCM (Engineering & Technology)</option>
                <option value="PCB">PCB (Medicine & Pharmacy)</option>
                <option value="Commerce">Commerce (BBA, BMS, Finance)</option>
                <option value="Arts">Arts / Humanities (Law, Design)</option>
                <option value="General">Vocational / General</option>
              </>
            )}
          </select>
        </div>

        {/* State / Region */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            State / Region
          </label>
          <select
            value={filters.state || 'All India'}
            onChange={(e) => onChange({ ...filters, state: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {STATES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>

        {/* Event Type */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Event Type
          </label>
          <select
            value={filters.eventType || ''}
            onChange={(e) => onChange({ ...filters, eventType: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {EVENT_TYPES.map((ev) => (
              <option key={ev.value} value={ev.value}>
                {ev.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
