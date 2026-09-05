import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, SlidersHorizontal, ListFilter, Map as MapIcon, Loader2, AlertCircle } from 'lucide-react';
import LocationInput from './LocationInput';
import CourseSelector from './CourseSelector';
import CollegeCard from './CollegeCard';
import CollegeMap from './CollegeMap';
import CollegeDetailModal from './CollegeDetailModal';
import { fetchRecommendedColleges } from './collegesApi';

export default function RecommendedSection({
  userLocation,
  setUserLocation,
  districts,
  knownCentroids,
  pathways = [],
  is10th = false,
  isCollegeSaved,
  onToggleSaveCollege
}) {
  const defaultCourses = is10th ? ['Computer Engineering'] : ['Computer Engineering'];
  const defaultPathways = is10th ? ['COMPUTING_TECHNOLOGY'] : ['COMPUTING_TECHNOLOGY'];

  const [selectedCourses, setSelectedCourses] = useState(defaultCourses);
  const [selectedPathways, setSelectedPathways] = useState(defaultPathways);
  const [educationLevel, setEducationLevel] = useState(is10th ? 'after_10th' : 'after_12th');
  const [radius, setRadius] = useState(50);
  const [strictDistrict, setStrictDistrict] = useState(false);
  const [institutionType, setInstitutionType] = useState('All');

  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'list', 'map'
  const [selectedCollege, setSelectedCollege] = useState(null);

  // Sync educationLevel if is10th changes
  useEffect(() => {
    setEducationLevel(is10th ? 'after_10th' : 'after_12th');
  }, [is10th]);

  // Filter pathways for 10th vs 12th
  const visiblePathways = useMemo(() => {
    return pathways.filter((p) => {
      if (is10th) {
        return p.educationLevels && p.educationLevels.includes('after_10th');
      }
      return p.educationLevels && p.educationLevels.includes('after_12th');
    });
  }, [pathways, is10th]);

  useEffect(() => {
    if (!userLocation?.lat || !userLocation?.lng) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const levelToSearch = is10th ? 'after_10th' : (educationLevel === 'All' ? 'after_12th' : educationLevel);

    fetchRecommendedColleges({
      lat: userLocation.lat,
      lng: userLocation.lng,
      district: userLocation.district,
      strictDistrict,
      courses: selectedCourses,
      pathways: selectedPathways,
      radius,
      educationLevel: levelToSearch,
      institutionType
    })
      .then((res) => {
        if (!isMounted) return;
        if (res?.success) {
          setColleges(res.colleges || []);
        } else {
          setError(res?.message || 'Failed to fetch recommendations.');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error fetching recommendations:', err);
        setError('Network error: Unable to connect to recommendation backend.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userLocation, selectedCourses, selectedPathways, radius, strictDistrict, educationLevel, institutionType, is10th]);

  return (
    <div className="space-y-6">
      {/* Inputs Grid: Location & Course Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LocationInput
          userLocation={userLocation}
          setUserLocation={setUserLocation}
          radius={radius}
          setRadius={setRadius}
          strictDistrict={strictDistrict}
          setStrictDistrict={setStrictDistrict}
          districts={districts}
          knownCentroids={knownCentroids}
        />

        <CourseSelector
          selectedCourses={selectedCourses}
          setSelectedCourses={setSelectedCourses}
          selectedPathways={selectedPathways}
          setSelectedPathways={setSelectedPathways}
          educationLevel={is10th ? 'after_10th' : educationLevel}
          setEducationLevel={setEducationLevel}
          pathways={visiblePathways}
          is10th={is10th}
        />
      </div>

      {/* Control Bar: Filters & View Switcher */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span>Filter:</span>
          </span>

          <select
            value={institutionType}
            onChange={(e) => setInstitutionType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">All Institution Types</option>
            <option value="Government">Government / Aided Only</option>
            <option value="Private">Private / Unaided</option>
          </select>

          <span className="text-xs text-slate-500 font-medium">
            Found <b className="text-blue-700">{colleges.length}</b> colleges {strictDistrict && userLocation?.district ? `in ${userLocation.district}` : `within ${radius} km`}
          </span>
        </div>

        {/* View Mode Toggle (Split / List / Map) */}
        <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-medium self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === 'split' ? 'bg-white text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Split View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === 'list' ? 'bg-white text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>List Only</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === 'map' ? 'bg-white text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map Only</span>
          </button>
        </div>
      </div>

      {/* Results Content Area */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-700">Calculating distance and matching colleges...</p>
          <p className="text-xs text-slate-400">Scanning catalog and sorting by proximity and relevance</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 text-center flex flex-col items-center gap-2">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      ) : colleges.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No matching colleges found {strictDistrict && userLocation?.district ? `in ${userLocation.district}` : `within ${radius} km`}
          </h3>
          <p className="text-xs text-slate-500 max-w-md">
            Try expanding the search radius slider, unchecking strict district mode, or adding related course titles.
          </p>
          {strictDistrict && (
            <button
              type="button"
              onClick={() => setStrictDistrict(false)}
              className="mt-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl border border-blue-200 transition-colors cursor-pointer"
            >
              Switch to Radius Search (Nearby Districts)
            </button>
          )}
        </div>
      ) : (
        <div>
          {viewMode === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* College Cards List (7 Cols) */}
              <div className="lg:col-span-7 space-y-4 max-h-[800px] overflow-y-auto pr-1">
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

              {/* Interactive Map (5 Cols) */}
              <div className="lg:col-span-5 sticky top-20 h-[550px]">
                <CollegeMap
                  userLocation={userLocation}
                  colleges={colleges}
                  onSelectCollege={setSelectedCollege}
                />
              </div>
            </div>
          )}

          {viewMode === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

          {viewMode === 'map' && (
            <div className="h-[650px]">
              <CollegeMap
                userLocation={userLocation}
                colleges={colleges}
                onSelectCollege={setSelectedCollege}
              />
            </div>
          )}
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
