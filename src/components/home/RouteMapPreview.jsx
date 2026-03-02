import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

// Fix default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function RouteMapPreview({ departure, arrival, distance, time }) {
  const [routeCoordinates, setRouteCoordinates] = useState(null);
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const { lang } = useLang();
  const t = translations[lang];

  useEffect(() => {
    if (!departure || !arrival) return;

    const fetchRoute = async () => {
      setLoading(true);
      try {
        const response = await base44.functions.invoke('hereRoutes', {
          departure,
          arrival,
        });

        if (response.data?.route && response.data.route.length > 0) {
          const route = response.data.route[0];
          
          // Extract coordinates from polyline
          const coords = route.shape?.map(([lat, lng]) => [lat, lng]) || [];
          setRouteCoordinates(coords);

          // Get start and end points
          if (coords.length > 0) {
            setStartCoords(coords[0]);
            setEndCoords(coords[coords.length - 1]);
          }
        }
      } catch (error) {
        console.error('Route fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [departure, arrival]);

  if (!startCoords || !endCoords || !routeCoordinates) {
    return null;
  }

  const bounds = [startCoords, endCoords];
  const centerLat = (startCoords[0] + endCoords[0]) / 2;
  const centerLng = (startCoords[1] + endCoords[1]) / 2;

  return (
    <div className="bg-black border border-black/40 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-white/70 text-xs uppercase tracking-wider">{t.routeLabel || 'Trajet'}</h4>
        <div className="flex gap-4 text-sm">
          <div>
            <p className="text-white/40 text-xs">{t.summaryDistance || 'Distance'}</p>
            <p className="text-white font-semibold">{distance} km</p>
          </div>
          <div>
            <p className="text-white/40 text-xs">{t.duration || 'Durée'}</p>
            <p className="text-white font-semibold">{Math.floor(time / 60)}h {time % 60}min</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
          <p className="text-white/40 text-sm">Chargement du trajet...</p>
        </div>
      ) : (
        <div className="h-64 rounded-lg overflow-hidden border border-white/10">
          <MapContainer center={[centerLat, centerLng]} zoom={10} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {routeCoordinates && <Polyline positions={routeCoordinates} color="#F5C300" weight={3} />}
            <Marker position={startCoords}>
              <Popup>{departure}</Popup>
            </Marker>
            <Marker position={endCoords}>
              <Popup>{arrival}</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}
    </div>
  );
}