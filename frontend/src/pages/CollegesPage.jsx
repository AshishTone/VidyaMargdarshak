import { useEffect, useState, useRef, useMemo } from "react";
import Button from "../components/ui/Button";
import SectionCard from "../components/ui/SectionCard";
import { fetchColleges, saveCollege } from "../services/platformService";
import useAuth from "../hooks/useAuth";

function loadGoogleMapsScript(callback) {
  if (window.google && window.google.maps) {
    callback();
    return;
  }

  const existingScript = document.getElementById("googleMapsScript");
  if (existingScript) {
    existingScript.addEventListener("load", callback);
    return;
  }

  // Load the API Key from environment variables
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const script = document.createElement("script");
  script.id = "googleMapsScript";
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    if (callback) callback();
  };
  document.body.appendChild(script);
}

export default function CollegesPage() {
  const { refreshUser } = useAuth();
  const [filters, setFilters] = useState({ name: "", city: "", course: "", stage: "" });
  const [submittedFilters, setSubmittedFilters] = useState(null);
  const [colleges, setColleges] = useState([]);
  
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);

  const apiKeyVal = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const hasApiKey = apiKeyVal.trim() !== "" && apiKeyVal !== "YOUR_GOOGLE_MAPS_API_KEY_HERE";

  useEffect(() => {
    if (!hasApiKey) return;
    loadGoogleMapsScript(() => {
      setMapLoaded(true);
    });
  }, [hasApiKey]);

  useEffect(() => {
    if (!submittedFilters) { setColleges([]); return; }
    const query = {};
    if (submittedFilters.name) query.name = submittedFilters.name;
    if (submittedFilters.city) query.city = submittedFilters.city;
    if (submittedFilters.course) query.course = submittedFilters.course;

    fetchColleges(query).then(setColleges);
  }, [submittedFilters]);

  const displayedColleges = useMemo(() => {
    return colleges.filter((college) => {
      if (!filters.stage) return true;
      if (filters.stage === "10") {
        return college.coursesOffered?.some(
          (course) => course.level === "Diploma"
        );
      }
      if (filters.stage === "12") {
        return college.coursesOffered?.some(
          (course) => course.level === "Undergraduate" || course.level === "Professional"
        );
      }
      return true;
    });
  }, [colleges, filters.stage]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    
    const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // India Center
    const map = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 5,
    });
    setMapInstance(map);
  }, [mapLoaded]);

  useEffect(() => {
    if (!mapInstance) return;

    const newMarkers = displayedColleges.map((college) => {
      if (!college.location?.lat || !college.location?.lng) return null;

      const position = { lat: college.location.lat, lng: college.location.lng };
      const marker = new window.google.maps.Marker({
        position,
        map: mapInstance,
        title: college.name,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; font-family: sans-serif; color: #0f172a; max-width: 260px;">
            <h4 style="font-weight: 800; font-size: 13px; margin: 0; line-height: 1.4;">${college.name}</h4>
            <p style="font-size: 11px; color: #64748b; margin: 4px 0 0;">${college.location.city}, ${college.location.state}</p>
            <p style="font-size: 11px; margin: 6px 0 0;"><strong>Fees:</strong> ${college.feesRange}</p>
            <p style="font-size: 11px; margin: 4px 0 0;"><strong>Medium:</strong> ${college.mediumOfInstruction?.join(", ") || "English"}</p>
            <p style="font-size: 11px; margin: 4px 0 0;"><strong>Facilities:</strong> ${college.facilities?.join(", ") || "N/A"}</p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(mapInstance, marker);
      });

      return marker;
    }).filter(Boolean);

    if (newMarkers.length === 1) {
      mapInstance.setCenter(newMarkers[0].getPosition());
      mapInstance.setZoom(12);
    } else if (newMarkers.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach((m) => bounds.extend(m.getPosition()));
      mapInstance.fitBounds(bounds);
    } else {
      mapInstance.setCenter({ lat: 20.5937, lng: 78.9629 });
      mapInstance.setZoom(5);
    }

    return () => {
      newMarkers.forEach((m) => m.setMap(null));
    };
  }, [mapInstance, displayedColleges]);

  const handleSave = async (id) => {
    await saveCollege(id);
    await refreshUser();
  };

  return (
    <div className="space-y-6">
      <SectionCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-title">College Discovery & Maps</p>
            <p className="mt-2 text-sm text-slate-600">
              Browse verified institutions with facilities, course offerings, and real-time map locations.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 w-full lg:w-auto">
            <input
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400 text-sm"
              placeholder="College name"
              value={filters.name}
              onChange={(event) => setFilters({ ...filters, name: event.target.value })}
            />
            <input
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400 text-sm"
              placeholder="Filter by city / location"
              value={filters.city}
              onChange={(event) => setFilters({ ...filters, city: event.target.value })}
            />
            <input
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400 text-sm"
              placeholder="Filter by course"
              value={filters.course}
              onChange={(event) => setFilters({ ...filters, course: event.target.value })}
            />
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400 text-sm"
              value={filters.stage}
              onChange={(event) => setFilters({ ...filters, stage: event.target.value })}
            >
              <option value="">All Education Stages</option>
              <option value="10">After 10th Std (Diplomas)</option>
              <option value="12">After 12th Std (Degrees)</option>
            </select>
            <Button type="button" onClick={() => setSubmittedFilters({ ...filters })}>Search</Button>
          </div>
        </div>
      </SectionCard>

      {/* Google Map Section */}
      <SectionCard className="p-0 overflow-hidden">
        {!hasApiKey ? (
          <div className="bg-amber-50 p-6 text-amber-800 text-sm text-center">
            <p className="font-bold">Google Maps API Key Missing</p>
            <p className="mt-1">
              To render the real-time map, configure <code>VITE_GOOGLE_MAPS_API_KEY</code> in your <code>frontend/.env</code> file.
            </p>
          </div>
        ) : null}
        <div ref={mapRef} className="w-full h-[400px] bg-slate-100" />
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        {displayedColleges.map((college) => (
          <SectionCard key={college._id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">{college.name}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {college.location.city}, {college.location.state}
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {college.verifiedStatus}
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">Courses offered</p>
                <p className="mt-2 text-sm text-slate-600">
                  {college.coursesOffered.map((course) => course.name).join(", ")}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Facilities</p>
                <p className="mt-2 text-sm text-slate-600">{college.facilities.join(", ")}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Fees range</p>
                <p className="mt-2 text-sm text-slate-600">{college.feesRange}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Source</p>
                <p className="mt-2 text-sm text-slate-600">{college.source?.label}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => handleSave(college._id)}>Save college</Button>
              {college.contact?.website ? (
                <a
                  href={college.contact?.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Visit source
                </a>
              ) : null}
            </div>
          </SectionCard>
        ))}
        {submittedFilters && displayedColleges.length === 0 ? (
          <div className="col-span-full py-8 text-center text-slate-500 bg-white rounded-3xl border border-slate-100">
            No verified colleges match your search.
          </div>
        ) : null}
      </div>
    </div>
  );
}
