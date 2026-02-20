import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function RouteCalculator({ departure, arrival, onRouteCalculated }) {
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
          unitSystem: google.maps.UnitSystem.METRIC
        });

        if (result.routes && result.routes.length > 0) {
          const route = result.routes[0];
          const leg = route.legs[0];

          // Extrair distância em km e tempo em minutos
          const distance = leg.distance.value / 1000; // converter metros para km
          const duration = leg.duration.value / 60; // converter segundos para minutos

          onRouteCalculated({
            distance_km: Math.round(distance * 10) / 10, // arredondar para 1 casa decimal
            estimated_time_minutes: Math.round(duration),
            route: route
          });
        }
      } catch (err) {
        console.error('Route calculation error:', err);
        toast.error('Erro ao calcular rota. Verifique os endereços.');
        onRouteCalculated({ distance_km: 0, estimated_time_minutes: 0, route: null });
      } finally {
        setCalculating(false);
      }
    };

    calculateRoute();
  }, [departure, arrival, onRouteCalculated]);

  return null;
}