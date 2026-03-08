import React, { useState, useEffect, useRef } from 'react';
import { Navigation, MapPin, Clock, DollarSign, CheckCircle, Car, ChevronRight, Loader2, Phone, Mail, Edit2, Plus, X, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const TRIP_STATUSES = [
  { key: 'en_route', label: '🚗 Route vers le client', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30' },
  { key: 'arrived', label: '📍 Arrivé au point de départ', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  { key: 'completed', label: '✅ Finaliser la course', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' },
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

export default function ActiveTripMonitor({ booking, onCompleted }) {
  const storageKey = `trip_status_${booking.id}`;
  const startKey = `trip_start_${booking.id}`;

  const [tripStatus, setTripStatus] = useState(() => localStorage.getItem(storageKey) || null);
  const [tripStartedAt, setTripStartedAt] = useState(() => {
    const v = localStorage.getItem(startKey);
    return v ? parseInt(v) : null;
  });
  const [savingPayment, setSavingPayment] = useState(false);
  const [editingArrival, setEditingArrival] = useState(false);
  const [newArrival, setNewArrival] = useState(booking.arrival_point || '');
  const [addingStop, setAddingStop] = useState(false);
  const [newStop, setNewStop] = useState('');
  const [currentStops, setCurrentStops] = useState(booking.additional_stops || []);
  const gpsWatchRef = useRef(null);

  const currentIndex = TRIP_STATUSES.findIndex(s => s.key === tripStatus);
  const currentStatusObj = TRIP_STATUSES[currentIndex] || null;
  const isCompleted = tripStatus === 'completed';

  // Start GPS tracking when trip begins
  const startGPSTracking = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation not available');
      return;
    }
    gpsWatchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        try {
          await base44.entities.DriverLocation.create({
            booking_id: booking.id,
            driver_id: booking.driver_id,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: Date.now()
          });
        } catch (err) {
          console.error('Failed to save location:', err);
        }
      },
      (err) => console.error('GPS error:', err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  };

  // Stop GPS tracking
  const stopGPSTracking = () => {
    if (gpsWatchRef.current !== null) {
      navigator.geolocation.clearWatch(gpsWatchRef.current);
      gpsWatchRef.current = null;
    }
  };

  const setStatus = async (key) => {
   localStorage.setItem(storageKey, key);
   setTripStatus(key);

   // Update ride_status on booking record so client tracking page reflects it
   try {
     await base44.entities.Booking.update(booking.id, { ride_status: key });
   } catch (err) {
     console.error('Failed to update ride_status:', err);
   }

   // Notify client via WhatsApp (en_route and arrived only)
   if (['en_route', 'arrived'].includes(key)) {
     try {
       await base44.functions.invoke('notifyClientWhatsApp', {
         booking_id: booking.id,
         client_phone: booking.client_phone,
         client_name: booking.client_name,
         departure_point: booking.departure_point,
         tracking_link: `${window.location.origin}${createPageUrl('RideTracking')}?id=${booking.id}`,
         status: key,
         language: booking.language || 'fr'
       });
     } catch (err) {
       console.error('WhatsApp notification error:', err);
     }
   }

   if (key === 'en_route' && !tripStartedAt) {
      const now = Date.now();
      localStorage.setItem(startKey, String(now));
      setTripStartedAt(now);
      startGPSTracking();
    }
    
    // Notify client of status update (pass booking data directly to avoid DB timeout)
    try {
      await base44.functions.invoke('notifyRideStatusUpdate', {
        booking_id: booking.id,
        status: key,
        client_name: booking.client_name,
        client_phone: booking.client_phone,
        client_email: booking.client_email,
        departure_point: booking.departure_point,
        language: booking.language || 'fr',
      });
    } catch (notifyErr) {
      console.error('Notification error:', notifyErr);
    }
    
    if (key === 'completed') {
      localStorage.removeItem(startKey);
      setTripStartedAt(null);
      stopGPSTracking();
      
      // Marquer comme payée et notifier le parent
      setSavingPayment(true);
      try {
        await base44.entities.Booking.update(booking.id, {
          payment_status: 'paid'
        });
        
        // Envoyer le reçu
        try {
          await base44.functions.invoke('sendTravelReceipt', {
            clientEmail: booking.client_email,
            amount: booking.total_price,
            paymentMethod: booking.payment_method || 'card',
            distance: booking.distance_km,
            departure: booking.departure_point,
            arrival: booking.arrival_point
          });
        } catch (followupErr) {
          console.error('Followup error:', followupErr);
        }
        
        // Envoyer demande d'avis
        try {
          await base44.functions.invoke('sendReviewRequest', {
            booking_id: booking.id,
            client_name: booking.client_name,
            client_email: booking.client_email,
            departure_point: booking.departure_point,
            arrival_point: booking.arrival_point,
            language: booking.language || 'fr'
          });
        } catch (reviewErr) {
          console.error('Review request error:', reviewErr);
        }
        
        toast.success('Course terminée — transférée vers l\'historique ✓');
        if (onCompleted) onCompleted();
      } catch (error) {
        toast.error('Erreur lors de l\'enregistrement');
        console.error('Payment registration error:', error);
      } finally {
        setSavingPayment(false);
      }
    }
  };

  const saveArrivalChange = async () => {
    if (!newArrival.trim()) return;
    try {
      await base44.entities.Booking.update(booking.id, { arrival_point: newArrival.trim() });
      booking.arrival_point = newArrival.trim();
      setEditingArrival(false);
      toast.success('Destination mise à jour');
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const saveNewStop = async () => {
    if (!newStop.trim()) return;
    const updated = [...currentStops, newStop.trim()];
    try {
      await base44.entities.Booking.update(booking.id, { additional_stops: updated });
      setCurrentStops(updated);
      setNewStop('');
      setAddingStop(false);
      toast.success('Arrêt ajouté');
    } catch (err) {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const removeStop = async (idx) => {
    const updated = currentStops.filter((_, i) => i !== idx);
    try {
      await base44.entities.Booking.update(booking.id, { additional_stops: updated });
      setCurrentStops(updated);
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetTrip = () => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(startKey);
    setTripStatus(null);
    setTripStartedAt(null);
    stopGPSTracking();
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
        <div>
          <p className="text-white text-sm font-semibold">{booking.client_name}</p>
          <p className="text-white/40 text-xs mt-1">{new Date(`${booking.departure_date}T${booking.departure_time || '00:00'}`).toLocaleDateString('fr-CH')} à {booking.departure_time}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#F5C300] animate-pulse" />
          <p className="text-white text-xs font-semibold">EN COURS</p>
        </div>
      </div>

      {/* Client info */}
      <div className="p-4 border-b border-white/10 space-y-2">
        {booking.client_phone && (
          <a href={`tel:${booking.client_phone}`} className="flex items-center gap-2 text-white/60 hover:text-[#F5C300] transition-colors text-sm">
            <Phone className="w-3 h-3" />
            {booking.client_phone}
          </a>
        )}
        {booking.client_email && (
          <a href={`mailto:${booking.client_email}`} className="flex items-center gap-2 text-white/60 hover:text-[#F5C300] transition-colors text-sm">
            <Mail className="w-3 h-3" />
            {booking.client_email}
          </a>
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

      {/* Payment badge */}
      {(() => {
        const method = booking.payment_method;
        const isPaid = booking.payment_status === 'paid';
        if (isPaid) {
          return (
            <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-2">
              <span className="text-lg">✅</span>
              <div>
                <p className="text-green-400 text-xs font-bold uppercase tracking-wider">Déjà payé</p>
                <p className="text-green-400/60 text-xs">{method === 'stripe' ? 'Paiement en ligne (Stripe)' : method === 'twint' ? 'TWINT' : 'Espèces'}</p>
              </div>
            </div>
          );
        }
        if (method === 'stripe') {
          return (
            <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center gap-2">
              <span className="text-lg">💳</span>
              <div>
                <p className="text-blue-400 text-xs font-bold uppercase tracking-wider">Payé en ligne</p>
                <p className="text-blue-400/60 text-xs">Stripe — rien à encaisser</p>
              </div>
            </div>
          );
        }
        if (method === 'twint') {
          return (
            <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center gap-2">
              <span className="text-lg">📱</span>
              <div>
                <p className="text-orange-400 text-xs font-bold uppercase tracking-wider">À encaisser — TWINT</p>
                <p className="text-orange-400/60 text-xs">CHF {booking.total_price?.toFixed(2)}</p>
              </div>
            </div>
          );
        }
        return (
          <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-2">
            <span className="text-lg">💵</span>
            <div>
              <p className="text-yellow-400 text-xs font-bold uppercase tracking-wider">À encaisser — Espèces</p>
              <p className="text-yellow-400/60 text-xs">CHF {booking.total_price?.toFixed(2)}</p>
            </div>
          </div>
        );
      })()}

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-white/10 border-b border-white/10 mt-3">
        <div className="p-3 text-center">
          <p className="text-white/30 text-xs mb-1">Distance</p>
          <p className="text-white text-sm font-semibold">{booking.distance_km ? `${booking.distance_km} km` : '—'}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-white/30 text-xs mb-1">Durée</p>
          <p className="text-white text-sm font-semibold">
            {(tripStatus === 'arrived' || tripStatus === 'completed') && tripStartedAt ? (
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
            disabled={savingPayment}
            className={`w-full h-11 rounded-xl border font-semibold text-sm flex items-center justify-center gap-2 transition-all ${step.bg} ${step.color} hover:opacity-80 disabled:opacity-50`}
          >
            {savingPayment && step.key === 'completed' ? <Loader2 className="w-4 h-4 animate-spin" /> : step.label}
            {!savingPayment && <ChevronRight className="w-4 h-4 ml-auto" />}
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