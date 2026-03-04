import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Play, Square, Navigation, Car, Loader2, Clock, ArrowLeft } from 'lucide-react';
import PaymentForm from '@/components/taximeter/PaymentForm';
import { createPageUrl } from '@/utils';

export default function Taximeter() {
  const [priceSettings, setPriceSettings] = useState(null);
  const [vehicleType, setVehicleType] = useState('economic');
  const [running, setRunning] = useState(false);
  const [distanceKm, setDistanceKm] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | running | stopped | completed
  const [gpsError, setGpsError] = useState('');
  const [accuracy, setAccuracy] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [waitingEnabled, setWaitingEnabled] = useState(false);
  const [waitingSeconds, setWaitingSeconds] = useState(0);
  const [waitingPrice, setWaitingPrice] = useState(0);

  const lastPositionRef = useRef(null);
  const watchIdRef = useRef(null);
  const distanceRef = useRef(0);
  const waitingIntervalRef = useRef(null);

  useEffect(() => {
    base44.entities.PriceSettings.list().then(data => {
      if (data?.length > 0) setPriceSettings(data[0]);
    });
  }, []);

  const WAITING_PRICE_PER_MINUTE = 0.30;

  const getPricePerKm = () => {
    if (!priceSettings) return 2.30;
    return vehicleType === 'comfort' 
      ? (priceSettings.comfort_price_per_km || priceSettings.standard_price_per_km * 1.3)
      : priceSettings.standard_price_per_km;
  };

  const getBaseFare = () => priceSettings?.base_fare || 10;

  const isNightSurchargeApplied = () => {
    if (!priceSettings?.night_surcharge_percentage) return false;
    if (!priceSettings.night_surcharge_days?.length) return false;

    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();
    const startHour = priceSettings.night_surcharge_start_hour;
    const endHour = priceSettings.night_surcharge_end_hour;

    // Check if current day is in surcharge days
    if (!priceSettings.night_surcharge_days.includes(dayOfWeek)) return false;

    // Check if current time is in surcharge period
    if (startHour <= endHour) {
      // Normal period (doesn't cross midnight)
      return hour >= startHour && hour < endHour;
    } else {
      // Period crosses midnight
      return hour >= startHour || hour < endHour;
    }
  };

  const getNightSurchargePercentage = () => {
    return isNightSurchargeApplied() ? (priceSettings?.night_surcharge_percentage || 0) : 0;
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

  const toggleWaiting = () => {
    setWaitingEnabled(!waitingEnabled);
  };

  useEffect(() => {
    if (waitingEnabled && running) {
      waitingIntervalRef.current = setInterval(() => {
        setWaitingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (waitingIntervalRef.current) clearInterval(waitingIntervalRef.current);
    }
    return () => {
      if (waitingIntervalRef.current) clearInterval(waitingIntervalRef.current);
    };
  }, [waitingEnabled, running]);

  useEffect(() => {
    if (running && priceSettings) {
      const newWaitingPrice = (waitingSeconds / 60) * WAITING_PRICE_PER_MINUTE;
      setWaitingPrice(newWaitingPrice);
      
      const km = distanceRef.current;
      const baseFare = getBaseFare();
      const pricePerKm = getPricePerKm();
      const nightSurchargePercent = getNightSurchargePercentage();
      
      const basePrice = baseFare + km * pricePerKm;
      const nightSurcharge = basePrice * (nightSurchargePercent / 100);
      const total = basePrice + nightSurcharge + newWaitingPrice;
      
      setTotalPrice(parseFloat(total.toFixed(2)));
    }
  }, [waitingSeconds, running, priceSettings, vehicleType]);

  const startRide = () => {
    if (!navigator.geolocation) {
      setGpsError('GPS non disponible sur cet appareil.');
      return;
    }
    setGpsError('');
    distanceRef.current = 0;
    setDistanceKm(0);
    lastPositionRef.current = null;
    setRunning(true);
    setStatus('running');

    // Start with base fare immediately
    if (priceSettings) {
      setTotalPrice(parseFloat(getBaseFare().toFixed(2)));
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords;
        
        try {
          // Refine coordinates with HERE Positioning
          const refined = await base44.functions.invoke('herePositioning', {
            latitude,
            longitude,
            accuracy: acc
          });
          
          const finalLat = refined.latitude;
          const finalLon = refined.longitude;
          const finalAcc = refined.accuracy;
          
          setAccuracy(Math.round(finalAcc));

          if (lastPositionRef.current) {
            const delta = haversineKm(
              lastPositionRef.current.lat,
              lastPositionRef.current.lon,
              finalLat,
              finalLon
            );
            if (delta > 0 && delta < 0.5 && finalAcc < 50) {
              distanceRef.current += delta;
              const km = distanceRef.current;
              const baseFare = getBaseFare();
              const pricePerKm = getPricePerKm();
              const nightSurchargePercent = getNightSurchargePercentage();
              
              const basePrice = baseFare + km * pricePerKm;
              const nightSurcharge = basePrice * (nightSurchargePercent / 100);
              const price = basePrice + nightSurcharge + waitingPrice;
              
              setDistanceKm(parseFloat(km.toFixed(3)));
              setTotalPrice(parseFloat(price.toFixed(2)));
            }
          }
          lastPositionRef.current = { lat: finalLat, lon: finalLon };
        } catch (err) {
          // Fallback to raw coordinates if HERE fails
          setAccuracy(Math.round(acc));
          
          if (lastPositionRef.current) {
            const delta = haversineKm(
              lastPositionRef.current.lat,
              lastPositionRef.current.lon,
              latitude,
              longitude
            );
            if (delta > 0 && delta < 0.5 && acc < 50) {
              distanceRef.current += delta;
              const km = distanceRef.current;
              const baseFare = getBaseFare();
              const pricePerKm = getPricePerKm();
              const nightSurchargePercent = getNightSurchargePercentage();
              
              const basePrice = baseFare + km * pricePerKm;
              const nightSurcharge = basePrice * (nightSurchargePercent / 100);
              const price = basePrice + nightSurcharge + waitingPrice;
              
              setDistanceKm(parseFloat(km.toFixed(3)));
              setTotalPrice(parseFloat(price.toFixed(2)));
            }
          }
          lastPositionRef.current = { lat: latitude, lon: longitude };
        }
      },
      (err) => {
        let message = err.message;
        if (err.code === 1) message = 'Permission GPS refusée. Vérifiez les paramètres du navigateur.';
        if (err.code === 2) message = 'Signal GPS indisponible. Essayez en plein air.';
        if (err.code === 3) message = 'Timeout GPS. Augmentez le délai ou attendez.';
        setGpsError('Erreur GPS : ' + message);
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 30000 }
    );
  };

  const stopRide = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (waitingIntervalRef.current) {
      clearInterval(waitingIntervalRef.current);
    }
    setRunning(false);
    setStatus('completed');
    setShowPayment(true);
    lastPositionRef.current = null;
  };

  const resetRide = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (waitingIntervalRef.current) {
      clearInterval(waitingIntervalRef.current);
    }
    setRunning(false);
    setDistanceKm(0);
    setTotalPrice(0);
    setAccuracy(null);
    setStatus('idle');
    setShowPayment(false);
    distanceRef.current = 0;
    setWaitingEnabled(false);
    setWaitingSeconds(0);
    setWaitingPrice(0);
  };

  const handlePaymentComplete = (method) => {
    resetRide();
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setStatus('stopped');
  };

  const pricePerKm = getPricePerKm(priceSettings, vehicleType);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-start px-4 py-10">
      <div className="w-full max-w-sm space-y-5">

        {/* Header */}
        <div className="relative text-center">
          <a
            href={createPageUrl('DriverPortal')}
            className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </a>
          <h1 className="text-3xl font-extralight tracking-[0.3em] text-white uppercase">TAXIMÈTRE</h1>
          <p className="text-white/30 text-xs tracking-widest uppercase mt-1">Rosini Transfert</p>
        </div>

        {/* Tarif info */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider">Prise en charge</p>
              <p className="text-white font-semibold">CHF {priceSettings ? getBaseFare().toFixed(2) : '10.00'}</p>
            </div>
            <div className="w-[1px] h-8 bg-white/10" />
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider">Prix au km</p>
              <p className="text-white font-semibold">CHF {getPricePerKm().toFixed(2)}</p>
            </div>
          </div>
          {getNightSurchargePercentage() > 0 && (
            <div className="pt-2 border-t border-white/10 text-xs text-[#F5C300]">
              +{getNightSurchargePercentage()}% adicional noturno appliqué
            </div>
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
              <Navigation className={`w-3 h-3 ${accuracy > 50 ? 'text-yellow-400' : 'text-green-400'}`} />
              <p className={`text-xs ${accuracy > 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                GPS ±{accuracy}m {accuracy > 50 && '(précision faible)'}
              </p>
            </div>
          )}

          {/* Status badge */}
          {status === 'running' && (
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F5C300] animate-pulse" />
              <p className="text-[#F5C300] text-xs uppercase tracking-wider font-semibold">Course en cours</p>
            </div>
          )}
          {status === 'completed' && (
            <p className="text-green-400 text-xs uppercase tracking-wider">Course terminée</p>
          )}
          {status === 'stopped' && (
            <p className="text-white/40 text-xs uppercase tracking-wider">Course arrêtée</p>
          )}
        </div>

        {/* Waiting time card */}
        {running && (
          <div className="bg-[#111] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-white/50" />
                <p className="text-white/40 text-xs uppercase tracking-wider">Temps d'attente</p>
              </div>
              <button
                onClick={toggleWaiting}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  waitingEnabled
                    ? 'bg-[#F5C300]/20 border border-[#F5C300]/50 text-[#F5C300]'
                    : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10'
                }`}
              >
                {waitingEnabled ? 'Actif' : 'Inactif'}
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-white text-3xl font-light tabular-nums">
                {String(Math.floor(waitingSeconds / 60)).padStart(2, '0')}:{String(waitingSeconds % 60).padStart(2, '0')}
              </p>
              <p className="text-white/30 text-sm">CHF {waitingPrice.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* GPS error */}
        {gpsError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            <p className="text-red-400 text-sm text-center">{gpsError.replace('GPS não disponível neste dispositivo.', 'GPS non disponible sur cet appareil.').replace('Erro de GPS: ', 'Erreur GPS : ')}</p>
          </div>
        )}

        {/* Payment Form */}
        {showPayment && status === 'completed' && (
          <PaymentForm 
            amount={totalPrice}
            distance={distanceKm}
            onPaymentComplete={handlePaymentComplete}
            onCancel={handlePaymentCancel}
          />
        )}

        {/* Controls */}
        {!running && !showPayment ? (
          <div className="space-y-2">
            <button
              onClick={startRide}
              className="w-full h-14 rounded-2xl bg-[#F5C300] text-black font-bold text-base uppercase tracking-wider hover:bg-[#e6b800] transition-all flex items-center justify-center gap-2"
            >
              <><Play className="w-5 h-5" /> Démarrer la course</>
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
        ) : running && !showPayment ? (
          <button
            onClick={stopRide}
            className="w-full h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-base uppercase tracking-wider hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Square className="w-5 h-5" /> Arrêter la course
          </button>
        ) : null}

        {/* Breakdown */}
        {distanceKm > 0 && (
          <div className="bg-[#111] border border-white/10 rounded-2xl p-4 space-y-2">
            <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Détails</p>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">{distanceKm.toFixed(3)} km × CHF {getPricePerKm().toFixed(2)}</span>
              <span className="text-white">CHF {(distanceKm * getPricePerKm()).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Prise en charge</span>
              <span className="text-white">CHF {getBaseFare().toFixed(2)}</span>
            </div>
            {getNightSurchargePercentage() > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Supplément nocturne ({getNightSurchargePercentage()}%)</span>
                <span className="text-[#F5C300]">CHF {((distanceKm * getPricePerKm() + getBaseFare()) * (getNightSurchargePercentage() / 100)).toFixed(2)}</span>
              </div>
            )}
            {waitingPrice > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Temps d'attente</span>
                <span className="text-white">CHF {waitingPrice.toFixed(2)}</span>
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
          Le GPS nécessite la permission de localisation pour fonctionner
        </p>
      </div>
    </div>
  );
}