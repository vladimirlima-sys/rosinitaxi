import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';
import { hereCache } from '@/components/hereCache';

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
    if (!departure || !arrival) return;

    // If we don't have coords from selection, try to geocode the addresses
    const calculateRoute = async () => {
      setCalculating(true);
      try {
        let depCoords = departureCoords.current;
        let arrCoords = arrivalCoords.current;

        // Geocode departure if not yet resolved
        if (!depCoords) {
          const depRes = await base44.functions.invoke('hereGeocoding', {
            searchText: departure
          });
          if (depRes.data?.results?.[0]) {
            depCoords = { lat: depRes.data.results[0].lat, lng: depRes.data.results[0].lng };
          }
        }

        // Geocode arrival if not yet resolved
        if (!arrCoords) {
          const arrRes = await base44.functions.invoke('hereGeocoding', {
            searchText: arrival
          });
          if (arrRes.data?.results?.[0]) {
            arrCoords = { lat: arrRes.data.results[0].lat, lng: arrRes.data.results[0].lng };
          }
        }

        if (!depCoords || !arrCoords) return;

        const response = await base44.functions.invoke('hereRoutes', {
          departure: depCoords,
          arrival: arrCoords
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