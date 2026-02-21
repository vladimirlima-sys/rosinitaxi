import { useEffect } from 'react';

export default function RouteCalculator({ departure, arrival, onRouteCalculated }) {
  useEffect(() => {
    if (!departure || !arrival) return;

    const calculateRoute = async () => {
      try {
        // Get coordinates from Nominatim
        const [depCoords, arrCoords] = await Promise.all([
          fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(departure)}&limit=1`)
            .then(r => r.json())
            .then(data => data[0] ? [parseFloat(data[0].lat), parseFloat(data[0].lon)] : null),
          fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(arrival)}&limit=1`)
            .then(r => r.json())
            .then(data => data[0] ? [parseFloat(data[0].lat), parseFloat(data[0].lon)] : null)
        ]);

        if (!depCoords || !arrCoords) {
          console.error('Could not geocode addresses');
          return;
        }

        // Get route from OSRM
        const routeResponse = await fetch(
          `https://router.project-osrm.org/route/v1/car/${depCoords[1]},${depCoords[0]};${arrCoords[1]},${arrCoords[0]}?overview=full&geometries=geojson`
        );
        const routeData = await routeResponse.json();

        if (routeData.routes && routeData.routes.length > 0) {
          const route = routeData.routes[0];
          const distance_km = (route.distance / 1000).toFixed(1);
          const estimated_time_minutes = Math.round(route.duration / 60);

          onRouteCalculated({
            distance_km: parseFloat(distance_km),
            estimated_time_minutes,
            route: route.geometry
          });
        }
      } catch (err) {
        console.error('Route calculation error:', err);
      }
    };

    calculateRoute();
  }, [departure, arrival, onRouteCalculated]);

  return null;
}