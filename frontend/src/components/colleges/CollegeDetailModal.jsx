import React, { useEffect, useState } from 'react';
import { X, MapPin, Globe, Phone, Mail, GraduationCap, Navigation, ExternalLink, Bookmark } from 'lucide-react';
import { fetchCollegeById } from './collegesApi';

export default function CollegeDetailModal({ collegeSummary, onClose, onToggleSaveCollege, isSaved }) {
  const [fullCollege, setFullCollege] = useState(collegeSummary);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!collegeSummary?.courses || collegeSummary.courses.length === 0) {
      setLoading(true);
      fetchCollegeById(collegeSummary._id || collegeSummary.collegeId)
        .then(res => {
          if (res?.college) setFullCollege(res.college);
        })
        .catch(err => console.error('Error loading college details:', err))
        .finally(() => setLoading(false));
    }
  }, [collegeSummary]);

  if (!fullCollege) return null;

  const lat = fullCollege.location?.coordinates?.[1];
  const lng = fullCollege.location?.coordinates?.[0];
  const directionsUrl = lat && lng ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-blue-900 to-indigo-900 text-white relative flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30">
              {fullCollege.institutionType || 'College'}
            </span>
            {fullCollege.distanceKm !== undefined && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
                📍 {fullCollege.distanceKm === 0 ? '< 1 km away' : `${fullCollege.distanceKm} km away`}
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-bold pr-8 leading-tight">{fullCollege.name}</h3>

          <p className="text-sm text-blue-100/90 flex items-center gap-1.5 mt-2">
            <MapPin className="w-4 h-4 text-blue-300 shrink-0" />
            <span>{fullCollege.address?.full || `${fullCollege.address?.district || ''}, ${fullCollege.address?.state || 'Maharashtra'}`}</span>
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Key Facts / Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
            {fullCollege.university && (
              <div>
                <span className="font-semibold text-slate-500 block">Affiliated Board / Univ:</span>
                <span className="text-slate-800 font-medium">{fullCollege.university}</span>
              </div>
            )}
            {fullCollege.address?.district && (
              <div>
                <span className="font-semibold text-slate-500 block">District & State:</span>
                <span className="text-slate-800 font-medium">{fullCollege.address.district}, {fullCollege.address.state || 'Maharashtra'}</span>
              </div>
            )}
            {fullCollege.website && (
              <div>
                <span className="font-semibold text-slate-500 block">Website:</span>
                <a
                  href={fullCollege.website.startsWith('http') ? fullCollege.website : `http://${fullCollege.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1 line-clamp-1"
                >
                  <Globe className="w-3 h-3 shrink-0" />
                  <span>Visit Website</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            )}
            {fullCollege.email && (
              <div>
                <span className="font-semibold text-slate-500 block">Email:</span>
                <a href={`mailto:${fullCollege.email}`} className="text-blue-600 hover:underline line-clamp-1">
                  {fullCollege.email}
                </a>
              </div>
            )}
            {fullCollege.phone && (
              <div>
                <span className="font-semibold text-slate-500 block">Phone:</span>
                <span className="text-slate-800 font-medium">{fullCollege.phone}</span>
              </div>
            )}
          </div>

          {/* Courses Offered Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>All Available Courses & Intake ({fullCollege.courses?.length || 0})</span>
              </h4>
            </div>

            {loading ? (
              <div className="py-6 text-center text-slate-400 text-sm">Loading complete course catalog...</div>
            ) : fullCollege.courses && fullCollege.courses.length > 0 ? (
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="max-h-72 overflow-y-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Course Name</th>
                        <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Level</th>
                        <th className="px-4 py-2.5 text-center font-semibold text-slate-600">Intake</th>
                        <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Approval / Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {fullCollege.courses.map((crs, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-slate-900">{crs.name}</td>
                          <td className="px-4 py-2.5 text-slate-500">{crs.level || 'Under Graduate'}</td>
                          <td className="px-4 py-2.5 text-center">
                            {crs.intake > 0 ? (
                              <span className="px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {crs.intake} seats
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-slate-600">
                            {crs.approvalStatus || 'Approved'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No specific course records found.</p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              Close
            </button>
            {onToggleSaveCollege && (
              <button
                type="button"
                onClick={() => onToggleSaveCollege(fullCollege)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors cursor-pointer ${
                  isSaved
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? "fill-white" : ""}`} />
                <span>{isSaved ? "Saved in Profile" : "Save College"}</span>
              </button>
            )}
          </div>

          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-md shadow-blue-500/20"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
