import React, { useState, useRef } from 'react';
import { MapPin, Navigation, Compass, AlertCircle } from 'lucide-react';

export default function LocationInput({
  userLocation,
  setUserLocation,
  radius,
  setRadius,
  strictDistrict,
  setStrictDistrict,
  districts = [],
  knownCentroids = {}
}) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const watchdogRef = useRef(null);

  // Fallback network IP geolocation if hardware GPS is unavailable or blocked
  const detectViaNetwork = async () => {
    try {
      const response = await fetch('https://ipwho.is/');
      const data = await response.json();

      if (data && data.latitude && data.longitude) {
        let matchedDistrict = null;
        let displayName = `${data.city || 'Detected City'}, ${data.region || 'India'}`;

        if (data.city) {
          const lowerCity = data.city.toLowerCase().trim();
          for (const [k, v] of Object.entries(knownCentroids)) {
            if (lowerCity.includes(k) || k.includes(lowerCity)) {
              matchedDistrict = v.name;
              displayName = `${v.name}, ${v.state}`;
              break;
            }
          }
        }

        setUserLocation({
          lat: parseFloat(data.latitude.toFixed(4)),
          lng: parseFloat(data.longitude.toFixed(4)),
          name: displayName,
          district: matchedDistrict,
          source: 'network'
        });
        setGeoError(null);
      } else {
        throw new Error('Network location returned no coordinates');
      }
    } catch (err) {
      console.warn('Network location fallback failed:', err);
      setGeoError('Unable to detect location automatically. Please select your district below.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleDetectLocation = () => {
    setIsDetecting(true);
    setGeoError(null);

    // Watchdog timer: if browser geolocation does not respond within 3.5s, fallback to network IP
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    let resolved = false;

    watchdogRef.current = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.log('[Location] Geolocation timeout, switching to fast network location fallback...');
        detectViaNetwork();
      }
    }, 3500);

    if (!navigator.geolocation) {
      resolved = true;
      clearTimeout(watchdogRef.current);
      detectViaNetwork();
      return;
    }

    // Try device geolocation (fast network/Wi-Fi positioning, avoiding hardware GPS lock freezes on laptops)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(watchdogRef.current);

        const { latitude, longitude } = position.coords;

        // Try to identify district from nearest known centroid
        let nearestDist = Infinity;
        let nearestDistrict = null;

        for (const [k, v] of Object.entries(knownCentroids)) {
          const dLat = v.lat - latitude;
          const dLng = v.lng - longitude;
          const distSq = dLat * dLat + dLng * dLng;
          if (distSq < nearestDist) {
            nearestDist = distSq;
            if (distSq < 0.25) { // within ~40-50km
              nearestDistrict = v.name;
            }
          }
        }

        setUserLocation({
          lat: parseFloat(latitude.toFixed(4)),
          lng: parseFloat(longitude.toFixed(4)),
          name: nearestDistrict ? `${nearestDistrict} (Device GPS)` : 'Current Device Location',
          district: nearestDistrict,
          source: 'gps'
        });
        setGeoError(null);
        setIsDetecting(false);
      },
      (error) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(watchdogRef.current);
        console.warn('[Location] Device GPS returned error, falling back to network IP:', error.message);
        detectViaNetwork();
      },
      {
        enableHighAccuracy: false, // Prevents Windows/Desktop location service lockups
        timeout: 3000,
        maximumAge: 60000
      }
    );
  };

  const handleDistrictChange = (e) => {
    const selectedDistName = e.target.value;
    if (!selectedDistName) return;

    const lower = selectedDistName.toLowerCase().trim();
    let centroid = knownCentroids[lower];

    // Substring fallback if not exact match
    if (!centroid) {
      for (const [k, v] of Object.entries(knownCentroids)) {
        if (lower.includes(k) || k.includes(lower)) {
          centroid = v;
          break;
        }
      }
    }

    if (centroid) {
      setUserLocation({
        lat: centroid.lat,
        lng: centroid.lng,
        name: `${centroid.name}, ${centroid.state}`,
        district: centroid.name,
        source: 'district'
      });
      setGeoError(null);
    } else {
      setUserLocation({
        lat: 19.7515,
        lng: 75.7139,
        name: selectedDistName,
        district: selectedDistName,
        source: 'district'
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span>Location & District</span>
        </h3>
        {userLocation && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {userLocation.name || userLocation.district || `${userLocation.lat}, ${userLocation.lng}`}
          </span>
        )}
      </div>

      {/* GPS Button and District Dropdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isDetecting}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-blue-600/30 bg-blue-50/50 hover:bg-blue-100/70 text-blue-700 text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer"
        >
          <Navigation className={`w-4 h-4 ${isDetecting ? 'animate-spin' : 'text-blue-600'}`} />
          <span>{isDetecting ? 'Locating Device...' : 'Use My Current Location'}</span>
        </button>

        <div className="relative">
          <select
            value={userLocation?.district || ''}
            onChange={handleDistrictChange}
            className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium cursor-pointer"
          >
            <option value="">Select District (e.g. Pune, Mumbai, Nagpur)...</option>
            {districts.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
            <Compass className="w-4 h-4" />
          </div>
        </div>
      </div>

      {geoError && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Strict District vs Radius Filter Options */}
      <div className="pt-2 border-t border-slate-100 space-y-3">
        {userLocation?.district && (
          <div className="flex items-center justify-between bg-blue-50/70 p-2.5 rounded-xl border border-blue-200/60">
            <label className="flex items-center gap-2 text-xs font-semibold text-blue-900 cursor-pointer">
              <input
                type="checkbox"
                checked={strictDistrict}
                onChange={(e) => setStrictDistrict(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <span>Show ONLY colleges located in {userLocation.district} (Strict District Mode)</span>
            </label>
            {strictDistrict && (
              <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-md">
                Active
              </span>
            )}
          </div>
        )}

        {/* Radius Slider (Disabled when strict district is on) */}
        <div className={strictDistrict ? 'opacity-40 pointer-events-none' : ''}>
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
            <span className="font-medium">Search Distance Radius:</span>
            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              Within {radius} km
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="150"
            step="5"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>5 km (Local)</span>
            <span>25 km</span>
            <span>50 km (District)</span>
            <span>100 km</span>
            <span>150 km (Regional)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
