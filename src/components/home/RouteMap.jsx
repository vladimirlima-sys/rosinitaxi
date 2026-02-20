import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2 } from 'lucide-react';

// Fix Leaflet default icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const goldIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function FitBounds({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length >= 2) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [coords, map]);
  return null;
}

async function geocode(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
    { headers: { 'Accept-Language': 'fr' } }
  );
  const data = await res.json();
  if (data.length === 0) return null;
  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

async function fetchRoute(from, to) {
  const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.routes && data.routes.length > 0) {
    // GeoJSON coords are [lon, lat], Leaflet wants [lat, lon]
    return data.routes[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);
  }
  return [from, to];
}

export default function RouteMap({ departure, arrival }) {
  const [state, setState] = useState({ loading: false, fromCoord: null, toCoord: null, route: null, error: null });

  useEffect(() => {
    if (!departure || !arrival) return;

    let cancelled = false;
    setState({ loading: true, fromCoord: null, toCoord: null, route: null, error: null });

    (async () => {
      const [from, to] = await Promise.all([geocode(departure), geocode(arrival)]);
      if (cancelled) return;
      if (!from || !to) {
        setState(s => ({ ...s, loading: false, error: 'Impossible de localiser les adresses.' }));
        return;
      }
      const route = await fetchRoute(from, to);
      if (cancelled) return;
      setState({ loading: false, fromCoord: from, toCoord: to, route, error: null });
    })();

    return () => { cancelled = true; };
  }, [departure, arrival]);

  if (!departure || !arrival) return null;

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10" style={{ height: 280 }}>
      {state.loading && (
        <div className="h-full bg-[#0d1117] flex items-center justify-center gap-2 text-white/40 text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-[#C9A96E]" /> Chargement de la carte...
        </div>
      )}
      {state.error && (
        <div className="h-full bg-[#0d1117] flex items-center justify-center text-white/30 text-sm">
          {state.error}
        </div>
      )}
      {!state.loading && !state.error && state.fromCoord && state.toCoord && (
        <MapContainer
          center={state.fromCoord}
          zoom={6}
          style={{ height: '100%', width: '100%', background: '#0d1117' }}
          zoomControl={true}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <Marker position={state.fromCoord} icon={goldIcon} />
          <Marker position={state.toCoord} icon={greenIcon} />
          {state.route && (
            <Polyline
              positions={state.route}
              pathOptions={{ color: '#C9A96E', weight: 4, opacity: 0.85 }}
            />
          )}
          <FitBounds coords={state.route || [state.fromCoord, state.toCoord]} />
        </MapContainer>
      )}
    </div>
  );
}