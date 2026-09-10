import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  X,
  Cpu,
  Wrench,
  HeartPulse,
  Pill,
  Compass,
  Scale,
  FlaskConical,
  Briefcase,
  GraduationCap,
  ChevronDown,
  Check,
  Sparkles,
  Layers,
} from 'lucide-react';

const PATHWAY_ICONS = {
  COMPUTING_TECHNOLOGY: Cpu,
  ENGINEERING: Wrench,
  HEALTHCARE_MEDICAL: HeartPulse,
  PHARMACY: Pill,
  ARCHITECTURE_DESIGN: Compass,
  LAW_LEGAL: Scale,
  SCIENCE_MATHEMATICS: FlaskConical,
  COMMERCE_MANAGEMENT: Briefcase,
  ARTS_HUMANITIES: BookOpen,
};

const SUGGESTED_AFTER_10TH = [
  'Computer Engineering',
  'Civil Engineering',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Science Junior College',
  'Commerce Junior College',
  'Arts Junior College',
  'D.Pharm',
  'Architecture',
];

const SUGGESTED_AFTER_12TH = [
  'Computer Engineering',
  'Civil Engineering',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Science Junior College',
  'Information Technology',
  'Computer Science and Engineering',
  'B.Pharm',
  'MBBS',
  'Bachelor of Architecture',
];

export default function CourseSelector({
  selectedCourses,
  setSelectedCourses,
  selectedPathways,
  setSelectedPathways,
  educationLevel,
  setEducationLevel,
  pathways = [],
  is10th = false,
}) {
  const [customCourseInput, setCustomCourseInput] = useState('');
  const [pathwayDropdownOpen, setPathwayDropdownOpen] = useState(false);
  const [popularDropdownOpen, setPopularDropdownOpen] = useState(false);

  const pathwayRef = useRef(null);
  const popularRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (pathwayRef.current && !pathwayRef.current.contains(event.target)) {
        setPathwayDropdownOpen(false);
      }
      if (popularRef.current && !popularRef.current.contains(event.target)) {
        setPopularDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddCustomCourse = (courseName) => {
    const trimmed = (courseName || customCourseInput).trim();
    if (!trimmed) return;
    if (!selectedCourses.includes(trimmed)) {
      setSelectedCourses([...selectedCourses, trimmed]);
    }
    setCustomCourseInput('');
    setPopularDropdownOpen(false);
  };

  const handleRemoveCourse = (courseToRemove) => {
    setSelectedCourses(selectedCourses.filter((c) => c !== courseToRemove));
  };

  const handleTogglePathway = (pathwayId) => {
    if (selectedPathways.includes(pathwayId)) {
      setSelectedPathways(selectedPathways.filter((id) => id !== pathwayId));
    } else {
      setSelectedPathways([...selectedPathways, pathwayId]);
    }
  };

  const quickPills = is10th ? SUGGESTED_AFTER_10TH : SUGGESTED_AFTER_12TH;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      {/* Education Stage Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-800">
            {is10th ? '10th Standard Courses & Pathways' : '12th Standard Courses & Pathways'}
          </h3>
        </div>

        {is10th ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
            <span>🎓 After 10th (Diploma & Junior Colleges)</span>
          </span>
        ) : (
          <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
            <span className="px-3 py-1 rounded-lg bg-white text-blue-700 font-semibold shadow-sm">
              🏛 After 12th (Undergraduate & Degrees)
            </span>
          </div>
        )}
      </div>

      {/* Modern Interactive Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Career Pathways Dropdown */}
        <div className="relative" ref={pathwayRef}>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
            Career Pathways
          </label>
          <button
            type="button"
            onClick={() => {
              setPathwayDropdownOpen((prev) => !prev);
              setPopularDropdownOpen(false);
            }}
            className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              pathwayDropdownOpen
                ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 text-blue-900'
                : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Layers className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">
                {selectedPathways.length > 0
                  ? `Selected (${selectedPathways.length}) Pathways`
                  : 'Select Career Pathways'}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                pathwayDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Pathways Dropdown Menu */}
          {pathwayDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 z-40 w-full min-w-[280px] max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl space-y-1 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5 mb-1">
                <span>Select to Filter</span>
                {selectedPathways.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedPathways([])}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              {pathways.map((p) => {
                const Icon = PATHWAY_ICONS[p.pathwayId] || BookOpen;
                const isSelected = selectedPathways.includes(p.pathwayId);
                return (
                  <button
                    key={p.pathwayId}
                    type="button"
                    onClick={() => handleTogglePathway(p.pathwayId)}
                    className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? 'text-blue-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{p.pathwayName}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Popular Courses Dropdown */}
        <div className="relative" ref={popularRef}>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
            Popular Courses
          </label>
          <button
            type="button"
            onClick={() => {
              setPopularDropdownOpen((prev) => !prev);
              setPathwayDropdownOpen(false);
            }}
            className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              popularDropdownOpen
                ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 text-blue-900'
                : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="truncate">Select Popular Courses</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                popularDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Popular Courses Dropdown Menu */}
          {popularDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 z-40 w-full min-w-[280px] max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl space-y-1 animate-in fade-in zoom-in-95">
              <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5 mb-1">
                Click to Add Course
              </div>
              {quickPills.map((course) => {
                const isAdded = selectedCourses.includes(course);
                return (
                  <button
                    key={course}
                    type="button"
                    onClick={() => handleAddCustomCourse(course)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                      isAdded
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{course}</span>
                    {isAdded ? (
                      <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider shrink-0">
                        Added
                      </span>
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Search / Add Specific Course */}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
          Add Specific Course:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={
              is10th
                ? 'e.g. Computer Engineering, Science Junior College...'
                : 'e.g. Computer Science, B.Pharm, Mechanical...'
            }
            value={customCourseInput}
            onChange={(e) => setCustomCourseInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomCourse();
              }
            }}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <button
            type="button"
            onClick={() => handleAddCustomCourse()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-sm shadow-blue-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Selected Active Course Tags */}
      {selectedCourses.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-500 mb-2">Active Course Filters:</div>
          <div className="flex flex-wrap gap-2">
            {selectedCourses.map((crs) => (
              <span
                key={crs}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
              >
                <span>{crs}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCourse(crs)}
                  className="p-0.5 rounded-full hover:bg-blue-200 text-blue-500 hover:text-blue-800 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
