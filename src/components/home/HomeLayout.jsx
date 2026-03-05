import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronUp } from 'lucide-react';
import BookingForm from './BookingForm';
import RouteMapDisplay from './RouteMapDisplay';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function HomeLayout({ bookingRef }) {
  const [showMap, setShowMap] = useState(false);
  const [mapRoute, setMapRoute] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // Listen for route calculated to show map button
  useEffect(() => {
    const handleRouteCalculated = (e) => {
      const { route } = e.detail || {};
      if (route) setMapRoute(route);
    };
    
    window.addEventListener('routeCalculated', handleRouteCalculated);
    return () => window.removeEventListener('routeCalculated', handleRouteCalculated);
  }, []);

  // Simple map background
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    if (!mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: 46.5197, lng: 6.6323 }, // Lausanne
        mapTypeId: 'roadmap',
        disableDefaultUI: true,
        zoomControl: false,
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
      });
    }
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-100">
      {/* Map Background */}
      <div ref={mapRef} className="absolute inset-0 w-full h-full" />
      
      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

      {/* Bottom Sheet Container */}
      <div
        className={`absolute bottom-0 left-0 right-0 rounded-t-3xl bg-[#F5C300] shadow-2xl transition-all duration-300 ease-out ${
          isExpanded ? 'h-screen' : 'h-[65vh]'
        }`}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex flex-col items-center justify-center hover:opacity-70 transition-opacity"
          >
            <div className="w-10 h-1 rounded-full bg-black/30 mb-2" />
            <ChevronUp className={`w-5 h-5 text-black/50 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div ref={bookingRef} className={`overflow-y-auto ${isExpanded ? 'h-[calc(100%-80px)]' : 'h-[calc(100%-60px)]'} px-3 sm:px-4`}>
          <BookingForm bookingRef={bookingRef} />
        </div>
      </div>

      {/* Map button (floating) */}
      {mapRoute && (
        <button
          onClick={() => setShowMap(true)}
          className="absolute top-6 right-6 z-40 bg-black text-white p-3 rounded-full shadow-lg hover:bg-black/80 transition-all flex items-center gap-2"
        >
          <MapPin className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">Ver rota</span>
        </button>
      )}

      {/* Map Modal */}
      {showMap && mapRoute && (
        <RouteMapDisplay
          departure=""
          arrival=""
          route={mapRoute}
          onClose={() => setShowMap(false)}
        />
      )}
    </div>
  );
}