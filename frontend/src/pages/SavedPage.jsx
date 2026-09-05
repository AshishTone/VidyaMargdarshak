import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Building2, ArrowRight } from "lucide-react";
import useAuth from "../hooks/useAuth";
import CollegeCard from "../components/colleges/CollegeCard";
import CollegeDetailModal from "../components/colleges/CollegeDetailModal";
import { removeSavedCollege, saveCollege } from "../services/platformService";

export default function SavedPage() {
  const { user, refreshUser } = useAuth();
  const [selectedCollege, setSelectedCollege] = useState(null);

  const savedColleges = user?.savedColleges || [];

  // Check if a college is saved
  const isCollegeSaved = useCallback(
    (college) => {
      if (!college || !savedColleges.length) return false;
      const targetId = (college._id || college.collegeId || "").toString();
      const targetSlug = (college.collegeId || college.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const targetName = (college.name || "").trim().toLowerCase();

      return savedColleges.some((saved) => {
        if (!saved) return false;
        if (typeof saved === "string") return saved === targetId;
        const sId = (saved._id || "").toString();
        const sSlug = (saved.slug || "").toLowerCase();
        const sName = (saved.name || "").trim().toLowerCase();

        return (
          (sId && sId === targetId) ||
          (sSlug && sSlug === targetSlug) ||
          (sName && sName === targetName)
        );
      });
    },
    [savedColleges]
  );

  // Toggle save/unsave college
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
      console.error("Failed to update saved college:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-700 font-semibold text-xs uppercase tracking-wider">
            <Bookmark className="w-4 h-4 fill-blue-700" />
            <span>Shortlisted Institutions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Saved Colleges
          </h1>
          <p className="text-sm text-slate-500 max-w-xl">
            Review your shortlisted colleges, inspect full course offerings, seat intake, and get turn-by-turn directions.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            {savedColleges.length} {savedColleges.length === 1 ? "College Saved" : "Colleges Saved"}
          </span>
          <Link
            to="/colleges"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm shadow-blue-600/20"
          >
            <span>Explore More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Saved Colleges Display */}
      {savedColleges.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 sm:p-16 border border-slate-200 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-lg font-bold text-slate-800">No saved colleges yet</h3>
            <p className="text-xs text-slate-500">
              When exploring colleges in Personalized Recommendations or Directory Explorer, click the bookmark icon to save colleges to your shortlist.
            </p>
          </div>
          <Link
            to="/colleges"
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-md shadow-blue-600/20"
          >
            <Building2 className="w-4 h-4" />
            <span>Browse Colleges Catalog</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedColleges.map((college) => {
            const key = college._id || college.collegeId || college.name;
            return (
              <CollegeCard
                key={key}
                college={college}
                onSelectCollege={setSelectedCollege}
                onToggleSaveCollege={handleToggleSaveCollege}
                isSaved={isCollegeSaved(college)}
              />
            );
          })}
        </div>
      )}

      {/* Detailed College Modal */}
      {selectedCollege && (
        <CollegeDetailModal
          collegeSummary={selectedCollege}
          onClose={() => setSelectedCollege(null)}
          onToggleSaveCollege={handleToggleSaveCollege}
          isSaved={isCollegeSaved(selectedCollege)}
        />
      )}
    </div>
  );
}
