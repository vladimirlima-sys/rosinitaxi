import React, { useEffect, useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';
import { Loader2 } from 'lucide-react';

export default function RouteMapPreview({ departure, arrival, distance, time }) {
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { lang } = useLang();
  const t = translations[lang];
  const mapInstanceRef = useRef(null);

  // Load HERE Maps API script
  useEffect(() => {
    if (mapLoaded) return;

    const script = document.createElement('script');
    script.src = 'https://js.api.here.com/v3/3.1/mapsjs-core.js';
    script.async = true;
    script.onload = () => {
      const styleScript = document.createElement('script');
      styleScript.src = 'https://js.api.here.com/v3/3.1/mapsjs-service.js';
      styleScript.async = true;
      styleScript.onload = () => {
        const routingScript = document.createElement('script');
        routingScript.src = 'https://js.api.here.com/v3/3.1/mapsjs-ui.js';
        routingScript.async = true;
        routingScript.onload = () => {
          const linkElement = document.createElement('link');
          linkElement.rel = 'stylesheet';
          linkElement.type = 'text/css';
          linkElement.href = 'https://js.api.here.com/v3/3.1/mapsjs-ui.css';
          document.head.appendChild(linkElement);
          setMapLoaded(true);
        };
        document.head.appendChild(routingScript);
      };
      document.head.appendChild(styleScript);
    };
    document.head.appendChild(script);
  }, [mapLoaded]);

  // Initialize and render map with route
  useEffect(() => {
    if (!departure || !arrival || !mapLoaded || !mapRef.current) return;

    const fetchAndRenderRoute = async () => {
      setLoading(true);
      try {
        // Get coordinates for both places
        const depResponse = await base44.functions.invoke('hereGeocoding', { searchText: departure });
        const arrResponse = await base44.functions.invoke('hereGeocoding', { searchText: arrival });

        if (depResponse.data?.results?.[0] && arrResponse.data?.results?.[0]) {
          const depCoords = depResponse.data.results[0];
          const arrCoords = arrResponse.data.results[0];
          
          const response = await base44.functions.invoke('hereRoutes', {
            departure: { lat: depCoords.lat, lng: depCoords.lng },
            arrival: { lat: arrCoords.lat, lng: arrCoords.lng },
          });

          if (response.data?.route && window.H) {
            // Decode polyline
            const polyline = response.data.route;
            const coords = decodePolyline(polyline);
            
            // Initialize map
            const platform = new window.H.service.Platform({
              apikey: 'Ap0U6e3qHXxs2Ggx7jMQ3Hs0a3TxkljnBVj-A_FE_qY'
            });

            const defaultLayers = platform.createDefaultLayers();
            const map = new window.H.Map(
              mapRef.current,
              defaultLayers.vector.normal.map,
              {
                center: { lat: depCoords.lat, lng: depCoords.lng },
                zoom: 11
              }
            );

            // Add route line
            const lineString = new window.H.geo.LineString(
              coords.map(([lat, lng]) => ({ lat, lng }))
            );
            const polylineObject = new window.H.map.Polyline(lineString, {
              style: { strokeColor: '#F5C300', lineWidth: 4 }
            });
            map.addObject(polylineObject);

            // Add start marker
            const startMarker = new window.H.map.Marker(
              { lat: depCoords.lat, lng: depCoords.lng },
              { volatility: true }
            );
            map.addObject(startMarker);

            // Add end marker
            const endMarker = new window.H.map.Marker(
              { lat: arrCoords.lat, lng: arrCoords.lng },
              { volatility: true }
            );
            map.addObject(endMarker);

            // Fit to bounds
            map.getViewModel().setLookAtData({
              bounds: new window.H.geo.Rect(
                Math.min(depCoords.lat, arrCoords.lat),
                Math.min(depCoords.lng, arrCoords.lng),
                Math.max(depCoords.lat, arrCoords.lat),
                Math.max(depCoords.lng, arrCoords.lng)
              ),
              padding: { top: 50, bottom: 50, left: 50, right: 50 }
            });

            mapInstanceRef.current = map;
          }
        }
      } catch (error) {
        console.error('Route fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndRenderRoute();
  }, [departure, arrival, mapLoaded]);

  // Decode flexpolyline
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

  if (!departure || !arrival) {
    return null;
  }

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
          <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
        </div>
      ) : (
        <div 
          ref={mapRef} 
          className="h-64 rounded-lg overflow-hidden border border-white/10"
          style={{ width: '100%' }}
        />
      )}
    </div>
  );
}