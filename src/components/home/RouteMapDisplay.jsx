import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation2, Satellite, Map, Share2, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function RouteMapDisplay({ departure, arrival, route, onClose }) {
  const { lang } = useLang();
  const t = translations[lang];
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
        title: t.departurePoint,
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
          text: t.markerDeparture,
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
        title: t.arrivalPoint,
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
          text: t.markerArrival,
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full max-w-4xl h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-[#C9A96E]/40"
            style={{ backgroundColor: '#0A0A0A' }}
          >
            {/* Header - Minimalista */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#C9A96E]/20">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-3 h-3 rounded-full bg-[#C9A96E]" />
                <span className="text-white/70 text-sm font-light">{departure}</span>
                <span className="text-white/30 text-xs">→</span>
                <span className="text-white/70 text-sm font-light">{arrival}</span>
              </motion.div>
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ backgroundColor: 'rgba(201,169,110,0.1)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleMapType}
                  className="p-2.5 rounded-xl text-white/60 hover:text-white/80 transition-all"
                  title="Alternar visualização"
                >
                  {mapType === 'roadmap' ? (
                    <Satellite className="w-4 h-4" />
                  ) : (
                    <Map className="w-4 h-4" />
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ backgroundColor: 'rgba(201,169,110,0.1)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCloseClick}
                  className="p-2.5 rounded-xl text-white/60 hover:text-white/80 transition-all"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Map - Principal */}
            <div ref={mapRef} className="flex-1 bg-[#1a1a1a] relative overflow-hidden" />

            {/* Footer - Ações */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="px-6 py-4 border-t border-[#C9A96E]/20 flex items-center gap-3"
              style={{ backgroundColor: 'rgba(10,10,10,0.95)' }}
            >
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(201,169,110,0.15)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-sm transition-all border border-[#C9A96E]/30"
              >
                <Share2 className="w-4 h-4" />
                {t.share}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(201,169,110,0.15)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-sm transition-all border border-[#C9A96E]/30"
              >
                <Download className="w-4 h-4" />
                {t.save}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCloseClick}
                className="flex-1 flex items-center justify-center px-4 py-3 rounded-xl font-semibold transition-all"
                style={{ backgroundColor: '#C9A96E', color: '#0A0A0A' }}
              >
                {t.close}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}