import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
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
        toast.error('Erro ao calcular rota. Verifique os endereços.');
        onRouteCalculated({ distance_km: 0, estimated_time_minutes: 0, route: null });
      } finally {
        setCalculating(false);
      }
    };

    calculateRoute();
  }, [departure, arrival, onRouteCalculated]);

  if (!calculating) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 flex items-center gap-3 px-6 py-4 rounded-2xl bg-[#C9A96E]/95 backdrop-blur-sm border border-[#C9A96E]/50 shadow-2xl">
      <Loader2 className="w-5 h-5 text-[#0A0A0A] animate-spin" />
      <span className="text-[#0A0A0A] font-medium text-sm">Calculando rota...</span>
    </div>
  );
}