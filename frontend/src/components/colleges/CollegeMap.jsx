import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon paths in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `<div style="background-color:#2563eb; width:22px; height:22px; border-radius:50%; border:3px solid white; box-shadow:0 0 12px rgba(37,99,235,0.6); display:flex; align-items:center; justify-content:center;">
          <div style="background-color:white; width:6px; height:6px; border-radius:50%;"></div>
        </div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

const collegeIcon = L.divIcon({
  className: 'custom-college-marker',
  html: `<div style="background-color:#4f46e5; width:22px; height:22px; border-radius:50%; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; color:white; font-size:11px; font-weight:bold; cursor:pointer;">
          🎓
        </div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

export default function CollegeMap({ userLocation, colleges = [], onSelectCollege }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = userLocation?.lat || 19.7515;
      const initialLng = userLocation?.lng || 75.7139;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 10,
        scrollWheelZoom: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    const bounds = [];

    // Add User Marker
    if (userLocation?.lat && userLocation?.lng) {
      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .bindPopup(`<b>📍 Your Location</b><br/>${userLocation.name || 'User Position'}`);
      markersLayer.addLayer(userMarker);
      bounds.push([userLocation.lat, userLocation.lng]);
    }

    // Add College Markers
    colleges.forEach((c) => {
      const cLat = c.location?.coordinates?.[1];
      const cLng = c.location?.coordinates?.[0];
      if (cLat && cLng) {
        const marker = L.marker([cLat, cLng], { icon: collegeIcon });
        marker.bindPopup(`
          <div style="font-family:sans-serif; max-width:220px; line-height: 1.4;">
            <b style="font-size:12px; color:#1e293b;">${c.name}</b><br/>
            <span style="font-size:11px; color:#2563eb; font-weight:bold;">📍 ${c.distanceKm !== undefined ? `${c.distanceKm} km away` : ''}</span><br/>
            <span style="font-size:10px; color:#64748b;">${c.institutionType || ''}</span>
          </div>
        `);
        marker.on('click', () => {
          if (onSelectCollege) onSelectCollege(c);
        });
        markersLayer.addLayer(marker);
        bounds.push([cLat, cLng]);
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => clearTimeout(timer);
  }, [userLocation, colleges, onSelectCollege]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '420px' }} />
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
          You
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
          Colleges ({colleges.length})
        </span>
      </div>
    </div>
  );
}
