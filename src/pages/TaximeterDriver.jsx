import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Play, Pause, RotateCcw, MapPin, Clock, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TaximeterDriver() {
  const [priceSettings, setPriceSettings] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [distance, setDistance] = useState(0);
  const [vehicleType, setVehicleType] = useState('economic');
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [paying, setPaying] = useState(false);
  const timerRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastLocationRef = useRef(null);

  // Load price settings
  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await base44.entities.PriceSettings.list();
      if (settings?.length > 0) setPriceSettings(settings[0]);
    };
    fetchSettings();
  }, []);

  // Timer logic
  useEffect(() => {
    if (!isRunning) return;
    timerRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  // GPS tracking
  useEffect(() => {
    if (!isRunning || !navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (lastLocationRef.current) {
          const R = 6371; // Earth's radius in km
          const dLat = (latitude - lastLocationRef.current.lat) * Math.PI / 180;
          const dLon = (longitude - lastLocationRef.current.lon) * Math.PI / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lastLocationRef.current.lat * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const dist = R * c;
          if (dist > 0.01) { // Only update if movement > 10m
            setDistance(prev => prev + dist);
          }
        }
        lastLocationRef.current = { lat: latitude, lon: longitude };
      },
      (error) => {
        toast.error('GPS não disponível');
        setIsRunning(false);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [isRunning]);

  const pricePerKm = !priceSettings ? 0 : vehicleType === 'comfort' 
    ? (priceSettings.comfort_price_per_km || priceSettings.standard_price_per_km * 1.3)
    : priceSettings.standard_price_per_km;
  const timeCharge = Math.floor(elapsedSeconds / 60) * 0.5; // CHF 0.50 per minute
  const distanceCharge = distance * pricePerKm;
  const baseFare = priceSettings?.base_fare || 0;
  const totalPrice = baseFare + distanceCharge + timeCharge;
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  const handleStartStop = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      if (!clientEmail || !clientName) {
        toast.error('Adicione email e nome do cliente');
        return;
      }
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setDistance(0);
    lastLocationRef.current = null;
  };

  const handlePayment = async () => {
    if (!clientEmail || !clientName) {
      toast.error('Dados do cliente são obrigatórios');
      return;
    }

    setPaying(true);
    try {
      // Create Stripe checkout session
      const response = await base44.functions.invoke('createTaxiCheckout', {
        amount: Math.round(totalPrice * 100),
        clientEmail,
        clientName,
        distance: distance.toFixed(2),
        duration: `${minutes}m ${seconds}s`,
        vehicleType,
        totalPrice: totalPrice.toFixed(2),
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      toast.error('Erro ao processar pagamento');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="h-screen bg-[#F5C300] px-4 py-6 overflow-y-auto">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extralight tracking-[0.3em] text-black uppercase">ROSINI</h1>
          <p className="text-black/60 text-sm tracking-[0.2em] uppercase mt-1">Taximètre Chauffeur</p>
          <div className="w-8 h-[1px] bg-black/40 mx-auto mt-3" />
        </div>

        {/* Client Info */}
        <div className="bg-black border border-black/40 rounded-2xl p-4 space-y-3 mb-6">
          <input
            type="text"
            placeholder="Nom du client"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            disabled={isRunning}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/40 outline-none focus:border-white/60 disabled:opacity-50"
          />
          <input
            type="email"
            placeholder="Email du client"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            disabled={isRunning}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/40 outline-none focus:border-white/60 disabled:opacity-50"
          />
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            disabled={isRunning}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white outline-none focus:border-white/60 disabled:opacity-50"
          >
            <option value="economic">Standard - CHF {priceSettings?.standard_price_per_km || '?'}/km</option>
            <option value="comfort">Comfort - CHF {priceSettings?.comfort_price_per_km || '?'}/km</option>
          </select>
        </div>

        {/* Taximeter Display */}
        <div className="bg-black border border-black/40 rounded-2xl p-8 mb-6 space-y-6">
          {/* Time */}
          <div className="flex items-center gap-3 justify-center">
            <Clock className="w-5 h-5 text-[#F5C300]" />
            <div className="text-5xl font-mono text-[#F5C300] font-bold tracking-wider">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>

          {/* Distance */}
          <div className="flex items-center gap-3 justify-center">
            <MapPin className="w-5 h-5 text-white" />
            <div className="text-4xl font-mono text-white font-bold">
              {distance.toFixed(2)} km
            </div>
          </div>

          {/* Total Price */}
          <div className="flex items-center gap-3 justify-center">
            <DollarSign className="w-5 h-5 text-[#F5C300]" />
            <div className="text-5xl font-mono text-[#F5C300] font-bold">
              CHF {totalPrice.toFixed(2)}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border-t border-white/10 pt-4 space-y-2 text-sm text-white/60">
            <div className="flex justify-between">
              <span>Prise en charge:</span>
              <span>CHF {baseFare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Distance ({distance.toFixed(2)} km × CHF {pricePerKm}):</span>
              <span>CHF {distanceCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Temps ({minutes} min × CHF 0.50):</span>
              <span>CHF {timeCharge.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={handleStartStop}
            className={`h-16 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              isRunning
                ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
                : 'bg-[#F5C300]/20 border border-[#F5C300]/40 text-[#F5C300] hover:bg-[#F5C300]/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                Arrêt
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Démarrer
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            disabled={isRunning}
            className="h-16 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/20 transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-5 h-5" />
            Réinitialiser
          </button>
          <button
            onClick={handlePayment}
            disabled={paying || elapsedSeconds === 0}
            className="h-16 rounded-xl bg-black border border-black/40 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-black/80 transition-all disabled:opacity-50"
          >
            {paying ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Paiement'
            )}
          </button>
        </div>

        <p className="text-black/60 text-xs text-center">
          Le reçu sera envoyé à l'email du client après confirmation du paiement
        </p>
      </div>
    </div>
  );
}