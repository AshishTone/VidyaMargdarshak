import React, { useState, useEffect, useMemo } from 'react';
import { Search, Building2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import CollegeCard from './CollegeCard';
import CollegeDetailModal from './CollegeDetailModal';
import { searchColleges } from './collegesApi';

export default function SearchSection({
  districts = [],
  states = [],
  categories = [],
  knownCentroids = {},
  is10th = false,
  isCollegeSaved,
  onToggleSaveCollege
}) {
  const [query, setQuery] = useState('');
  const [state, setState] = useState('All');
  const [district, setDistrict] = useState('All');
  const [category, setCategory] = useState('All');
  const [institutionType, setInstitutionType] = useState('All');
  const [page, setPage] = useState(1);

  const [colleges, setColleges] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);

  // Filter available districts if a specific state is selected
  const filteredDistricts = useMemo(() => {
    if (!state || state === 'All') return districts;
    const stateLower = state.trim().toLowerCase();
    return districts.filter((d) => {
      const centroid = knownCentroids[d.toLowerCase().trim()];
      if (centroid && centroid.state) {
        return centroid.state.toLowerCase() === stateLower;
      }
      return true;
    });
  }, [districts, state, knownCentroids]);

  // Reset district if selected state changes and district doesn't belong to it
  const handleStateChange = (newState) => {
    setState(newState);
    setDistrict('All');
  };

  const performSearch = (pageToLoad = 1) => {
    setLoading(true);
    searchColleges({
      q: query,
      state,
      district,
      category: is10th ? 'All' : category,
      educationLevel: is10th ? 'after_10th' : 'after_12th',
      institutionType,
      page: pageToLoad,
      limit: 18
    })
      .then((res) => {
        if (res?.success) {
          setColleges(res.colleges || []);
          setPagination(res.pagination || { total: 0, pages: 1, page: 1 });
        }
      })
      .catch((err) => console.error('Search error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(1);
    performSearch(1);
  }, [state, district, category, institutionType, is10th]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    performSearch(1);
  };

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="max-w-3xl space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Colleges Directory</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {is10th ? 'Explore Colleges (After 10th)' : 'Explore Colleges (After 12th)'}
          </h2>
          <p className="text-sm text-slate-500">
            {is10th
              ? 'Search across accredited junior colleges and polytechnic diploma institutions in Maharashtra and India.'
              : 'Search across undergraduate universities and colleges offering degree programs across India.'}
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                is10th
                  ? 'Search by college name, diploma stream (e.g. Mechanical, Science, Commerce), or district...'
                  : 'Search by college name, course (e.g. Mechanical, B.Pharm, Science), or university...'
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Multi-Filters Grid: Ordered State then District, no education stage, Category only for 12th */}
        <div className={`grid gap-3 mt-4 pt-4 border-t border-slate-100 text-xs ${
          is10th ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        }`}>
          {/* 1. State (First) */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">State:</label>
            <select
              value={state}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All States</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* 2. District (Second) */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">District:</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Districts</option>
              {filteredDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Category / Discipline (ONLY for 12th students) */}
          {!is10th && (
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Category / Discipline:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="All">All Disciplines</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 4. Institution Type */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Institution Type:</label>
            <select
              value={institutionType}
              onChange={(e) => setInstitutionType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Government">Government / Aided</option>
              <option value="Private">Private / Unaided</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-2">
        <span>
          Showing <b className="text-slate-800">{colleges.length}</b> colleges (Total: {pagination.total})
        </span>
        <span>
          Page {pagination.page} of {pagination.pages || 1}
        </span>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-700">Searching college catalog...</p>
        </div>
      ) : colleges.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
          <Building2 className="w-8 h-8 text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No colleges matched your filters</h3>
          <p className="text-xs text-slate-500">Try resetting filters or adjusting search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {colleges.map((college) => (
            <CollegeCard
              key={college._id || college.collegeId}
              college={college}
              onSelectCollege={setSelectedCollege}
              onToggleSaveCollege={onToggleSaveCollege}
              isSaved={isCollegeSaved ? isCollegeSaved(college) : false}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => {
              const newP = page - 1;
              setPage(newP);
              performSearch(newP);
            }}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-medium text-slate-600 px-3 py-1 bg-slate-100 rounded-lg">
            {page} / {pagination.pages}
          </span>

          <button
            type="button"
            disabled={page >= pagination.pages || loading}
            onClick={() => {
              const newP = page + 1;
              setPage(newP);
              performSearch(newP);
            }}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* College Detail Modal */}
      {selectedCollege && (
        <CollegeDetailModal
          collegeSummary={selectedCollege}
          onClose={() => setSelectedCollege(null)}
          onToggleSaveCollege={onToggleSaveCollege}
          isSaved={isCollegeSaved ? isCollegeSaved(selectedCollege) : false}
        />
      )}
    </div>
  );
}
