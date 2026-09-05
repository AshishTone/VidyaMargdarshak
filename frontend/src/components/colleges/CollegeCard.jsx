import React from 'react';
import { MapPin, Navigation, Award, BookOpen, ExternalLink, ChevronRight, Bookmark } from 'lucide-react';

function cleanUniversityText(uni) {
  if (!uni) return null;
  if (uni.toLowerCase().includes('technical education, mumbai') || uni.toLowerCase().includes('msbte')) {
    return 'State Board of Technical Education (MSBTE)';
  }
  return uni;
}

export default function CollegeCard({ college, onSelectCollege, onToggleSaveCollege, isSaved }) {
  const {
    name,
    address,
    location,
    distanceKm,
    institutionType,
    type,
    university,
    matchedCourses = [],
    courses = [],
    facilities = [],
    recommendationScore
  } = college;

  const lat = location?.coordinates?.[1] ?? location?.lat;
  const lng = location?.coordinates?.[0] ?? location?.lng;
  const directionsUrl = lat && lng ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` : null;
  const displayUniversity = cleanUniversityText(university);

  const district = address?.district || location?.city || '';
  const state = address?.state || location?.state || 'Maharashtra';
  const fullAddress = address?.full || location?.address || (district ? `${district}, ${state}` : '');
  const displayType = institutionType || type || 'College';

  const displayCourses = matchedCourses.length > 0 
    ? matchedCourses 
    : (courses.length > 0 ? courses : facilities.map(f => ({ name: f })));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-5 flex flex-col justify-between group">
      <div>
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {distanceKm !== undefined && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>{distanceKm === 0 ? '< 1 km away' : `${distanceKm} km away`}</span>
              </span>
            )}
            {district && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                📍 {district}
              </span>
            )}
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              displayType.toLowerCase().includes('govt') || displayType.toLowerCase().includes('government')
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-700'
            }`}>
              {displayType}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {recommendationScore !== undefined && recommendationScore !== null && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Score {recommendationScore} / 100</span>
              </span>
            )}
            {onToggleSaveCollege && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSaveCollege(college);
                }}
                title={isSaved ? "Saved to profile" : "Save college"}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isSaved
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-white" : ""}`} />
              </button>
            )}
          </div>
        </div>

        {/* College Title */}
        <h4 
          onClick={() => onSelectCollege(college)}
          className="text-base font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors line-clamp-2 mb-1.5"
        >
          {name}
        </h4>

        {/* Location & District */}
        <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-2.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="line-clamp-1">{fullAddress || `${district}, ${state}`}</span>
        </p>

        {/* University / Board affiliation */}
        {displayUniversity && (
          <p className="text-[11px] text-slate-600 italic line-clamp-1 mb-3 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
            🏛 Affiliation: {displayUniversity}
          </p>
        )}

        {/* Matched Courses Section */}
        {displayCourses && displayCourses.length > 0 && (
          <div className="space-y-1.5 mb-4">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Offered / Matched Programs ({displayCourses.length}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {displayCourses.slice(0, 3).map((crs, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 text-xs bg-blue-50/80 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-100 font-medium"
                >
                  <BookOpen className="w-3 h-3 text-blue-600" />
                  <span className="line-clamp-1">{crs.name || crs}</span>
                  {crs.intake > 0 && (
                    <span className="text-[10px] text-blue-600 bg-white px-1.5 py-0.2 rounded font-semibold border border-blue-200">
                      {crs.intake} seats
                    </span>
                  )}
                </div>
              ))}
              {displayCourses.length > 3 && (
                <span className="text-xs text-blue-600 self-center font-medium px-1">
                  +{displayCourses.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
        <button
          type="button"
          onClick={() => onSelectCollege(college)}
          className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors cursor-pointer"
        >
          <span>View All Courses & Info</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors"
          >
            <Navigation className="w-3 h-3 text-blue-600" />
            <span>Directions</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        )}
      </div>
    </div>
  );
}
