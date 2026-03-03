import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';
import { hereCache } from '@/components/hereCache';

export default function RouteCalculator({ departure, arrival, onRouteCalculated, onCalculating }) {
  const { lang } = useLang();
  const t = translations[lang];
  const [calculating, setCalculating] = useState(false);
  const departureCoords = useRef(null);
  const arrivalCoords = useRef(null);

  // Listen for place selections to get coordinates
  useEffect(() => {
    const handlePlaceSelected = (event) => {
      const detail = event.detail;
      // Store coords whenever the address matches current departure or arrival
      // Also store as "last known" for the field that just changed
      if (detail.address === departure) {
        departureCoords.current = { lat: detail.lat, lng: detail.lng };
      }
      if (detail.address === arrival) {
        arrivalCoords.current = { lat: detail.lat, lng: detail.lng };
      }
      // When geolocation sets departure and dispatches event before state updates,
      // store by a global key so we can retrieve it
      if (detail.isGeolocation) {
        window.__lastGeolocatedCoords = { address: detail.address, lat: detail.lat, lng: detail.lng };
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
      onCalculating?.();
      try {
        let depCoords = departureCoords.current;
        let arrCoords = arrivalCoords.current;

        // Geocode departure if not yet resolved
        if (!depCoords) {
          let cachedDep = hereCache.getGeocoding(departure);
          if (!cachedDep) {
            const depRes = await base44.functions.invoke('hereGeocoding', {
              searchText: departure
            });
            cachedDep = depRes.data?.results || [];
            if (cachedDep.length > 0) hereCache.setGeocoding(departure, cachedDep);
          }
          if (cachedDep?.[0]) {
            depCoords = { lat: cachedDep[0].lat, lng: cachedDep[0].lng };
          }
        }

        // Geocode arrival if not yet resolved
        if (!arrCoords) {
          let cachedArr = hereCache.getGeocoding(arrival);
          if (!cachedArr) {
            const arrRes = await base44.functions.invoke('hereGeocoding', {
              searchText: arrival
            });
            cachedArr = arrRes.data?.results || [];
            if (cachedArr.length > 0) hereCache.setGeocoding(arrival, cachedArr);
          }
          if (cachedArr?.[0]) {
            arrCoords = { lat: cachedArr[0].lat, lng: cachedArr[0].lng };
          }
        }

        if (!depCoords || !arrCoords) return;

        // Check if route is cached
        let routeData = hereCache.getRoute(depCoords.lat, depCoords.lng, arrCoords.lat, arrCoords.lng);
        
        if (!routeData) {
          const response = await base44.functions.invoke('hereRoutes', {
            departure: depCoords,
            arrival: arrCoords
          });
          routeData = response.data;
          if (routeData && routeData.distance_km > 0) {
            hereCache.setRoute(depCoords.lat, depCoords.lng, arrCoords.lat, arrCoords.lng, routeData);
          }
        }

        if (routeData && routeData.distance_km > 0) {
          onRouteCalculated({
            distance_km: routeData.distance_km,
            estimated_time_minutes: routeData.estimated_time_minutes,
            route: routeData.route,
            polyline: routeData.polyline
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departure, arrival]);

  return null;
}