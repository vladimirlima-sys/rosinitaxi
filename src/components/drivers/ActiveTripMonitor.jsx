import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, Clock, CheckCircle, Car, ChevronRight, Loader2, Phone, Mail, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const TRIP_STATUSES = [
  {
    key: 'en_route',
    label: '🚗 En route vers le client',
    shortLabel: 'En route',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/30',
    whatsapp: '✅ WhatsApp envoyé au client : « Chauffeur en route »',
  },
  {
    key: 'arrived',
    label: '📍 Arrivé au point de départ',
    shortLabel: 'Arrivé',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10 border-yellow-400/30',
    whatsapp: '✅ WhatsApp envoyé au client : « Chauffeur arrivé »',
  },
  {
    key: 'in_progress',
    label: '⚡ Course en cours',
    shortLabel: 'En cours',
    color: 'text-[#F5C300]',
    bg: 'bg-[#F5C300]/10 border-[#F5C300]/30',
    whatsapp: '✅ WhatsApp envoyé au client : « Course démarrée »',
  },
  {
    key: 'completed',
    label: '✅ Course terminée',
    shortLabel: 'Terminée',
    color: 'text-green-400',
    bg: 'bg-green-400/10 border-green-400/30',
    whatsapp: '✅ WhatsApp envoyé au client : « Trajet terminé, merci ! »',
  },
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
  return <span className="tabular-nums">{h > 0 ? `${pad(h)}:` : ''}{pad(m)}:{pad(s)}</span>;
}

