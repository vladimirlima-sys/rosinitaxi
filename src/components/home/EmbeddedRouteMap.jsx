import React, { useEffect, useRef, useState } from 'react';

export default function EmbeddedRouteMap({ departure, arrival, route }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current || !typeof google || !google.maps) return;

    // Criar mapa
    if (!mapInstance.current) {
      mapInstance.current = new google.maps.Map(mapRef.current, {
        zoom: 11,
        center: { lat: 45.5, lng: 8.5 },
        mapTypeId: 'roadmap',
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1a' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#9CA3AF' }] },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#2d2d2d' }]
          },
          {
            featureType: 'road.arterial',
            elementType: 'geometry',
            stylers: [{ color: '#373737' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{ color: '#3e3e3e' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#0f172a' }]
          }
        ]
      });
    }

    // Limpar overlays antigos
    if (mapInstance.current.overlays) {
      mapInstance.current.overlays.forEach(overlay => overlay.setMap(null));
      mapInstance.current.overlays = [];
    } else {
      mapInstance.current.overlays = [];
    }

    if (route && route.legs[0]) {
      const leg = route.legs[0];
      const map = mapInstance.current;

      // Marcador de partida (ponto simples)
      const departureCircle = new google.maps.Circle({
        center: leg.start_location,
        radius: 200,
        map: map,
        fillColor: '#C9A96E',
        fillOpacity: 0.8,
        strokeColor: '#C9A96E',
        strokeWeight: 2,
        strokeOpacity: 0.6,
        zIndex: 2
      });
      mapInstance.current.overlays.push(departureCircle);

      // Marcador de chegada (ponto simples)
      const arrivalCircle = new google.maps.Circle({
        center: leg.end_location,
        radius: 200,
        map: map,
        fillColor: '#4CAF50',
        fillOpacity: 0.8,
        strokeColor: '#4CAF50',
        strokeWeight: 2,
        strokeOpacity: 0.6,
        zIndex: 2
      });
      mapInstance.current.overlays.push(arrivalCircle);

      // Desenhar rota
      const polyline = new google.maps.Polyline({
        path: route.overview_path,
        geodesic: true,
        strokeColor: '#C9A96E',
        strokeOpacity: 1,
        strokeWeight: 3,
        map: map,
        zIndex: 2
      });
      mapInstance.current.overlays.push(polyline);

      // Ajustar zoom
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(leg.start_location);
      bounds.extend(leg.end_location);
      map.fitBounds(bounds, 50);

      setMapLoaded(true);
    }
  }, [route]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-64 rounded-2xl overflow-hidden border border-[#C9A96E]/20 shadow-lg bg-[#1a1a1a]"
    />
  );
}