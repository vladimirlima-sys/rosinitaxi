import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, Clock, DollarSign, CheckCircle, Car, ChevronRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const TRIP_STATUSES = [
  { key: 'en_route', label: '🚗 En route vers le client', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30' },
  { key: 'arrived', label: '📍 Arrivé au point de départ', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  { key: 'in_progress', label: '⚡ Course en cours', color: 'text-[#F5C300]', bg: 'bg-[#F5C300]/10 border-[#F5C300]/30' },
  { key: 'completed', label: '✅ Course terminée', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' },
];

function getMapsUrl(address) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=driving`;
}

function ElapsedTimer({ startedAt }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const update = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const pad = n => String(n).padStart(2, '0');

  return (
    <span className="tabular-nums">
      {h > 0 ? `${pad(h)}:` : ''}{pad(m)}:{pad(s)}
    </span>
  );
}

export default function ActiveTripMonitor({ booking }) {
  const storageKey = `trip_status_${booking.id}`;
  const startKey = `trip_start_${booking.id}`;

  const [tripStatus, setTripStatus] = useState(() => localStorage.getItem(storageKey) || null);
  const [tripStartedAt, setTripStartedAt] = useState(() => {
    const v = localStorage.getItem(startKey);
    return v ? parseInt(v) : null;
  });
  const [savingPayment, setSavingPayment] = useState(false);

  const currentIndex = TRIP_STATUSES.findIndex(s => s.key === tripStatus);
  const currentStatusObj = TRIP_STATUSES[currentIndex] || null;
  const isCompleted = tripStatus === 'completed';

  const setStatus = async (key) => {
    localStorage.setItem(storageKey, key);
    setTripStatus(key);
    if (key === 'in_progress' && !tripStartedAt) {
      const now = Date.now();
      localStorage.setItem(startKey, String(now));
      setTripStartedAt(now);
    }
    if (key === 'completed') {
      localStorage.removeItem(startKey);
      setTripStartedAt(null);
      
      // Registrar pagamento automaticamente
      setSavingPayment(true);
      try {
        await base44.entities.Booking.update(booking.id, {
          payment_status: 'paid'
        });
        toast.success('Corrida registrada como paga ✓');
      } catch (error) {
        toast.error('Erro ao registrar pagamento');
        console.error('Payment registration error:', error);
      } finally {
        setSavingPayment(false);
      }
    }
  };

  const resetTrip = () => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(startKey);
    setTripStatus(null);
    setTripStartedAt(null);
  };

  // Steps to show as next action buttons
  const nextSteps = TRIP_STATUSES.filter((_, i) => {
    if (!tripStatus) return i === 0;
    return i === currentIndex + 1;
  });

  return (
    <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#F5C300] animate-pulse" />
          <p className="text-white text-sm font-semibold">Suivi en temps réel</p>
        </div>
        {tripStatus && (
          <button onClick={resetTrip} className="text-white/20 text-xs hover:text-white/50 transition-colors">
            Réinitialiser
          </button>
        )}
      </div>

      {/* Route summary */}
      <div className="p-4 space-y-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#F5C300]/20 flex items-center justify-center shrink-0">
            <MapPin className="w-3 h-3 text-[#F5C300]" />
          </div>
          <p className="text-white/80 text-sm truncate">{booking.departure_point}</p>
          <a href={getMapsUrl(booking.departure_point)} target="_blank" rel="noopener noreferrer"
            className="ml-auto shrink-0 text-blue-400 text-xs hover:text-blue-300 flex items-center gap-1">
            <Navigation className="w-3 h-3" /> GPS
          </a>
        </div>
        <div className="ml-2.5 w-[1px] h-3 bg-white/10" />
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <MapPin className="w-3 h-3 text-white/50" />
          </div>
          <p className="text-white/80 text-sm truncate">{booking.arrival_point}</p>
          <a href={getMapsUrl(booking.arrival_point)} target="_blank" rel="noopener noreferrer"
            className="ml-auto shrink-0 text-blue-400 text-xs hover:text-blue-300 flex items-center gap-1">
            <Navigation className="w-3 h-3" /> GPS
          </a>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-white/10 border-b border-white/10">
        <div className="p-3 text-center">
          <p className="text-white/30 text-xs mb-1">Distance</p>
          <p className="text-white text-sm font-semibold">{booking.distance_km ? `${booking.distance_km} km` : '—'}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-white/30 text-xs mb-1">Durée</p>
          <p className="text-white text-sm font-semibold">
            {tripStatus === 'in_progress' && tripStartedAt ? (
              <ElapsedTimer startedAt={tripStartedAt} />
            ) : '—'}
          </p>
        </div>
        <div className="p-3 text-center">
          <p className="text-white/30 text-xs mb-1">Tarif</p>
          <p className="text-[#F5C300] text-sm font-bold">CHF {booking.total_price?.toFixed(2) || '—'}</p>
        </div>
      </div>

      {/* Current status */}
      {currentStatusObj && (
        <div className={`mx-4 my-3 px-4 py-2.5 rounded-xl border text-sm font-semibold ${currentStatusObj.bg} ${currentStatusObj.color}`}>
          {currentStatusObj.label}
        </div>
      )}

      {/* Progress steps */}
      <div className="px-4 pb-2 flex items-center gap-1">
        {TRIP_STATUSES.map((s, i) => (
          <div key={s.key} className="flex items-center gap-1 flex-1">
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i <= currentIndex ? 'bg-[#F5C300]' : 'bg-white/10'
            }`} />
            {i < TRIP_STATUSES.length - 1 && null}
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="p-4 pt-2 space-y-2">
        {!isCompleted && nextSteps.map(step => (
          <button
            key={step.key}
            onClick={() => setStatus(step.key)}
            className={`w-full h-11 rounded-xl border font-semibold text-sm flex items-center justify-center gap-2 transition-all ${step.bg} ${step.color} hover:opacity-80`}
          >
            {step.label}
            <ChevronRight className="w-4 h-4 ml-auto" />
          </button>
        ))}
        {isCompleted && (
          <div className="text-center py-2">
            <p className="text-green-400 text-sm font-semibold">✅ Course terminée avec succès</p>
            <button onClick={resetTrip} className="text-white/30 text-xs mt-1 hover:text-white/60 transition-colors">
              Commencer une nouvelle course
            </button>
          </div>
        )}
      </div>
    </div>
  );
}