import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { UserCheck, Building2, Compass } from 'lucide-react';
import RecommendedSection from '../components/colleges/RecommendedSection';
import SearchSection from '../components/colleges/SearchSection';
import { fetchFilterOptions, fetchPathways } from '../components/colleges/collegesApi';
import { saveCollege, removeSavedCollege } from '../services/platformService';
import useAuth from '../hooks/useAuth';

export default function CollegesPage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('recommended'); // 'recommended' | 'search'

  // Determine student class level (10th vs 12th/other)
  const is10th = user?.classLevel === '10' || user?.classLevel === 10;

  // Global filters and location metadata
  const [districts, setDistricts] = useState([]);
  const [states, setStates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [knownCentroids, setKnownCentroids] = useState({});
  const [pathways, setPathways] = useState([]);

  // User's active location (Default: student's district if set, or Amravati, Maharashtra)
  const [userLocation, setUserLocation] = useState({
    lat: 20.9320,
    lng: 77.7523,
    name: user?.location?.district ? `${user.location.district}, ${user.location.state || 'Maharashtra'}` : 'Amravati, Maharashtra',
    district: user?.location?.district || 'Amravati',
    source: 'preset'
  });

  useEffect(() => {
    // 1. Fetch filter metadata (districts, states, categories, centroids)
    fetchFilterOptions()
      .then((res) => {
        if (res?.success) {
          setDistricts(res.districts || []);
          setStates(res.states || []);
          setCategories(res.categories || []);
          setKnownCentroids(res.knownCentroids || {});

          // If user has district in profile, update coordinates if centroid found
          if (user?.location?.district && res.knownCentroids) {
            const cleanD = user.location.district.toLowerCase().trim();
            const centroid = res.knownCentroids[cleanD];
            if (centroid) {
              setUserLocation({
                lat: centroid.lat,
                lng: centroid.lng,
                name: `${centroid.name}, ${centroid.state}`,
                district: centroid.name,
                source: 'profile'
              });
            }
          }
        }
      })
      .catch((err) => console.error('Filter options error:', err));

    // 2. Fetch Pathways (filtering for 10th or 12th dynamically)
    fetchPathways(is10th ? 'after_10th' : 'after_12th')
      .then((res) => {
        if (res?.success) {
          setPathways(res.pathways || []);
        }
      })
      .catch((err) => console.error('Pathways error:', err));
  }, [user?.location?.district, is10th]);

  // Check if a college is saved in the user's profile
  const isCollegeSaved = useCallback(
    (college) => {
      if (!college || !user?.savedColleges || user.savedColleges.length === 0) return false;
      const targetId = (college._id || college.collegeId || '').toString();
      const targetSlug = (college.collegeId || college.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const targetName = (college.name || '').trim().toLowerCase();

      return user.savedColleges.some((saved) => {
        if (!saved) return false;
        if (typeof saved === 'string') {
          return saved === targetId;
        }
        const savedId = (saved._id || '').toString();
        const savedSlug = (saved.slug || '').toLowerCase();
        const savedName = (saved.name || '').trim().toLowerCase();

        return (
          (savedId && savedId === targetId) ||
          (savedSlug && savedSlug === targetSlug) ||
          (savedName && savedName === targetName)
        );
      });
    },
    [user?.savedColleges]
  );

  // Toggle saving/unsaving college to user profile
  const handleToggleSaveCollege = async (college) => {
    if (!college) return;
    const colId = college._id || college.collegeId;
    const currentlySaved = isCollegeSaved(college);

    try {
      if (currentlySaved) {
        await removeSavedCollege(colId);
      } else {
        await saveCollege(colId);
      }
      if (refreshUser) await refreshUser();
    } catch (err) {
      console.error('Failed to toggle save college:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card with Mode Navigation Tabs */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-700 font-semibold text-xs uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Colleges & Institutions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Find Colleges Near You
          </h1>
          <p className="text-sm text-slate-500 max-w-xl">
            {is10th
              ? 'Personalized for 10th Standard: Discover nearby Polytechnic Diploma and Junior Colleges (Science, Commerce, Arts).'
              : 'Personalized for 12th Standard: Discover accredited undergraduate engineering, pharmacy, medical, and degree colleges.'}
          </p>
        </div>

        {/* Navigation Tabs - Personalized icon updated from AI Sparkles to UserCheck */}
        <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl text-xs sm:text-sm font-medium self-start md:self-auto border border-slate-200/60">
          <button
            type="button"
            onClick={() => setActiveTab('recommended')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'recommended'
                ? 'bg-white text-blue-700 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>Personalized Recommendations</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'bg-white text-blue-700 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>Directory Explorer</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'recommended' ? (
        <RecommendedSection
          userLocation={userLocation}
          setUserLocation={setUserLocation}
          districts={districts}
          knownCentroids={knownCentroids}
          pathways={pathways}
          is10th={is10th}
          isCollegeSaved={isCollegeSaved}
          onToggleSaveCollege={handleToggleSaveCollege}
        />
      ) : (
        <SearchSection
          districts={districts}
          states={states}
          categories={categories}
          knownCentroids={knownCentroids}
          is10th={is10th}
          isCollegeSaved={isCollegeSaved}
          onToggleSaveCollege={handleToggleSaveCollege}
        />
      )}
    </div>
  );
}
