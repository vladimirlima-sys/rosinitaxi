import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Play, Square, Navigation, Car, Loader2 } from 'lucide-react';

export default function Taximeter() {
  const [priceSettings, setPriceSettings] = useState(null);
  const [vehicleType, setVehicleType] = useState('economic');
  const [running, setRunning] = useState(false);
  const [distanceKm, setDistanceKm] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | running | stopped
  const [gpsError, setGpsError] = useState('');
  const [accuracy, setAccuracy] = useState(null);

  const lastPositionRef = useRef(null);
  const watchIdRef = useRef(null);
  const distanceRef = useRef(0);

  useEffect(() => {
    base44.entities.PriceSettings.list().then(data => {
      if (data?.length > 0) setPriceSettings(data[0]);
    });
  }, []);

  const getPricePerKm = (settings, type) => {
    if (!settings) return 0;
    if (type === 'comfort') return settings.comfort_price_per_km || settings.standard_price_per_km * 1.3;
    return settings.standard_price_per_km || 0;
  };

  const haversineKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const startRide = () => {
    if (!navigator.geolocation) {
      setGpsError('GPS não disponível neste dispositivo.');
      return;
    }
    setGpsError('');
    distanceRef.current = 0;
    setDistanceKm(0);
    setTotalPrice(0);
    lastPositionRef.current = null;
    setRunning(true);
    setStatus('running');

    // Start with base fare of 10 CHF immediately
    const baseFare = priceSettings?.base_fare ?? 10;
    setTotalPrice(parseFloat(baseFare.toFixed(2)));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords;
        setAccuracy(Math.round(acc));

        if (lastPositionRef.current) {
          const delta = haversineKm(
            lastPositionRef.current.lat,
            lastPositionRef.current.lon,
            latitude,
            longitude
          );
          // Filter noise: ignore jumps > 0.5 km in one update or < 2m accuracy threshold
          if (delta > 0 && delta < 0.5 && acc < 50) {
            distanceRef.current += delta;
            const km = distanceRef.current;
            const price = baseFare + km * getPricePerKm(priceSettings, vehicleType);
            setDistanceKm(parseFloat(km.toFixed(3)));
            setTotalPrice(parseFloat(price.toFixed(2)));
          }
        }
        lastPositionRef.current = { lat: latitude, lon: longitude };
      },
      (err) => {
        setGpsError('Erro de GPS: ' + err.message);
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
  };

  const stopRide = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setRunning(false);
    setStatus('stopped');
    lastPositionRef.current = null;
  };

  const resetRide = () => {
    stopRide();
    setDistanceKm(0);
    setTotalPrice(0);
    setAccuracy(null);
    setStatus('idle');
    distanceRef.current = 0;
  };

  const pricePerKm = getPricePerKm(priceSettings, vehicleType);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-start px-4 py-10">
      <div className="w-full max-w-sm space-y-5">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extralight tracking-[0.3em] text-white uppercase">TAXIMÈTRE</h1>
          <p className="text-white/30 text-xs tracking-widest uppercase mt-1">Rosini Transfert</p>
        </div>

        {/* Vehicle selector */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Type de véhicule</p>
          <div className="grid grid-cols-2 gap-2">
            {['economic', 'comfort'].map(type => (
              <button
                key={type}
                onClick={() => { if (!running) setVehicleType(type); }}
                disabled={running}
                className={`h-12 rounded-xl font-semibold text-sm uppercase tracking-wider transition-all ${
                  vehicleType === type
                    ? 'bg-[#F5C300] text-black'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                } disabled:cursor-not-allowed`}
              >
                {type === 'economic' ? 'Standard' : 'Comfort'}
              </button>
            ))}
          </div>
          {priceSettings && (
            <p className="text-white/30 text-xs text-center mt-2">
              CHF {pricePerKm.toFixed(2)}/km
            </p>
          )}
        </div>

        {/* Main display */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 text-center space-y-4">
          {/* Distance */}
          <div>
            <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Distance</p>
            <p className="text-white text-5xl font-light tabular-nums">
              {distanceKm.toFixed(3)}
              <span className="text-white/30 text-lg ml-1">km</span>
            </p>
          </div>

          <div className="w-full h-[1px] bg-white/10" />

          {/* Price */}
          <div>
            <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Montant Total</p>
            <p className={`text-5xl font-bold tabular-nums transition-colors ${running ? 'text-[#F5C300]' : 'text-white/60'}`}>
              CHF {totalPrice.toFixed(2)}
            </p>
          </div>

          {/* GPS accuracy */}
          {running && accuracy !== null && (
            <div className="flex items-center justify-center gap-1">
              <Navigation className="w-3 h-3 text-green-400" />
              <p className="text-green-400 text-xs">GPS ±{accuracy}m</p>
            </div>
          )}

          {/* Status badge */}
          {status === 'running' && (
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F5C300] animate-pulse" />
              <p className="text-[#F5C300] text-xs uppercase tracking-wider font-semibold">Course en cours</p>
            </div>
          )}
          {status === 'stopped' && (
            <p className="text-white/40 text-xs uppercase tracking-wider">Course terminée</p>
          )}
        </div>

        {/* GPS error */}
        {gpsError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            <p className="text-red-400 text-sm text-center">{gpsError.replace('GPS não disponível neste dispositivo.', 'GPS non disponible sur cet appareil.').replace('Erro de GPS: ', 'Erreur GPS : ')}</p>
          </div>
        )}

        {/* Controls */}
        {!running ? (
          <div className="space-y-2">
            <button
              onClick={startRide}
              disabled={!priceSettings}
              className="w-full h-14 rounded-2xl bg-[#F5C300] text-black font-bold text-base uppercase tracking-wider hover:bg-[#e6b800] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {!priceSettings ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Chargement...</>
              ) : (
                <><Play className="w-5 h-5" /> Démarrer la course</>
              )}
            </button>
            {status !== 'idle' && (
              <button
                onClick={resetRide}
                className="w-full h-11 rounded-xl border border-white/10 text-white/40 text-sm uppercase tracking-wider hover:bg-white/5 transition-all"
              >
                Réinitialiser
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={stopRide}
            className="w-full h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-base uppercase tracking-wider hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Square className="w-5 h-5" /> Arrêter la course
          </button>
        )}

        {/* Breakdown */}
        {distanceKm > 0 && priceSettings && (
          <div className="bg-[#111] border border-white/10 rounded-2xl p-4 space-y-2">
            <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Detalhes</p>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">{distanceKm.toFixed(3)} km × CHF {pricePerKm.toFixed(2)}</span>
              <span className="text-white">CHF {(distanceKm * pricePerKm).toFixed(2)}</span>
            </div>
            {priceSettings.base_fare > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Taxa base</span>
                <span className="text-white">CHF {priceSettings.base_fare.toFixed(2)}</span>
              </div>
            )}
            <div className="w-full h-[1px] bg-white/10 my-1" />
            <div className="flex justify-between text-sm font-bold">
              <span className="text-white">Total</span>
              <span className="text-[#F5C300]">CHF {totalPrice.toFixed(2)}</span>
            </div>
          </div>
        )}

        <p className="text-white/15 text-xs text-center">
          O GPS precisa de permissão de localização para funcionar
        </p>
      </div>
    </div>
  );
}