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
        // Get coordinates for both places
        const depResponse = await base44.functions.invoke('hereGeocoding', { address: departure });
        const arrResponse = await base44.functions.invoke('hereGeocoding', { address: arrival });

        if (depResponse.data?.lat && arrResponse.data?.lat) {
          const response = await base44.functions.invoke('hereRoutes', {
            departure: { lat: depResponse.data.lat, lng: depResponse.data.lng },
            arrival: { lat: arrResponse.data.lat, lng: arrResponse.data.lng },
          });

          if (response.data?.route) {
            // Decode polyline (simple decoding for flexpolyline format)
            const polyline = response.data.route;
            const coords = decodePolyline(polyline);
            
            setRouteCoordinates(coords);
            if (coords.length > 0) {
              setStartCoords(coords[0]);
              setEndCoords(coords[coords.length - 1]);
            }
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

  // Simple flexpolyline decoder
  const decodePolyline = (encoded) => {
    if (!encoded) return [];
    const points = [];
    let lat = 0, lng = 0, precision = 5;
    const factor = Math.pow(10, precision);
    
    for (let i = 0; i < encoded.length;) {
      let dlat = 0, shift = 0, result = 0;
      do {
        const byte = encoded.charCodeAt(i++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (shift < 32 && encoded.charCodeAt(i - 1) > 127);
      dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
      
      let dlng = 0;
      shift = 0;
      result = 0;
      do {
        const byte = encoded.charCodeAt(i++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (shift < 32 && encoded.charCodeAt(i - 1) > 127);
      dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
      
      lat += dlat;
      lng += dlng;
      points.push([lat / factor, lng / factor]);
    }
    return points;
  };

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