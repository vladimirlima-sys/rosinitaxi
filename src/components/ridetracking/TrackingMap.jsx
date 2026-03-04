import React, { useEffect, useRef } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function TrackingMap({ booking, loading, error }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !booking) return;

    // Dynamically load HERE Maps
    const script = document.createElement('script');
    script.src = `https://js.api.here.com/v3/3.1/mapsjs-core.js`;
    script.async = true;
    script.onload = () => {
      const styleScript = document.createElement('script');
      styleScript.src = `https://js.api.here.com/v3/3.1/mapsjs-service.js`;
      styleScript.async = true;
      styleScript.onload = () => {
        const platformScript = document.createElement('script');
        platformScript.src = `https://js.api.here.com/v3/3.1/mapsjs-mapevents.js`;
        platformScript.async = true;
        platformScript.onload = initMap;
        document.head.appendChild(platformScript);
      };
      document.head.appendChild(styleScript);
    };
    document.head.appendChild(script);

    const initMap = async () => {
      try {
        const platform = new window.H.service.Platform({
          apikey: import.meta.env.VITE_HERE_API_KEY || Deno.env.get('HERE_API_KEY')
        });

        const defaultLayers = platform.createDefaultLayers();
        const map = new window.H.Map(
          mapRef.current,
          defaultLayers.vector.normal.map,
          {
            zoom: 12,
            center: { lat: 46.95, lng: 6.87 } // Lausanne default
          }
        );

        mapInstanceRef.current = map;
        window.addEventListener('resize', () => map.getViewPort().resize());

        // Add marker for departure point
        const marker = new window.H.map.Marker(
          { lat: 46.95, lng: 6.87 },
          { icon: new window.H.map.Icon('https://map.platform.here.com/mapsjs/demos/img/blue-pin.svg') }
        );
        map.addObject(marker);

        map.setCenter({ lat: 46.95, lng: 6.87 });
      } catch (err) {
        console.error('Map init error:', err);
      }
    };

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.dispose();
      }
    };
  }, [booking]);

  if (loading) {
    return (
      <div className="w-full h-64 md:h-80 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
        <Loader2 className="w-6 h-6 text-[#C9A96E] animate-spin" />
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
    <div
      ref={mapRef}
      className="w-full h-64 md:h-80 bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
    />
  );
}