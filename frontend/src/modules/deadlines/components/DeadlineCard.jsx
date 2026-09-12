import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import CountdownBadge from './CountdownBadge';
import SourceBadge from './SourceBadge';
import { formatDisplayDate } from '../utils/dateUtils';

export default function DeadlineCard({ deadline, onSelect }) {
  if (!deadline) return null;

  const {
    examName,
    course,
    eventType,
    title,
    eventDate,
    datePrecision,
    displayDate,
    status,
    daysRemaining,
    urgency,
    educationLevel,
    stream,
    officialSourceName,
    officialSourceUrl,
    lastCheckedAt,
    description
  } = deadline;

  const formattedDate = displayDate || formatDisplayDate(eventDate, datePrecision);

  return (
    <div
      onClick={() => onSelect && onSelect(deadline)}
      className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top Header: Exam Name + Urgency Badge */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 mb-2.5">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
              {examName}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500 mt-1">
              <span className="capitalize px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold text-[11px]">
                {course.replace(/-/g, ' ')}
              </span>
              {educationLevel && (
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                  Class {educationLevel}
                </span>
              )}
              {stream && (Array.isArray(stream) ? stream.length > 0 : stream) && (
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                  {Array.isArray(stream) ? stream.join(', ') : stream}
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 self-start">
            <CountdownBadge
              urgency={urgency}
              daysRemaining={daysRemaining}
              status={status}
            />
          </div>
        </div>

        {/* Milestone Event Box */}
        <div className="bg-slate-50 rounded-xl p-3.5 my-3 border border-slate-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-1">
            {eventType?.replace(/_/g, ' ') || 'ADMISSION MILESTONE'}
          </div>
          <div className="text-sm sm:text-base font-bold text-slate-900 mb-1.5 line-clamp-2">
            {title}
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Factual Description / Context */}
        {description && (
          <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Footer & Source Attribution */}
      <div>
        <div className="flex items-center justify-between gap-2 mt-2 mb-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect && onSelect(deadline);
            }}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
          >
            <span>View Full Details & Timeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <SourceBadge
          sourceName={officialSourceName}
          sourceUrl={officialSourceUrl}
          lastCheckedAt={lastCheckedAt}
        />
      </div>
    </div>
  );
}
