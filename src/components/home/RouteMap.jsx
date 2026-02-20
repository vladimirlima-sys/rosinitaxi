import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, LoadScript, DirectionsRenderer } from '@react-google-maps/api';
import { Clock, Navigation, AlertCircle } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  fullscreenControl: true,
  mapTypeControl: false,
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1a' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#ffffff' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
  ]
};

export default function RouteMap({ departure, arrival, distance_km, waypoints = [], preferences = {} }) {
  const [directions, setDirections] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!departure || !arrival || !window.google) return;

    const directionsService = new window.google.maps.DirectionsService();
    setLoadingRoute(true);
    setError(null);

    // Build waypoints array for Google Maps
    const routeWaypoints = (waypoints || [])
      .filter(wp => wp.address && wp.address.trim())
      .map(wp => ({
        location: wp.address,
        stopover: true
      }));

    const request = {
      origin: departure,
      destination: arrival,
      waypoints: routeWaypoints.length > 0 ? routeWaypoints : undefined,
      travelMode: window.google.maps.TravelMode.DRIVING,
      avoidHighways: preferences?.avoid?.includes('highways') || false,
      avoidTolls: preferences?.avoid?.includes('tolls') || false,
      avoidFerries: preferences?.avoid?.includes('ferries') || false,
      optimizeWaypoints: true,
      provideRouteAlternatives: false
    };

    directionsService.route(request, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        setDirections(result);

        let totalDistance = 0;
        let totalDuration = 0;
        let totalDurationInTraffic = 0;

        result.routes[0].legs.forEach(leg => {
          totalDistance += leg.distance.value / 1000; // Convert to km
          totalDuration += leg.duration.value / 60; // Convert to minutes
          totalDurationInTraffic += (leg.duration_in_traffic?.value || leg.duration.value) / 60;
        });

        setRouteInfo({
          distance: Math.round(totalDistance),
          duration: Math.ceil(totalDuration),
          durationInTraffic: Math.ceil(totalDurationInTraffic),
          hasTraffic: totalDurationInTraffic > totalDuration
        });
      } else {
        setError(`Erro ao calcular rota: ${status}`);
      }
      setLoadingRoute(false);
    });
  }, [departure, arrival, waypoints, preferences]);

  if (!departure || !arrival) return null;

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03]">
      {/* Map */}
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
        <div className="relative h-80 bg-[#0d1117]">
          {loadingRoute && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="text-white text-sm">Calculando rota...</div>
            </div>
          )}
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={{ lat: 46.8, lng: 8.2 }}
            zoom={9}
            options={mapOptions}
            onLoad={map => mapRef.current = map}
          >
            {directions && (
              <DirectionsRenderer 
                directions={directions} 
                options={{ 
                  suppressPolylines: false, 
                  polylineOptions: { strokeColor: '#C9A96E', strokeWeight: 4 } 
                }} 
              />
            )}
          </GoogleMap>
        </div>
      </LoadScript>

      {/* Info bar */}
      {routeInfo && (
        <div className="px-6 py-4 bg-white/[0.02] border-t border-white/10 space-y-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#C9A96E]/10 flex items-center justify-center">
                <Navigation className="w-4 h-4 text-[#C9A96E]" />
              </div>
              <div>
                <p className="text-white/40 text-xs">Distância</p>
                <p className="text-white font-medium">{routeInfo.distance} km</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#C9A96E]/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#C9A96E]" />
              </div>
              <div>
                <p className="text-white/40 text-xs">Tempo estimado</p>
                <p className="text-white font-medium">
                  {Math.floor(routeInfo.duration / 60)}h {Math.round(routeInfo.duration % 60)}min
                </p>
              </div>
            </div>
          </div>

          {routeInfo.hasTraffic && (
            <div className="flex items-center gap-2 text-yellow-400 text-xs bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Tempo com trânsito: {Math.floor(routeInfo.durationInTraffic / 60)}h {Math.round(routeInfo.durationInTraffic % 60)}min</span>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}