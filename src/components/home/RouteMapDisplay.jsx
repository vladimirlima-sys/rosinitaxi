import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function RouteMapDisplay({ route, departure, arrival }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !route) return;

    // Initialize map
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([46.8, 8.2], 7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance.current);
    }

    const map = mapInstance.current;

    // Clear previous markers
    map.eachLayer(layer => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Add route line
    if (route.coordinates) {
      const latlngs = route.coordinates.map(coord => [coord[1], coord[0]]);
      L.polyline(latlngs, { color: '#000', weight: 3 }).addTo(map);
      
      // Fit bounds to route
      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [50, 50] });

      // Add markers for start and end
      if (latlngs.length > 0) {
        L.circleMarker(latlngs[0], { radius: 6, color: '#F5C300', weight: 2, fillColor: '#000', fillOpacity: 1 })
          .bindPopup(departure)
          .addTo(map);
        
        L.circleMarker(latlngs[latlngs.length - 1], { radius: 6, color: '#F5C300', weight: 2, fillColor: '#000', fillOpacity: 1 })
          .bindPopup(arrival)
          .addTo(map);
      }
    }
  }, [route, departure, arrival]);

  return <div ref={mapRef} className="w-full h-96 rounded-lg border border-black/10" />;
}