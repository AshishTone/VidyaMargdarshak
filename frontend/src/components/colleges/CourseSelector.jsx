import React, { useState } from 'react';
import { BookOpen, Plus, X, Cpu, Wrench, HeartPulse, Pill, Compass, Scale, FlaskConical, Briefcase, GraduationCap } from 'lucide-react';

const PATHWAY_ICONS = {
  COMPUTING_TECHNOLOGY: Cpu,
  ENGINEERING: Wrench,
  HEALTHCARE_MEDICAL: HeartPulse,
  PHARMACY: Pill,
  ARCHITECTURE_DESIGN: Compass,
  LAW_LEGAL: Scale,
  SCIENCE_MATHEMATICS: FlaskConical,
  COMMERCE_MANAGEMENT: Briefcase,
  ARTS_HUMANITIES: BookOpen
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
  'Architecture'
];

const SUGGESTED_AFTER_12TH = [
  'Computer Engineering',
  'Information Technology',
  'Computer Science and Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'B.Pharm',
  'MBBS',
  'Bachelor of Architecture',
  '3-year LLB',
  '5-year BA LLB'
];

export default function CourseSelector({
  selectedCourses,
  setSelectedCourses,
  selectedPathways,
  setSelectedPathways,
  educationLevel,
  setEducationLevel,
  pathways = [],
  is10th = false
}) {
  const [customCourseInput, setCustomCourseInput] = useState('');

  const handleAddCustomCourse = (courseName) => {
    const trimmed = (courseName || customCourseInput).trim();
    if (!trimmed) return;
    if (!selectedCourses.includes(trimmed)) {
      setSelectedCourses([...selectedCourses, trimmed]);
    }
    setCustomCourseInput('');
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

        {/* For 10th students, lock stage to 10th and do not show 12th or All options */}
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

      {/* Career Pathway Preset Pills */}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
          Career Pathways ({is10th ? 'After 10th Options' : 'After 12th Options'}):
        </label>
        <div className="flex flex-wrap gap-2">
          {pathways.map((p) => {
            const Icon = PATHWAY_ICONS[p.pathwayId] || BookOpen;
            const isSelected = selectedPathways.includes(p.pathwayId);
            return (
              <button
                key={p.pathwayId}
                type="button"
                onClick={() => handleTogglePathway(p.pathwayId)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 ring-2 ring-blue-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                <span>{p.pathwayName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Add Specific Course */}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
          Search / Add Specific Course:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={
              is10th
                ? 'e.g. Diploma in Computer Engineering, Science Junior College...'
                : 'e.g. Computer Science and Engineering, B.Pharm, Mechanical...'
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

        {/* Quick add course pills */}
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          <span className="text-[11px] text-slate-400 py-0.5">Quick add:</span>
          {quickPills.slice(0, 8).map((crs) => (
            <button
              key={crs}
              type="button"
              onClick={() => handleAddCustomCourse(crs)}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
            >
              + {crs}
            </button>
          ))}
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
