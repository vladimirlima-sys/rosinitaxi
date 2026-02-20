import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Loader2, Navigation } from 'lucide-react';

// Custom icons for markers
const departureIcon = L.icon({
  iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23C9A96E"%3E%3Ccircle cx="12" cy="12" r="8"/%3E%3C/svg%3E',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const arrivalIcon = L.icon({
  iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2322c55e"%3E%3Ccircle cx="12" cy="12" r="8"/%3E%3C/svg%3E',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export default function RouteMap({ departure, arrival, onRouteCalculated }) {
  const [travelTime, setTravelTime] = useState(0);
  const [coordinates, setCoordinates] = useState({ departure: null, arrival: null });
  const [loading, setLoading] = useState(false);
  const [routePath, setRoutePath] = useState([]);

  const calculateEstimatedTime = (km) => {
    return Math.round((km / 70) * 60);
  };

  useEffect(() => {
    if (!departure || !arrival) return;

    setLoading(true);

    const geocodeLocation = async (query) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=ch,it,fr,de,at`
        );
        const data = await response.json();
        if (data.length > 0) {
          return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
      } catch (err) {
        console.error('Geocoding error:', err);
      }
      return null;
    };

    const fetchRoute = async () => {
      const depCoords = await geocodeLocation(departure);
      const arrCoords = await geocodeLocation(arrival);

      if (depCoords && arrCoords) {
        setCoordinates({ departure: depCoords, arrival: arrCoords });

        try {
          const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${depCoords.lng},${depCoords.lat};${arrCoords.lng},${arrCoords.lat}?overview=full&geometries=geojson`
          );
          const data = await response.json();

          if (data.routes && data.routes[0]) {
            const route = data.routes[0];
            const distance = Math.round(route.distance / 1000);
            const duration = Math.round(route.duration / 60);

            const pathCoordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            setRoutePath(pathCoordinates);
            setTravelTime(duration);

            onRouteCalculated({
              distance_km: distance,
              estimated_time_minutes: duration,
            });
          }
        } catch (err) {
          console.error('Route error:', err);
        }
      }

      setLoading(false);
    };

    fetchRoute();
  }, [departure, arrival, onRouteCalculated]);

  if (!coordinates.departure || !coordinates.arrival) {
    return loading ? (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-[#C9A96E] animate-spin" />
      </div>
    ) : null;
  }

  const center = [
    (coordinates.departure.lat + coordinates.arrival.lat) / 2,
    (coordinates.departure.lng + coordinates.arrival.lng) / 2,
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl overflow-hidden border border-white/10 h-80">
        <MapContainer
          center={center}
          zoom={9}
          style={{ height: '100%', width: '100%' }}
          className="z-10"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <Marker position={[coordinates.departure.lat, coordinates.departure.lng]} icon={departureIcon}>
            <Popup>Ponto de partida</Popup>
          </Marker>
          <Marker position={[coordinates.arrival.lat, coordinates.arrival.lng]} icon={arrivalIcon}>
            <Popup>Ponto de chegada</Popup>
          </Marker>
          {routePath.length > 0 && (
            <Polyline positions={routePath} color="#C9A96E" weight={3} opacity={0.8} />
          )}
        </MapContainer>
      </div>

      {routePath.length > 0 && (
        <div className="flex gap-6 p-4 rounded-lg bg-white/[0.03] border border-[#C9A96E]/20">
          <div className="flex items-center gap-3">
            <Navigation className="w-5 h-5 text-[#C9A96E]" />
            <div>
              <p className="text-white/40 text-xs">Distância</p>
              <p className="text-white font-medium">
                {Math.round((routePath.length * 111) / 1000)} km
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Navigation className="w-5 h-5 text-[#C9A96E] rotate-90" />
            <div>
              <p className="text-white/40 text-xs">Tempo estimado</p>
              <p className="text-white font-medium">
                {Math.floor(travelTime / 60)}h {travelTime % 60}min
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}