import { useEffect, useState, useRef, useMemo } from "react";
import {
  School,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Bookmark,
  Search,
  Globe,
  Navigation,
  Map as MapIcon,
  Layers,
} from "lucide-react";
import Button from "../components/ui/Button";
import SectionCard from "../components/ui/SectionCard";
import { fetchColleges, saveCollege } from "../services/platformService";
import useAuth from "../hooks/useAuth";

function loadLeafletScript(callback) {
  if (window.L) {
    callback();
    return;
  }

  if (!document.getElementById("leafletCss")) {
    const css = document.createElement("link");
    css.id = "leafletCss";
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);
  }

  const existingScript = document.getElementById("leafletScript");
  if (existingScript) {
    existingScript.addEventListener("load", callback);
    return;
  }

  const script = document.createElement("script");
  script.id = "leafletScript";
  script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
  script.onload = callback;
  document.body.appendChild(script);
}

export default function CollegesPage() {
  const { refreshUser, user } = useAuth();
  const [filters, setFilters] = useState({ city: "", course: "", stage: "", search: "" });
  const [colleges, setColleges] = useState([]);
  const [savedStatus, setSavedStatus] = useState({});
  const [activeCollegeMap, setActiveCollegeMap] = useState(null);
  const [mapMode, setMapMode] = useState("google"); // 'google' | 'interactive'

  const mapRef = useRef(null);
  const leafletMapInstance = useRef(null);
  const leafletMarkersGroup = useRef(null);

  useEffect(() => {
    fetchColleges({}).then((res) => {
      const list = res || [];
      setColleges(list);
      if (list.length > 0) {
        setActiveCollegeMap(list[0]);
      }
    });
  }, []);

  const displayedColleges = useMemo(() => {
    return colleges.filter((college) => {
      if (filters.stage === "10") {
        const hasDiploma = college.coursesOffered?.some((c) => (c.level || "").toLowerCase().includes("diploma"));
        if (!hasDiploma && college.coursesOffered?.length > 0) return false;
      }
      if (filters.stage === "12") {
        const hasDegree = college.coursesOffered?.some((c) =>
          ["undergraduate", "professional", "degree", "b.tech", "mbbs", "bca", "bba"].some((lvl) =>
            (c.level || c.name || "").toLowerCase().includes(lvl)
          )
        );
        if (!hasDegree && college.coursesOffered?.length > 0) return false;
      }

      if (filters.search) {
        const q = filters.search.toLowerCase();
        const nameMatch = college.name.toLowerCase().includes(q);
        const cityMatch = college.location?.city?.toLowerCase().includes(q);
        const stateMatch = college.location?.state?.toLowerCase().includes(q);
        const courseMatch = college.coursesOffered?.some((c) => c.name?.toLowerCase().includes(q));

        if (!nameMatch && !cityMatch && !stateMatch && !courseMatch) return false;
      }

      if (filters.city) {
        const cityQ = filters.city.toLowerCase();
        const cCity = (college.location?.city || "").toLowerCase();
        const cState = (college.location?.state || "").toLowerCase();
        if (!cCity.includes(cityQ) && !cState.includes(cityQ)) return false;
      }

      if (filters.course) {
        const courseQ = filters.course.toLowerCase();
        const hasCourse = college.coursesOffered?.some((c) => (c.name || "").toLowerCase().includes(courseQ));
        if (!hasCourse) return false;
      }

      return true;
    });
  }, [colleges, filters.stage, filters.search, filters.city, filters.course]);

  // Initialize Interactive Map Engine
  useEffect(() => {
    if (mapMode !== "interactive" || !mapRef.current) return;

    loadLeafletScript(() => {
      if (window.L && !leafletMapInstance.current) {
        const map = window.L.map(mapRef.current, {
          center: [20.5937, 78.9629],
          zoom: 5,
          zoomControl: true,
        });

        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 18,
        }).addTo(map);

        leafletMapInstance.current = map;
        leafletMarkersGroup.current = window.L.featureGroup().addTo(map);
      }
    });
  }, [mapMode]);

  // Update Markers on Interactive Map
  useEffect(() => {
    if (mapMode !== "interactive" || !window.L || !leafletMapInstance.current || !leafletMarkersGroup.current) return;

    const group = leafletMarkersGroup.current;
    group.clearLayers();

    const bounds = [];

    displayedColleges.forEach((college) => {
      if (!college.location?.lat || !college.location?.lng) return;

      const latLng = [college.location.lat, college.location.lng];
      bounds.push(latLng);

      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${college.name}, ${college.location.city}`
      )}`;

      const marker = window.L.marker(latLng).addTo(group);
      marker.bindPopup(`
        <div style="padding: 6px; font-family: sans-serif; max-width: 240px; color: #0f172a;">
          <h4 style="font-weight: 800; font-size: 13px; margin: 0 0 4px; line-height: 1.3;">${college.name}</h4>
          <p style="font-size: 11px; color: #475569; margin: 0 0 4px;">📍 ${college.location.city}, ${college.location.state}</p>
          <p style="font-size: 11px; font-weight: 700; color: #047857; margin: 0 0 6px;">Fees: ${college.feesRange}</p>
          <a href="${googleMapsUrl}" target="_blank" rel="noreferrer" style="display: inline-block; font-size: 11px; font-weight: 800; color: #2563eb; text-decoration: underline;">
            📍 Open Directions in Google Maps →
          </a>
        </div>
      `);
    });

    if (bounds.length > 0) {
      try {
        leafletMapInstance.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      } catch (e) {
        console.warn("Leaflet fitBounds error", e);
      }
    } else {
      leafletMapInstance.current.setView([20.5937, 78.9629], 5);
    }
  }, [displayedColleges, mapMode]);

  const handleSave = async (id) => {
    setSavedStatus((prev) => ({ ...prev, [id]: true }));
    try {
      await saveCollege(id);
      await refreshUser();
    } catch (e) {
      console.error("Save college error:", e);
    }
  };

  const getGoogleMapsSearchUrl = (college) => {
    const query = `${college?.name || "College"}, ${college?.location?.city || ""}, ${college?.location?.state || ""}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  const getGoogleMapsEmbedUrl = (college) => {
    const query = college
      ? `${college.name}, ${college.location?.city || ""}`
      : "Indian Institute of Technology Bombay, Mumbai";
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-8 md:p-10 text-white shadow-2xl border border-cyan-500/20">
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-cyan-300 border border-cyan-400/30">
                <School className="h-3.5 w-3.5" />
                Premier Universities Catalog
              </span>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                {displayedColleges.length} Top Institutions Found
              </span>
            </div>

            <h1 className="mt-4 text-3xl md:text-5xl font-black text-white tracking-tight">
              Top Indian Colleges & Google Maps Directory
            </h1>

            <p className="mt-2.5 text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed">
              Explore premier IITs, AIIMS, BITS Pilani, St. Xavier's, SRCC, and autonomous colleges with real-time Google Maps satellite/street locations, fee ranges, cutoffs, and 1-click directions navigation.
            </p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white/10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              className="w-full rounded-2xl border border-white/15 bg-white/10 pl-10 pr-4 py-3 text-xs font-medium text-white placeholder-slate-400 outline-none focus:border-cyan-400 backdrop-blur"
              placeholder="Search by college name..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <input
            className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-medium text-white placeholder-slate-400 outline-none focus:border-cyan-400 backdrop-blur"
            placeholder="Filter by City / State..."
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          />

          <input
            className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-medium text-white placeholder-slate-400 outline-none focus:border-cyan-400 backdrop-blur"
            placeholder="Filter by Course (e.g. CSE, MBBS)..."
            value={filters.course}
            onChange={(e) => setFilters({ ...filters, course: e.target.value })}
          />

          <select
            className="w-full rounded-2xl border border-white/15 bg-slate-900 px-4 py-3 text-xs font-bold text-cyan-300 outline-none focus:border-cyan-400 backdrop-blur cursor-pointer"
            value={filters.stage}
            onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
          >
            <option value="">All Education Levels</option>
            <option value="10">After 10th Std (Diplomas & Vocational)</option>
            <option value="12">After 12th Std (Undergraduate Degrees)</option>
          </select>
        </div>
      </div>

      {/* Main Google Map Section Container */}
      <SectionCard className="p-0 overflow-hidden border border-slate-200/80 shadow-2xl relative rounded-[2rem] bg-slate-950">
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-cyan-400 animate-bounce" />
            <span className="text-sm font-black text-white">Google Maps Institutional Location Explorer</span>
            <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-extrabold text-cyan-300 border border-cyan-500/30">
              {activeCollegeMap ? activeCollegeMap.name : "Google Maps View"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMapMode("google")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                mapMode === "google" ? "bg-cyan-500 text-slate-950 shadow-md" : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" /> Google Map View
            </button>
            <button
              onClick={() => setMapMode("interactive")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                mapMode === "interactive" ? "bg-cyan-500 text-slate-950 shadow-md" : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              <Layers className="h-3.5 w-3.5" /> Marker Pin Map
            </button>
            {activeCollegeMap && (
              <a
                href={getGoogleMapsSearchUrl(activeCollegeMap)}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold transition flex items-center gap-1.5 shadow-md"
              >
                <Navigation className="h-3.5 w-3.5" /> Directions →
              </a>
            )}
          </div>
        </div>

        {mapMode === "google" ? (
          <div className="w-full h-[450px] bg-slate-950 relative">
            <iframe
              title="Google Map Institutional View"
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={getGoogleMapsEmbedUrl(activeCollegeMap)}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ) : (
          <div ref={mapRef} className="w-full h-[450px] bg-slate-950 z-10" />
        )}
      </SectionCard>

      {/* College Cards Grid */}
      <div className="grid gap-6 xl:grid-cols-2">
        {displayedColleges.map((college) => {
          const isSaved = savedStatus[college._id] || user?.savedColleges?.includes(college._id);
          const googleMapsUrl = getGoogleMapsSearchUrl(college);
          const isSelectedMap = activeCollegeMap?._id === college._id;

          return (
            <SectionCard
              key={college._id}
              className={`p-6 transition duration-300 hover:border-cyan-400 hover:shadow-xl border ${
                isSelectedMap ? "border-cyan-500 ring-2 ring-cyan-500/20 bg-cyan-50/20" : "border-slate-200/80"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-[10px] font-black text-blue-900 uppercase">
                      {college.type || "Government / Accredited"}
                    </span>
                    <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-900 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-700" /> {college.verifiedStatus || "Verified"}
                    </span>
                  </div>

                  <h2 className="mt-2.5 text-2xl font-black text-slate-900">{college.name}</h2>
                  <p className="mt-1 text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    {college.location?.address}, {college.location?.city}, {college.location?.state}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveCollegeMap(college);
                    setMapMode("google");
                    window.scrollTo({ top: 400, behavior: "smooth" });
                  }}
                  className="rounded-2xl bg-slate-900 hover:bg-cyan-600 text-white p-2.5 transition text-xs font-extrabold flex items-center gap-1 shadow-md shrink-0 cursor-pointer"
                  title="View on Google Map"
                >
                  <MapIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">View Map</span>
                </button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Offered Programs</p>
                  <p className="mt-1 text-xs font-bold text-slate-800 line-clamp-2">
                    {college.coursesOffered?.map((c) => c.name).join(", ") || "Engineering, Computer Science, Data Science"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Facilities & Infrastructure</p>
                  <p className="mt-1 text-xs font-bold text-slate-800 line-clamp-2">
                    {college.facilities?.join(", ") || "Labs, Central Library, Wi-Fi, Hostel"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Annual Fees Range</p>
                  <p className="mt-1 text-xs font-extrabold text-emerald-800">{college.feesRange}</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Admission Cutoffs</p>
                  <p className="mt-1 text-xs font-bold text-slate-700 line-clamp-2">{college.cutoffInfo}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleSave(college._id)}
                    variant={isSaved ? "secondary" : "default"}
                    className="gap-2 text-xs font-extrabold rounded-2xl px-4 py-2.5"
                  >
                    <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                    {isSaved ? "Saved" : "Save College"}
                  </Button>

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-cyan-50 border border-cyan-300 px-4 py-2.5 text-xs font-extrabold text-cyan-900 hover:bg-cyan-100 transition shadow-sm cursor-pointer"
                  >
                    <Navigation className="h-3.5 w-3.5 text-cyan-700" />
                    <span>Google Maps</span>
                    <ExternalLink className="h-3 w-3 text-cyan-600" />
                  </a>
                </div>

                {college.contact?.website ? (
                  <a
                    href={college.contact?.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-extrabold text-slate-800 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Globe className="h-3.5 w-3.5 text-blue-700" />
                    <span>Official Site</span>
                    <ExternalLink className="h-3 w-3 text-slate-400" />
                  </a>
                ) : null}
              </div>
            </SectionCard>
          );
        })}

        {displayedColleges.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <School className="h-10 w-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No colleges match your current search filters</h3>
            <p className="text-xs text-slate-500 mt-1">Try clearing city, course, or stage filter keywords.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
