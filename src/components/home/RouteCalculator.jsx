import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function RouteCalculator({ departure, arrival, onRouteCalculated }) {
  const { lang } = useLang();
  const t = translations[lang];
  const directionsService = useRef(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    if (typeof google !== 'undefined' && google.maps) {
      directionsService.current = new google.maps.DirectionsService();
    }
  }, []);

  useEffect(() => {
    if (!departure || !arrival || !directionsService.current) return;

    const calculateRoute = async () => {
      setCalculating(true);
      try {
        const result = await directionsService.current.route({
          origin: departure,
          destination: arrival,
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
          drivingOptions: {
            departureTime: new Date(),
            trafficModel: google.maps.TrafficModel.BEST_GUESS
          }
        });

        if (result.routes && result.routes.length > 0) {
          const route = result.routes[0];
          const leg = route.legs[0];

          // Extrair distância em km
          const distance = leg.distance.value / 1000;
          
          // Usar duração em tráfego em tempo real se disponível
          const duration = leg.duration_in_traffic ? 
            leg.duration_in_traffic.value / 60 : 
            leg.duration.value / 60;

          onRouteCalculated({
            distance_km: Math.round(distance * 10) / 10,
            estimated_time_minutes: Math.round(duration),
            route: route,
            bounds: result.routes[0].bounds
          });
        }
      } catch (err) {
       console.error('Route calculation error:', err);
       toast.error(t.routeError);
       onRouteCalculated({ distance_km: 0, estimated_time_minutes: 0, route: null });
      } finally {
        setCalculating(false);
      }
    };

    calculateRoute();
  }, [departure, arrival, onRouteCalculated]);

  return null;
}