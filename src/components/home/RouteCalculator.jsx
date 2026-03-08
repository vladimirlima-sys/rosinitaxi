import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';
import { hereCache } from '@/components/hereCache';

export default function RouteCalculator({ departure, arrival, stops = [], onRouteCalculated, onCalculating }) {
  const { lang } = useLang();
  const t = translations[lang];
  const [calculating, setCalculating] = useState(false);
  const departureCoords = useRef(null);
  const arrivalCoords = useRef(null);

  // Listen for place selections to get coordinates
  useEffect(() => {
    const handlePlaceSelected = (event) => {
      const detail = event.detail;
      if (detail.address === departure) {
        departureCoords.current = { lat: detail.lat, lng: detail.lng };
      }
      if (detail.address === arrival) {
        arrivalCoords.current = { lat: detail.lat, lng: detail.lng };
      }
    };

    window.addEventListener('placeSelected', handlePlaceSelected);
    return () => window.removeEventListener('placeSelected', handlePlaceSelected);
  }, [departure, arrival]);

  const geocodeAddress = async (address) => {
    let cached = hereCache.getGeocoding(address);
    if (!cached) {
      const res = await base44.functions.invoke('hereGeocoding', { searchText: address });
      cached = res.data?.results || [];
      if (cached.length > 0) hereCache.setGeocoding(address, cached);
    }
    return cached?.[0] ? { lat: cached[0].lat, lng: cached[0].lng } : null;
  };

  const getSegmentDistance = async (from, to) => {
    let routeData = hereCache.getRoute(from.lat, from.lng, to.lat, to.lng);
    if (!routeData) {
      const response = await base44.functions.invoke('hereRoutes', { departure: from, arrival: to });
      routeData = response.data;
      if (routeData?.distance_km > 0) {
        hereCache.setRoute(from.lat, from.lng, to.lat, to.lng, routeData);
      }
    }
    return routeData;
  };

  useEffect(() => {
    if (!departure || !arrival) return;

    const calculateRoute = async () => {
      setCalculating(true);
      onCalculating?.();
      window.dispatchEvent(new Event('routeCalculating'));
      try {
        let depCoords = departureCoords.current || await geocodeAddress(departure);
        let arrCoords = arrivalCoords.current || await geocodeAddress(arrival);

        if (!depCoords || !arrCoords) return;

        // Build waypoints: dep -> stops -> arr
        const validStops = stops.filter(s => s?.trim());
        
        if (validStops.length === 0) {
          // Direct route
          const routeData = await getSegmentDistance(depCoords, arrCoords);
          if (routeData?.distance_km > 0) {
            onRouteCalculated({
              distance_km: routeData.distance_km,
              estimated_time_minutes: routeData.estimated_time_minutes,
              route: routeData.route,
              polyline: routeData.polyline
            });
          }
        } else {
          // Multi-segment route: sum all segments
          const stopCoordsList = await Promise.all(validStops.map(geocodeAddress));
          const allPoints = [depCoords, ...stopCoordsList.filter(Boolean), arrCoords];
          
          let totalKm = 0;
          let totalMin = 0;
          for (let j = 0; j < allPoints.length - 1; j++) {
            const seg = await getSegmentDistance(allPoints[j], allPoints[j + 1]);
            if (seg?.distance_km > 0) {
              totalKm += seg.distance_km;
              totalMin += seg.estimated_time_minutes || 0;
            }
          }
          
          if (totalKm > 0) {
            onRouteCalculated({ distance_km: Math.round(totalKm), estimated_time_minutes: Math.round(totalMin) });
          }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departure, arrival, stops.join('|')]);

  return null;
}