export default function ActiveTripMonitor({ booking }) {
  const storageKey = `trip_status_${booking.id}`;
  const startKey = `trip_start_${booking.id}`;

  const [tripStatus, setTripStatus] = useState(() => localStorage.getItem(storageKey) || null);
  const [tripStartedAt, setTripStartedAt] = useState(() => {
    const v = localStorage.getItem(startKey);
    return v ? parseInt(v) : null;
  });
  const [loading, setLoading] = useState(false);
  const [lastWhatsapp, setLastWhatsapp] = useState(null);

  const currentIndex = TRIP_STATUSES.findIndex(s => s.key === tripStatus);
  const currentStatusObj = TRIP_STATUSES[currentIndex] || null;
  const isCompleted = tripStatus === 'completed';

  const setStatus = async (key) => {
    setLoading(true);
    setLastWhatsapp(null);

    localStorage.setItem(storageKey, key);
    setTripStatus(key);

    if (key === 'in_progress' && !tripStartedAt) {
      const now = Date.now();
      localStorage.setItem(startKey, String(now));
      setTripStartedAt(now);
    }

    // Send WhatsApp notification to client
    try {
      await base44.functions.invoke('notifyRideStatusUpdate', {
        booking_id: booking.id,
        status: key,
      });
      const statusObj = TRIP_STATUSES.find(s => s.key === key);
      setLastWhatsapp(statusObj?.whatsapp || '✅ Client notifié par WhatsApp');
      console.log('[ActiveTripMonitor] Notification sent for status:', key);
    } catch (err) {
      console.error('[ActiveTripMonitor] Notification error:', err);
      toast.error('Erreur envoi WhatsApp. Le statut a quand même changé.');
    }

    if (key === 'completed') {
      localStorage.removeItem(startKey);
      setTripStartedAt(null);
      try {
        await base44.entities.Booking.update(booking.id, { payment_status: 'paid' });
        toast.success('Course marquée comme payée ✓');
      } catch (err) {
        console.error('Error updating payment status:', err);
      }
    }

    setLoading(false);
  };

  const resetTrip = () => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(startKey);
    setTripStatus(null);
    setTripStartedAt(null);
    setLastWhatsapp(null);
  };

  const nextStep = TRIP_STATUSES.find((_, i) => {
    if (!tripStatus) return i === 0;
    return i === currentIndex + 1;
  });

  return (
    <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div>
          <p className="text-white text-sm font-semibold">{booking.client_name}</p>
          <p className="text-white/40 text-xs mt-0.5">
            {new Date(`${booking.departure_date}T${booking.departure_time || '00:00'}`).toLocaleDateString('fr-CH')} à {booking.departure_time}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#F5C300] animate-pulse" />
          <p className="text-white text-xs font-semibold uppercase tracking-wider">Suivi live</p>
        </div>
      </div>

      {/* Client contact */}
      <div className="px-4 py-3 border-b border-white/10 flex flex-wrap gap-3">
        {booking.client_phone && (
          <a href={`tel:${booking.client_phone}`} className="flex items-center gap-1.5 text-white/50 hover:text-[#F5C300] transition-colors text-xs">
            <Phone className="w-3 h-3" /> {booking.client_phone}
          </a>
        )}
        {booking.client_phone && (
          <a
            href={`https://wa.me/${booking.client_phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#25D366]/70 hover:text-[#25D366] transition-colors text-xs"
          >
            <MessageCircle className="w-3 h-3" /> WhatsApp direct
          </a>
        )}
      </div>

      {/* Route */}
      <div className="p-4 space-y-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#F5C300]/20 flex items-center justify-center shrink-0">
            <MapPin className="w-3 h-3 text-[#F5C300]" />
          </div>
          <p className="text-white/80 text-sm truncate flex-1">{booking.departure_point}</p>
          <a href={getMapsUrl(booking.departure_point)} target="_blank" rel="noopener noreferrer"
            className="shrink-0 text-blue-400 text-xs hover:text-blue-300 flex items-center gap-1">
            <Navigation className="w-3 h-3" /> GPS
          </a>
        </div>
        <div className="ml-2.5 w-[1px] h-3 bg-white/10" />
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <MapPin className="w-3 h-3 text-white/50" />
          </div>
          <p className="text-white/80 text-sm truncate flex-1">{booking.arrival_point}</p>
          <a href={getMapsUrl(booking.arrival_point)} target="_blank" rel="noopener noreferrer"
            className="shrink-0 text-blue-400 text-xs hover:text-blue-300 flex items-center gap-1">
            <Navigation className="w-3 h-3" /> GPS
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-white/10 border-b border-white/10">
        <div className="p-3 text-center">
          <p className="text-white/30 text-xs mb-1">Distance</p>
          <p className="text-white text-sm font-semibold">{booking.distance_km ? `${booking.distance_km} km` : '—'}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-white/30 text-xs mb-1">Durée</p>
          <p className="text-white text-sm font-semibold">
            {tripStatus === 'in_progress' && tripStartedAt ? <ElapsedTimer startedAt={tripStartedAt} /> : '—'}
          </p>
        </div>
        <div className="p-3 text-center">
          <p className="text-white/30 text-xs mb-1">Tarif</p>
          <p className="text-[#F5C300] text-sm font-bold">CHF {booking.total_price?.toFixed(2) || '—'}</p>
        </div>
      </div>

      {/* Progress bar with step labels */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-start gap-1 mb-2">
          {TRIP_STATUSES.map((s, i) => (
            <div key={s.key} className="flex-1 flex flex-col items-center gap-1">
              <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${i <= currentIndex ? 'bg-[#F5C300]' : 'bg-white/10'}`} />
              <span className={`text-[9px] text-center leading-tight ${i <= currentIndex ? 'text-[#F5C300]/80' : 'text-white/20'}`}>
                {s.shortLabel}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Current status badge */}
      {currentStatusObj && (
        <div className={`mx-4 mb-3 px-4 py-2.5 rounded-xl border text-sm font-semibold ${currentStatusObj.bg} ${currentStatusObj.color}`}>
          {currentStatusObj.label}
        </div>
      )}

      {/* WhatsApp sent confirmation */}
      {lastWhatsapp && (
        <div className="mx-4 mb-3 px-3 py-2 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center gap-2">
          <MessageCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
          <span className="text-[#25D366] text-xs">{lastWhatsapp}</span>
        </div>
      )}

      {/* Action button */}
      <div className="p-4 pt-0 space-y-2">
        {!isCompleted && nextStep && (
          <button
            onClick={() => setStatus(nextStep.key)}
            disabled={loading}
            className={`w-full h-12 rounded-xl border font-semibold text-sm flex items-center justify-center gap-2 transition-all ${nextStep.bg} ${nextStep.color} hover:opacity-80 disabled:opacity-50`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {nextStep.label}
                <ChevronRight className="w-4 h-4 ml-auto" />
              </>
            )}
          </button>
        )}
        {loading && (
          <p className="text-center text-white/40 text-xs flex items-center justify-center gap-1.5">
            <MessageCircle className="w-3 h-3 text-[#25D366]" />
            Envoi WhatsApp au client...
          </p>
        )}
        {isCompleted && (
          <div className="text-center py-2">
            <p className="text-green-400 text-sm font-semibold">✅ Course terminée avec succès</p>
            <p className="text-white/30 text-xs mt-1">Client notifié par WhatsApp 💬</p>
            <button onClick={resetTrip} className="text-white/30 text-xs mt-2 hover:text-white/60 transition-colors underline">
              Commencer une nouvelle course
            </button>
          </div>
        )}
      </div>
    </div>
  );
}