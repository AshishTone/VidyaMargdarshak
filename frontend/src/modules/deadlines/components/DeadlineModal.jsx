import React from 'react';
import { X, Calendar, ShieldCheck, ExternalLink, School, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import CountdownBadge from './CountdownBadge';
import { formatDisplayDate } from '../utils/dateUtils';

export default function DeadlineModal({ deadline, onClose }) {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70 rounded-t-2xl">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                {course.replace(/-/g, ' ')}
              </span>
              <CountdownBadge
                urgency={urgency}
                daysRemaining={daysRemaining}
                status={status}
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {examName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Milestone Highlight Banner */}
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-4 sm:p-5 border border-blue-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-1">
              Admission Milestone Event
            </div>
            <div className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
              {title}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-semibold text-blue-950">
              <Calendar className="w-5 h-5 text-blue-700 shrink-0" />
              <span>{formattedDate}</span>
              {status === 'tentative' && (
                <span className="text-xs font-normal text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  Tentative / Subject to official confirmation
                </span>
              )}
            </div>
          </div>

          {/* Quick Specifications Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase mb-1">
                <School className="w-4 h-4 text-blue-700" />
                <span>Conducting Authority</span>
              </div>
              <div className="text-sm font-bold text-slate-800">
                {officialSourceName}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase mb-1">
                <BookOpen className="w-4 h-4 text-blue-700" />
                <span>Eligibility Scope</span>
              </div>
              <div className="text-sm font-bold text-slate-800">
                Class {educationLevel || '12'} {stream && `• ${Array.isArray(stream) ? stream.join(', ') : stream}`}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase mb-1">
                <Layers className="w-4 h-4 text-blue-700" />
                <span>Event Classification</span>
              </div>
              <div className="text-sm font-bold text-slate-800">
                {eventType?.replace(/_/g, ' ')}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verification State</span>
              </div>
              <div className="text-sm font-bold text-emerald-700 capitalize">
                {status} (Official Notification)
              </div>
            </div>
          </div>

          {/* Description */}
          {description && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Official Notice Details
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
                {description}
              </p>
            </div>
          )}

          {/* Source Transparency Box */}
          <div className="rounded-xl p-4 bg-slate-900 text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-blue-300 font-semibold mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Authoritative Official Portal</span>
              </div>
              <p className="text-xs text-slate-400">
                Verified from the official portal. Always refer directly to the conducting body for latest circulars.
              </p>
            </div>

            <a
              href={officialSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide shadow-md transition-all shrink-0"
            >
              <span>Visit Official Website</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
