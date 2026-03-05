import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function TrackingMap({ booking, loading, error }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!booking?.id) return;

    const fetchLatestLocation = async () => {
      try {
        const locations = await base44.entities.DriverLocation.filter(
          { booking_id: booking.id },
          '-timestamp',
          1
        );
        if (locations?.length > 0) setDriverLocation(locations[0]);
      } catch (err) {
        console.error('Failed to load driver location:', err);
      }
    };

    // Initial fetch
    fetchLatestLocation();

    // Poll every 5 seconds as primary update mechanism
    const interval = setInterval(fetchLatestLocation, 5000);

    // Also subscribe for real-time updates
    unsubscribeRef.current = base44.entities.DriverLocation.subscribe((event) => {
      if (event.data?.booking_id === booking.id && (event.type === 'create' || event.type === 'update')) {
        setDriverLocation(event.data);
      }
    });

    return () => {
      clearInterval(interval);
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [booking?.id]);

  // Load Leaflet CSS
  useEffect(() => {
    if (document.getElementById('leaflet-css')) return;
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }, []);

  // Init Leaflet map only once
  useEffect(() => {
    if (!mapRef.current || loading || error || !booking) return;
    if (mapInstanceRef.current) return; // already initialized

    const initMap = async () => {
      try {
        let L = window.L;
        if (!L) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
          L = window.L;
        }

        const map = L.map(mapRef.current).setView([46.95, 6.87], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        mapInstanceRef.current = map;
        setMapLoaded(true);
      } catch (err) {
        console.error('Map init error:', err);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapLoaded(false);
      }
    };
  }, [booking?.id]); // only re-init if booking ID changes

  // Update driver marker when location changes - move marker instead of recreating
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !driverLocation || !window.L) return;

    const L = window.L;
    const lat = driverLocation.latitude;
    const lng = driverLocation.longitude;

    if (driverMarkerRef.current) {
      // Just move the existing marker - no flicker, no map reset
      driverMarkerRef.current.setLatLng([lat, lng]);
    } else {
      const icon = L.divIcon({
        html: `<div style="background:#F5C300;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>`,
        className: '',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });
      driverMarkerRef.current = L.marker([lat, lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup('🚗 Chauffeur');
    }

    // Pan map smoothly to follow driver
    mapInstanceRef.current.panTo([lat, lng]);
  }, [driverLocation, mapLoaded]);

  if (loading) {
    return (
      <div className="w-full h-64 md:h-80 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
        <Loader2 className="w-6 h-6 text-[#F5C300] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-64 md:h-80 bg-white/5 rounded-2xl flex flex-col items-center justify-center border border-white/10">
        <AlertCircle className="w-6 h-6 text-red-400 mb-2" />
        <p className="text-white/40 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full h-64 md:h-80 rounded-2xl border border-white/10 overflow-hidden"
        style={{ zIndex: 0 }}
      />
      {!driverLocation && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2">
            <p className="text-white/60 text-xs flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Position du chauffeur non disponible
            </p>
          </div>
        </div>
      )}
    </div>
  );
}