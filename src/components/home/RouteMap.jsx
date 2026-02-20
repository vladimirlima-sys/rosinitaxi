import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Clock, Navigation, ExternalLink, Loader2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icons
const departureIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const arrivalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function RouteMap({ departure, arrival, distance_km, onRouteCalculated }) {
  const [travelTime, setTravelTime] = useState(null);
  const [departureCoords, setDepartureCoords] = useState(null);
  const [arrivalCoords, setArrivalCoords] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);

  useEffect(() => {
    if (!distance_km || distance_km === 0) return;

    const avgSpeed = 80; // km/h average speed
    const hours = distance_km / avgSpeed;
    const minutes = Math.round((hours % 1) * 60);
    const finalHours = Math.floor(hours);
    
    setTravelTime({
      hours: finalHours,
      minutes: minutes,
      total: distance_km / avgSpeed
    });
  }, [distance_km]);

  // Geocode locations and get route
  useEffect(() => {
    const geocodeAndGetRoute = async () => {
      setIsLoading(true);
      try {
        // Geocode departure
        const depResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(departure)}&limit=1&countrycodes=ch,it,fr,de,at`
        );
        const depData = await depResponse.json();
        
        // Geocode arrival
        const arrResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(arrival)}&limit=1&countrycodes=ch,it,fr,de,at`
        );
        const arrData = arrResponse.json();

        if (depData.length > 0) {
          const depCoords = [parseFloat(depData[0].lat), parseFloat(depData[0].lon)];
          setDepartureCoords(depCoords);
          
          const arrDataJson = await arrResponse.json();
          if (arrDataJson.length > 0) {
            const arrCoords = [parseFloat(arrDataJson[0].lat), parseFloat(arrDataJson[0].lon)];
            setArrivalCoords(arrCoords);

            // Get route from OSRM
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${depCoords[1]},${depCoords[0]};${arrCoords[1]},${arrCoords[0]}?overview=full&geometries=geojson`;
            const routeResponse = await fetch(osrmUrl);
            const routeData = await routeResponse.json();
            
            if (routeData.routes && routeData.routes.length > 0) {
              const coords = routeData.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
              setRouteCoords(coords);
              
              const distance = Math.round(routeData.routes[0].distance / 1000);
              const duration = Math.round(routeData.routes[0].duration / 60);
              
              if (onRouteCalculated) {
                onRouteCalculated({
                  distance_km: distance,
                  duration_mins: duration
                });
              }
            }
          }
        }
      } catch (err) {
        console.error('Route calculation error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (departure && arrival) {
      geocodeAndGetRoute();
    }
  }, [departure, arrival, onRouteCalculated]);

  if (!departure || !arrival) return null;

  const center = departureCoords || [46.8, 8.2];
  const osmUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${encodeURIComponent(departure)};${encodeURIComponent(arrival)}`;

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03]">
      {/* Mapa interativo */}
      <div className="relative h-80 bg-[#0d1117] overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0d1117]/80 z-10">
            <div className="flex items-center gap-2 text-[#C9A96E]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Carregando rota...</span>
            </div>
          </div>
        )}

        <MapContainer center={center} zoom={9} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='© OpenStreetMap contributors'
          />
          {departureCoords && (
            <Marker position={departureCoords} icon={departureIcon}>
              <Popup>
                <div className="text-sm font-medium">{departure}</div>
              </Popup>
            </Marker>
          )}
          {arrivalCoords && (
            <Marker position={arrivalCoords} icon={arrivalIcon}>
              <Popup>
                <div className="text-sm font-medium">{arrival}</div>
              </Popup>
            </Marker>
          )}
          {routeCoords.length > 0 && (
            <Polyline positions={routeCoords} color="#C9A96E" weight={3} opacity={0.8} />
          )}
        </MapContainer>

        {/* Botão Detalhes */}
        <a
          href={osmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 flex items-center gap-1 px-3 py-2 bg-[#C9A96E]/20 hover:bg-[#C9A96E]/30 border border-[#C9A96E]/50 rounded-lg text-[#C9A96E] text-xs transition-all"
        >
          <ExternalLink className="w-3 h-3" /> Detalhes
        </a>
      </div>

      {/* Barra de informações */}
      {(distance_km || travelTime) && (
        <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border-t border-white/10">
          <div className="flex gap-6">
            {distance_km && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#C9A96E]/10 flex items-center justify-center">
                  <Navigation className="w-4 h-4 text-[#C9A96E]" />
                </div>
                <div>
                  <p className="text-white/40 text-xs">Distância</p>
                  <p className="text-white font-medium">{distance_km} km</p>
                </div>
              </div>
            )}
            {travelTime && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#C9A96E]/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[#C9A96E]" />
                </div>
                <div>
                  <p className="text-white/40 text-xs">Tempo estimado</p>
                  <p className="text-white font-medium">
                    {travelTime.hours > 0 && `${travelTime.hours}h `}
                    {travelTime.minutes}min
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}