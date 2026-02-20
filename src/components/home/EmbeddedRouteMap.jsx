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

      // Marcador de partida
      const departureMarker = new google.maps.Marker({
        position: leg.start_location,
        map: map,
        title: 'Partida',
        icon: {
          path: 'M0,-28a28,28 0 0,1 0,56a28,28 0 0,1 0,-56',
          fillColor: '#C9A96E',
          fillOpacity: 1,
          strokeColor: '#0A0A0A',
          strokeWeight: 2,
          scale: 0.8,
          anchor: new google.maps.Point(0, 0)
        }
      });
      mapInstance.current.overlays.push(departureMarker);

      // Marcador de chegada
      const arrivalMarker = new google.maps.Marker({
        position: leg.end_location,
        map: map,
        title: 'Chegada',
        icon: {
          path: 'M0,-28a28,28 0 0,1 0,56a28,28 0 0,1 0,-56',
          fillColor: '#4CAF50',
          fillOpacity: 1,
          strokeColor: '#0A0A0A',
          strokeWeight: 2,
          scale: 0.8,
          anchor: new google.maps.Point(0, 0)
        }
      });
      mapInstance.current.overlays.push(arrivalMarker);

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