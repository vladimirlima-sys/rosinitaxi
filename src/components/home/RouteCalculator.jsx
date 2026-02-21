import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function RouteCalculator({ departure, arrival, onRouteCalculated }) {
  const { lang } = useLang();
  const t = translations[lang];
  const [calculating, setCalculating] = useState(false);
  const departureCoords = useRef(null);
  const arrivalCoords = useRef(null);

  // Listen for place selections to get coordinates
  useEffect(() => {
    const handlePlaceSelected = (event) => {
      const detail = event.detail;
      if (departure && detail.address === departure) {
        departureCoords.current = { lat: detail.lat, lng: detail.lng };
      } else if (arrival && detail.address === arrival) {
        arrivalCoords.current = { lat: detail.lat, lng: detail.lng };
      }
    };

    window.addEventListener('placeSelected', handlePlaceSelected);
    return () => window.removeEventListener('placeSelected', handlePlaceSelected);
  }, [departure, arrival]);

  useEffect(() => {
    if (!departure || !arrival || !departureCoords.current || !arrivalCoords.current) return;

    const calculateRoute = async () => {
      setCalculating(true);
      try {
        const response = await base44.functions.invoke('hereRoutes', {
          departure: departureCoords.current,
          arrival: arrivalCoords.current
        });

        const data = response.data;
        if (data && data.distance_km > 0) {
          onRouteCalculated({
            distance_km: data.distance_km,
            estimated_time_minutes: data.estimated_time_minutes,
            route: data.route,
            polyline: data.polyline
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
  }, [departure, arrival, onRouteCalculated, t]);

  return null;
}