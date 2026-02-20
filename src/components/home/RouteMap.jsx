import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { Clock, Navigation, ExternalLink, Loader2 } from 'lucide-react';

const mapContainerStyle = {
  height: '100%',
  width: '100%'
};

const defaultCenter = {
  lat: 46.2044,
  lng: 6.1432 // Suíça
};

export default function RouteMap({ departure, arrival, distance_km, onRouteCalculated }) {
  const [directionsResult, setDirectionsResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null);

  useEffect(() => {
    if (!departure || !arrival) return;

    const calculateRoute = async () => {
      setIsLoading(true);
      setMapError(null);
      
      try {
        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          setMapError('Chave do Google Maps não configurada');
          return;
        }

        const directionsService = new window.google.maps.DirectionsService();
        
        const result = await directionsService.route({
          origin: departure,
          destination: arrival,
          travelMode: window.google.maps.TravelMode.DRIVING,
        });

        if (result.routes.length > 0) {
          setDirectionsResult(result);
          
          const route = result.routes[0];
          const leg = route.legs[0];
          
          setRouteDetails({
            distance: leg.distance.text,
            distance_km: Math.round(leg.distance.value / 1000),
            duration: leg.duration.text,
            duration_mins: Math.round(leg.duration.value / 60)
          });

          if (onRouteCalculated) {
            onRouteCalculated({
              distance_km: Math.round(leg.distance.value / 1000),
              duration_mins: Math.round(leg.duration.value / 60)
            });
          }
        }
      } catch (err) {
        console.error('Erro ao calcular rota:', err);
        setMapError('Erro ao calcular rota');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(calculateRoute, 500);
    return () => clearTimeout(timer);
  }, [departure, arrival, onRouteCalculated]);

  const googleMapsLink = `https://www.google.com/maps/dir/${encodeURIComponent(departure)}/${encodeURIComponent(arrival)}`;
  
  const mapCenter = directionsResult?.routes[0]?.bounds?.getCenter() || defaultCenter;

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}>
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03]">
        {/* Mapa */}
        <div className="relative h-80 bg-[#0d1117] overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0d1117]/80 z-10">
              <div className="flex items-center gap-2 text-[#C9A96E]">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Calculando rota...</span>
              </div>
            </div>
          )}

          {mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0d1117]/80 z-10">
              <p className="text-red-400 text-sm">{mapError}</p>
            </div>
          )}

          {departure && arrival && (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={11}
              options={{
                fullscreenControl: false,
                streetViewControl: false,
                mapTypeControl: false,
                styles: [
                  {
                    elementType: 'geometry',
                    stylers: [{ color: '#1a1a1a' }]
                  },
                  {
                    elementType: 'labels.text.stroke',
                    stylers: [{ color: '#242f3e' }]
                  },
                  {
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#746855' }]
                  },
                  {
                    featureType: 'road',
                    elementType: 'geometry',
                    stylers: [{ color: '#38414e' }]
                  },
                  {
                    featureType: 'road',
                    elementType: 'geometry.stroke',
                    stylers: [{ color: '#212a37' }]
                  }
                ]
              }}
            >
              {directionsResult && (
                <DirectionsRenderer
                  directions={directionsResult}
                  options={{
                    polylineOptions: {
                      geodesic: true,
                      strokeColor: '#C9A96E',
                      strokeOpacity: 0.8,
                      strokeWeight: 3
                    }
                  }}
                />
              )}
            </GoogleMap>
          )}

          {/* Botão Detalhes */}
          <a
            href={googleMapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-3 flex items-center gap-1 px-3 py-2 bg-[#C9A96E]/20 hover:bg-[#C9A96E]/30 border border-[#C9A96E]/50 rounded-lg text-[#C9A96E] text-xs transition-all"
          >
            <ExternalLink className="w-3 h-3" /> Detalhes
          </a>
        </div>

        {/* Barra de informações */}
        {routeDetails && (
          <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border-t border-white/10">
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#C9A96E]/10 flex items-center justify-center">
                  <Navigation className="w-4 h-4 text-[#C9A96E]" />
                </div>
                <div>
                  <p className="text-white/40 text-xs">Distância</p>
                  <p className="text-white font-medium">{routeDetails.distance}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#C9A96E]/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[#C9A96E]" />
                </div>
                <div>
                  <p className="text-white/40 text-xs">Tempo estimado</p>
                  <p className="text-white font-medium">{routeDetails.duration}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </LoadScript>
  );
}