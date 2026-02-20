import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, Clock, Zap } from 'lucide-react';

export default function RouteMap({ departure, arrival, distance_km }) {
  const [travelTime, setTravelTime] = useState(null);

  useEffect(() => {
    if (!distance_km || distance_km === 0) return;

    // Calculate travel time based on average speed
    // Average speed: 80-90 km/h on highways in Switzerland
    const avgSpeed = 85; // km/h
    const hours = distance_km / avgSpeed;
    const minutes = Math.round((hours % 1) * 60);
    const finalHours = Math.floor(hours);
    
    setTravelTime({
      hours: finalHours,
      minutes: minutes,
      total: distance_km / avgSpeed // in hours as decimal
    });
  }, [distance_km]);

  if (!departure || !arrival) return null;

  const osmUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${encodeURIComponent(departure)};${encodeURIComponent(arrival)}`;

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03]">
      {/* Map visual */}
      <div className="relative h-48 bg-[#0d1117] flex items-center justify-center overflow-hidden">
        {/* Decorative grid background */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(201,169,110,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Dotted route line */}
        <div className="relative w-full flex items-center justify-center px-10 gap-4">
          {/* Departure pin */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#C9A96E]/20 border border-[#C9A96E]/50 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#C9A96E]" />
            </div>
            <span className="text-white/60 text-xs text-center max-w-[100px] truncate">{departure}</span>
          </div>

          {/* Route line */}
          <div className="flex-1 flex items-center gap-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex-1 h-[2px] bg-[#C9A96E]/40 rounded-full" />
            ))}
            <Navigation className="w-5 h-5 text-[#C9A96E] flex-shrink-0 rotate-90" />
          </div>

          {/* Arrival pin */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-white/60 text-xs text-center max-w-[100px] truncate">{arrival}</span>
          </div>
        </div>

        {/* Open in maps link */}
        <a
          href={osmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 text-[10px] text-white/20 hover:text-[#C9A96E] transition-colors"
        >
          Voir sur la carte →
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