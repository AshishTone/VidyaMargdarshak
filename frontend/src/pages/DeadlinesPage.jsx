import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, GraduationCap, Info, X, ShieldCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import SearchBar from '../modules/deadlines/components/SearchBar';
import DeadlineFilters from '../modules/deadlines/components/DeadlineFilters';
import DeadlineCard from '../modules/deadlines/components/DeadlineCard';
import DeadlineModal from '../modules/deadlines/components/DeadlineModal';
import EmptyState from '../modules/deadlines/components/EmptyState';
import LoadingSkeleton from '../modules/deadlines/components/LoadingSkeleton';
import { searchDeadlines } from '../modules/deadlines/services/deadlineService';

export default function DeadlinesPage() {
  const { user } = useAuth();
  const isTenth = user?.classLevel === '10';
  const defaultLevel = isTenth ? '10th' : '12th';

  // Search query & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    educationLevel: defaultLevel,
    stream: '',
    state: 'All India',
    eventType: ''
  });

  const [deadlines, setDeadlines] = useState([]);
  const [sourcesChecked, setSourcesChecked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Execute search and filtering with strict classLevel isolation
  const runSearch = useCallback(async (forceRefresh = false, customQuery = null, customFilters = null) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const activeQuery = customQuery !== null ? customQuery : searchQuery;
      const activeF = customFilters !== null ? customFilters : filters;

      const res = await searchDeadlines({
        query: activeQuery,
        educationLevel: defaultLevel, // Strictly locked to student's class
        stream: activeF.stream,
        state: activeF.state,
        eventType: activeF.eventType,
        forceRefresh
      });

      if (res && res.success) {
        setDeadlines(res.deadlines || []);
        setSourcesChecked(res.sourcesChecked || []);
        if (forceRefresh) {
          setStatusMessage('Successfully refreshed with the latest verified official notifications.');
          setTimeout(() => setStatusMessage(''), 4000);
        }
      }
    } catch (err) {
      console.error('Error fetching admission deadlines:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, filters, defaultLevel]);

  // Initial load
  useEffect(() => {
    runSearch();
  }, [runSearch]);

  // Natural language search submission
  const handleSearch = (query) => {
    setSearchQuery(query);
    runSearch(false, query, filters);
  };

  // Filter change handler
  const handleFilterChange = (newFilters) => {
    const updated = {
      ...newFilters,
      educationLevel: defaultLevel // Guarantee persistence of class level
    };
    setFilters(updated);
    runSearch(false, searchQuery, updated);
  };

  // Reset filters
  const handleResetFilters = () => {
    const emptyFilters = {
      educationLevel: defaultLevel,
      stream: '',
      state: 'All India',
      eventType: ''
    };
    setFilters(emptyFilters);
    setSearchQuery('');
    runSearch(false, '', emptyFilters);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-8">
      {/* Header Banner */}
      <div className="panel rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Admission & Exam Deadlines
              </h1>
              {/* Info Icon Button */}
              <button
                type="button"
                onClick={() => setShowInfoModal(true)}
                title="How deadlines are displayed"
                className="p-1.5 rounded-full text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-900 transition-colors"
                aria-label="Information on how deadlines work"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Discover upcoming entrance examinations, centralized counselling rounds, and application milestones verified directly from official conducting authorities for {isTenth ? 'Class 10 (Post-SSC)' : 'Class 12 (Post-HSC)'} students.
            </p>
          </div>
        </div>
      </div>

      {/* Refresh alert banner */}
      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Dedicated FYJC Guidance Banner for 10th Standard Only */}
      {isTenth && (
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl p-4 sm:p-5 border border-sky-200 flex items-start gap-3.5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0 mt-0.5">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-blue-950 mb-1">
              Maharashtra Std. 11 Centralized Online Admission (FYJC) Gateway
            </h3>
            <p className="text-xs text-blue-900 leading-relaxed">
              For Class 10 graduates entering Science, Commerce, Arts, or Vocational junior colleges. Timelines aggregate Part 1 student registration, Part 2 college option form submission, and centralized merit list rounds directly from{' '}
              <a
                href="https://mahafyjcadmissions.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline hover:text-blue-950"
              >
                mahafyjcadmissions.in
              </a>.
            </p>
          </div>
        </div>
      )}

      {/* Search Input Bar */}
      <SearchBar
        onSearch={handleSearch}
        initialQuery={searchQuery}
        isLoading={loading && !refreshing}
        placeholder={
          isTenth
            ? "Search Class 10 pathways (e.g. FYJC Admission, Polytechnic Diploma, SSC Board)..."
            : "Search Class 12 exams & courses (e.g. MHT-CET, JEE Main, NEET, CLAT, B.Arch)..."
        }
      />

      {/* Filter Controls */}
      <DeadlineFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        totalCount={deadlines.length}
        isTenth={isTenth}
      />

      {/* Results Grid */}
      {loading && !refreshing ? (
        <LoadingSkeleton count={6} />
      ) : deadlines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deadlines.map((deadline) => (
            <DeadlineCard
              key={deadline.id || deadline._id}
              deadline={deadline}
              onSelect={setSelectedDeadline}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Official Deadlines Matched"
          message={`No deadlines match your current search for Class ${isTenth ? '10' : '12'}, or upcoming dates have not yet been announced officially by conducting authorities.`}
          officialSources={sourcesChecked}
          onRefresh={() => runSearch(true)}
          isRefreshing={refreshing}
        />
      )}

      {/* Bottom Action: Refresh Official Portals */}
      <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>
          Showing official deadlines strictly tailored for <strong className="text-slate-700">{isTenth ? 'Class 10 (Post-SSC)' : 'Class 12 (Post-HSC)'}</strong> students.
        </p>

        <button
          type="button"
          onClick={() => runSearch(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Verifying Official Sources...' : 'Refresh Official Portals'}</span>
        </button>
      </div>

      {/* Detail Modal */}
      {selectedDeadline && (
        <DeadlineModal
          deadline={selectedDeadline}
          onClose={() => setSelectedDeadline(null)}
        />
      )}

      {/* Info (i) Explanation Modal */}
      {showInfoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowInfoModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Info className="w-5 h-5 text-blue-700" />
                <span>How Deadlines Are Displayed</span>
              </div>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-1">
                    Exclusively Official Sources
                  </h4>
                  <p className="text-xs text-slate-600">
                    All deadlines are aggregated directly from trusted government agencies, examination authorities, and state boards (NTA, Maharashtra CET Cell, MSBSHSE, JoSAA, DTE, etc.). No coaching blogs or rumors are used.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-1">
                    Dynamic Countdown & Urgency
                  </h4>
                  <p className="text-xs text-slate-600">
                    Days remaining are dynamically calculated against today’s date:
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] font-medium">
                    <span className="p-1.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                      🔴 Urgent: 0 - 7 days
                    </span>
                    <span className="p-1.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      🟠 Soon: 8 - 30 days
                    </span>
                    <span className="p-1.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      🟢 Upcoming: 31 - 90 days
                    </span>
                    <span className="p-1.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      🔵 Scheduled: 91+ days
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-1">
                    Tailored Academic Standard
                  </h4>
                  <p className="text-xs text-slate-600">
                    Your view is strictly personalized. A Class 10 student only sees Class 10 and FYJC/Polytechnic pathways, while a Class 12 student only sees relevant undergraduate entrance exams.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-1">
                    Candidate Verification Policy
                  </h4>
                  <p className="text-xs text-slate-600">
                    Dates marked as <strong>Tentative</strong> are based on preliminary academic calendars and will update automatically once formal circulars are gazetted. Always click the official portal link to verify before fee submission.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
