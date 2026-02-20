import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Clock, Zap, ExternalLink } from 'lucide-react';
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

export default function RouteMap({ departure, arrival, distance_km }) {
  const [travelTime, setTravelTime] = useState(null);
  const [departureCoords, setDepartureCoords] = useState(null);
  const [arrivalCoords, setArrivalCoords] = useState(null);

  useEffect(() => {
    if (!distance_km || distance_km === 0) return;

    const avgSpeed = 85; // km/h
    const hours = distance_km / avgSpeed;
    const minutes = Math.round((hours % 1) * 60);
    const finalHours = Math.floor(hours);
    
    setTravelTime({
      hours: finalHours,
      minutes: minutes,
      total: distance_km / avgSpeed
    });
  }, [distance_km]);

  // Geocode departure and arrival
  useEffect(() => {
    const geocodeLocation = async (location, setter) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1&countrycodes=ch,it,fr,de,at`
        );
        const data = await response.json();
        if (data.length > 0) {
          setter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      } catch (err) {
        console.error('Geocoding error:', err);
      }
    };

    if (departure && !departureCoords) geocodeLocation(departure, setDepartureCoords);
    if (arrival && !arrivalCoords) geocodeLocation(arrival, setArrivalCoords);
  }, [departure, arrival, departureCoords, arrivalCoords]);

  if (!departure || !arrival) return null;

  // Default map center if coords not available
  const center = departureCoords || [46.8, 8.2]; // Switzerland center
  const osmUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${encodeURIComponent(departure)};${encodeURIComponent(arrival)}`;

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03]">
      {/* Interactive Map */}
      <div className="relative h-80 bg-[#0d1117] overflow-hidden">
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
        </MapContainer>

        {/* Open in maps link */}
        <a
          href={osmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 flex items-center gap-1 px-3 py-2 bg-[#C9A96E]/20 hover:bg-[#C9A96E]/30 border border-[#C9A96E]/50 rounded-lg text-[#C9A96E] text-xs transition-all"
        >
          <ExternalLink className="w-3 h-3" /> Détails
        </a>
      </div>

      {/* Info bar */}
      {(distance_km || travelTime) && (
        <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border-t border-white/10">
          <div className="flex gap-6">
            {distance_km && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#C9A96E]/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#C9A96E]" />
                </div>
                <div>
                  <p className="text-white/40 text-xs">Distance</p>
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
                  <p className="text-white/40 text-xs">Durée estimée</p>
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