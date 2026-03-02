import React, { useEffect, useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';
import { Loader2, ZoomIn, ZoomOut, MapPin, Car, Bike, Footprints } from 'lucide-react';

export default function RouteMapPreview({ departure, arrival, distance, time }) {
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [transportMode, setTransportMode] = useState('car');
  const [zoomLevel, setZoomLevel] = useState(11);
  const { lang } = useLang();
  const t = translations[lang];
  const mapInstanceRef = useRef(null);
  const coordsRef = useRef(null);

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
          
          // Map transport modes to HERE routing modes
          const modeMap = {
            car: 'car',
            bike: 'bicycle',
            pedestrian: 'pedestrian'
          };

          const response = await base44.functions.invoke('hereRoutes', {
            departure: { lat: depCoords.lat, lng: depCoords.lng },
            arrival: { lat: arrCoords.lat, lng: arrCoords.lng },
            mode: modeMap[transportMode]
          });

          if (response.data?.route && window.H) {
            // Decode polyline
            const polyline = response.data.route;
            const coords = decodePolyline(polyline);
            
            // Clear existing map
            if (mapInstanceRef.current) {
              mapInstanceRef.current.removeObjects(mapInstanceRef.current.getObjects());
            }

            // Initialize map if not exists
            if (!mapInstanceRef.current) {
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

              // Add zoom event listener
              map.addEventListener('zoom', (e) => {
                setZoomLevel(map.getZoom());
              });

              mapInstanceRef.current = map;
            }

            const map = mapInstanceRef.current;

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

            // Store coords for recenter
            coordsRef.current = {
              dep: { lat: depCoords.lat, lng: depCoords.lng },
              arr: { lat: arrCoords.lat, lng: arrCoords.lng }
            };

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
          }
        }
      } catch (error) {
        console.error('Route fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndRenderRoute();
  }, [departure, arrival, mapLoaded, transportMode]);

  const handleRecenter = () => {
    if (mapInstanceRef.current && coordsRef.current) {
      mapInstanceRef.current.getViewModel().setLookAtData({
        bounds: new window.H.geo.Rect(
          Math.min(coordsRef.current.dep.lat, coordsRef.current.arr.lat),
          Math.min(coordsRef.current.dep.lng, coordsRef.current.arr.lng),
          Math.max(coordsRef.current.dep.lat, coordsRef.current.arr.lat),
          Math.max(coordsRef.current.dep.lng, coordsRef.current.arr.lng)
        ),
        padding: { top: 50, bottom: 50, left: 50, right: 50 }
      });
    }
  };

  const handleZoom = (direction) => {
    if (mapInstanceRef.current) {
      const newZoom = direction === 'in' 
        ? Math.min(zoomLevel + 1, 20)
        : Math.max(zoomLevel - 1, 0);
      mapInstanceRef.current.setZoom(newZoom);
      setZoomLevel(newZoom);
    }
  };

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
      {/* Header */}
      <div className="flex items-center justify-between">
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

      {/* Transport Mode Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setTransportMode('car')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
            transportMode === 'car' 
              ? 'bg-[#F5C300] text-black' 
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          <Car className="w-4 h-4" />
          Carro
        </button>
        <button
          onClick={() => setTransportMode('bike')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
            transportMode === 'bike' 
              ? 'bg-[#F5C300] text-black' 
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          <Bike className="w-4 h-4" />
          Bicicleta
        </button>
        <button
          onClick={() => setTransportMode('pedestrian')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
            transportMode === 'pedestrian' 
              ? 'bg-[#F5C300] text-black' 
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          <Footprints className="w-4 h-4" />
          Pedestriano
        </button>
      </div>

      {/* Map Container with Controls */}
      <div className="relative">
        {loading ? (
          <div className="h-96 bg-white/5 rounded-lg flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
          </div>
        ) : (
          <>
            <div 
              ref={mapRef} 
              className="h-96 rounded-lg overflow-hidden border border-white/10"
              style={{ width: '100%' }}
            />
            
            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {/* Zoom Controls */}
              <div className="flex flex-col gap-1 bg-black/60 rounded-lg border border-white/10">
                <button
                  onClick={() => handleZoom('in')}
                  className="p-2 text-white/60 hover:text-white/90 hover:bg-white/10 transition-all"
                  title="Ampliar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="px-2 py-1 text-xs text-white/60 text-center border-t border-white/10">
                  {zoomLevel}
                </div>
                <button
                  onClick={() => handleZoom('out')}
                  className="p-2 text-white/60 hover:text-white/90 hover:bg-white/10 transition-all border-t border-white/10"
                  title="Afastar"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
              </div>

              {/* Recenter Button */}
              <button
                onClick={handleRecenter}
                className="p-2 bg-black/60 text-white/60 hover:text-white/90 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
                title="Centrar rota"
              >
                <MapPin className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}