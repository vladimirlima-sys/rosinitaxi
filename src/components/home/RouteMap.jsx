import React, { useEffect, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

export default function RouteMap({ departure, arrival }) {
  const [mapUrl, setMapUrl] = useState(null);

  useEffect(() => {
    if (!departure || !arrival) return;

    // Build OpenStreetMap static map via staticmap.net with a route
    const dep = encodeURIComponent(departure);
    const arr = encodeURIComponent(arrival);

    // Use OpenRouteService static map as background with markers
    // Fallback: build a visual card with geocoded markers via nominatim
    const url = `https://staticmap.openrouteservice.org/v0.1/staticmap?size=800x300&key=&profile=driving-car&from=${dep}&to=${arr}`;
    
    // We'll use a simpler approach: embed a linked image from geoapify
    const geoapifyUrl = `https://maps.geoapify.com/v1/staticmap?style=dark-matter&width=800&height=300&center=lonlat:8.2275,46.8182&zoom=6.5&apiKey=placeholder`;

    // Best approach: use openstreetmap tile with a clear visual card
    setMapUrl('ready');
  }, [departure, arrival]);

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
    </div>
  );
}