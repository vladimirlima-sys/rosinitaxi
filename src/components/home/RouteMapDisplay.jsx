import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation2, Satellite, Map, Share2, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function RouteMapDisplay({ departure, arrival, route, onClose }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapType, setMapType] = useState('roadmap');
  const [isClosing, setIsClosing] = useState(false);

  const handleCloseClick = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const toggleMapType = () => {
    const newType = mapType === 'roadmap' ? 'satellite' : 'roadmap';
    setMapType(newType);
    if (mapInstance.current) {
      mapInstance.current.setMapTypeId(newType);
    }
  };

  const handleShare = async () => {
    const text = `Confira minha rota: ${departure} → ${arrival}`;
    if (navigator.share) {
      navigator.share({ title: 'Rota', text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Rota copiada!');
    }
  };

  const handleDownload = () => {
    if (mapInstance.current) {
      const canvas = mapInstance.current.getDiv().querySelector('canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.href = canvas.toDataURL();
        link.download = `rota-${Date.now()}.png`;
        link.click();
        toast.success('Mapa salvo!');
      }
    }
  };

  useEffect(() => {
    if (!mapRef.current || !typeof google || !route) return;

    // Criar mapa
    if (!mapInstance.current) {
      mapInstance.current = new google.maps.Map(mapRef.current, {
        zoom: 11,
        center: { lat: 0, lng: 0 },
        mapTypeId: mapType,
        styles: mapType === 'roadmap' ? [
          { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
          {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }]
          },
          {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }]
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#263c3f' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#38414e' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#212a37' }]
          },
          {
            featureType: 'road.arterial',
            elementType: 'geometry',
            stylers: [{ color: '#756f63' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{ color: '#c9a96e' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#17263c' }]
          }
        ] : []
      });
    } else {
      mapInstance.current.setMapTypeId(mapType);
    }

    // Adicionar marcadores e polyline
    const map = mapInstance.current;
    
    // Limpar marcadores e polylines antigos
    map.overlays?.forEach(overlay => overlay.setMap(null));
    map.overlays = [];

    if (route && route.legs[0]) {
      const leg = route.legs[0];

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
          strokeWeight: 3,
          scale: 1.2,
          anchor: new google.maps.Point(0, 0)
        },
        label: {
          text: 'PARTIDA',
          color: '#0A0A0A',
          fontSize: '11px',
          fontWeight: 'bold'
        }
      });
      map.overlays.push(departureMarker);

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
          strokeWeight: 3,
          scale: 1.2,
          anchor: new google.maps.Point(0, 0)
        },
        label: {
          text: 'CHEGADA',
          color: '#fff',
          fontSize: '11px',
          fontWeight: 'bold'
        }
      });
      map.overlays.push(arrivalMarker);

      // Desenhar rota com sombra
      const shadowPolyline = new google.maps.Polyline({
        path: route.overview_path,
        geodesic: true,
        strokeColor: '#000',
        strokeOpacity: 0.3,
        strokeWeight: 6,
        map: map,
        zIndex: 1
      });
      map.overlays.push(shadowPolyline);

      const polyline = new google.maps.Polyline({
        path: route.overview_path,
        geodesic: true,
        strokeColor: '#C9A96E',
        strokeOpacity: 1,
        strokeWeight: 4,
        map: map,
        zIndex: 2
      });
      map.overlays.push(polyline);

      // Ajustar zoom para ver toda a rota
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(leg.start_location);
      bounds.extend(leg.end_location);
      map.fitBounds(bounds, 50);
    }

    setMapLoaded(true);
  }, [route, mapType]);

  return (
    <AnimatePresence>
      {!isClosing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-[#1a1a1a] rounded-2xl border border-[#C9A96E]/30 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#C9A96E]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Navigation2 className="w-5 h-5 text-[#C9A96E]" />
                <h3 className="text-white font-medium">Rota Calculada</h3>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleMapType}
                  className="p-2 rounded-lg text-white/60 transition-colors"
                  title="Alternar visualização"
                >
                  {mapType === 'roadmap' ? (
                    <Satellite className="w-4 h-4" />
                  ) : (
                    <Map className="w-4 h-4" />
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCloseClick}
                  className="p-2 rounded-lg text-white/60 w-6 h-6 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Map */}
            <div ref={mapRef} className="flex-1 min-h-[400px] bg-[#0A0A0A]" />

            {/* Footer com info */}
            <div className="p-6 border-t border-[#C9A96E]/30 bg-gradient-to-r from-[#0A0A0A] to-[#1a1a1a]">
              <div className="flex items-start gap-4 mb-4">
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wide flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-[#C9A96E]" />
                    Ponto de Partida
                  </p>
                  <p className="text-white text-sm mt-1">{departure}</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-white/40 text-xs uppercase tracking-wide flex items-center justify-end gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-[#4CAF50]" />
                    Ponto de Chegada
                  </p>
                  <p className="text-white text-sm mt-1">{arrival}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Compartilhar
                </motion.button>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Salvar
                </motion.button>
                <motion.div
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  asChild
                >
                  <Button
                    onClick={handleCloseClick}
                    className="flex-1 bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] font-semibold h-11 rounded-xl"
                  >
                    Fechar
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}