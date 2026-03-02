import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Car, MapPin, Phone, Bell, BellOff, Loader2, LogOut, Navigation, Zap } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const statusLabels = {
  pending: { label: 'En attente', color: 'text-yellow-400 bg-yellow-400/10' },
  paid: { label: 'Payé', color: 'text-green-400 bg-green-400/10' },
  cancelled: { label: 'Annulé', color: 'text-red-400 bg-red-400/10' },
  refunded: { label: 'Remboursé', color: 'text-blue-400 bg-blue-400/10' },
};

function formatDate(dateStr, timeStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}${timeStr ? ' à ' + timeStr : ''}`;
}

function getMapsUrl(address) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=driving`;
}

function BookingCard({ booking, isNew }) {
  const [notifying, setNotifying] = useState(null); // 'on_the_way' | 'arrived' | null
  const [notified, setNotified] = useState({ on_the_way: false, arrived: false });

  const sendClientNotification = async (type) => {
    setNotifying(type);
    try {
      await base44.functions.invoke('notifyClientDriverStatus', { booking_id: booking.id, type });
      setNotified(prev => ({ ...prev, [type]: true }));
      toast.success(type === 'on_the_way' ? 'Client notifié : chauffeur en route !' : 'Client notifié : chauffeur arrivé !');
    } catch (e) {
      toast.error('Erreur lors de l\'envoi. Réessayez.');
    } finally {
      setNotifying(null);
    }
  };

  return (
    <div className={`bg-[#111] border rounded-2xl p-5 transition-all ${isNew ? 'border-[#F5C300] shadow-[0_0_20px_rgba(245,195,0,0.15)]' : 'border-white/10'}`}>
      {isNew && (
        <div className="flex items-center gap-2 mb-3 text-[#F5C300] text-xs font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[#F5C300] animate-pulse" />
          Nouvelle course attribuée
        </div>
      )}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white font-semibold text-lg">{booking.client_name}</p>
          {booking.client_phone && (
            <a href={`tel:${booking.client_phone}`} className="flex items-center gap-1 text-white/50 text-sm hover:text-[#F5C300] transition-colors mt-0.5">
              <Phone className="w-3 h-3" />{booking.client_phone}
            </a>
          )}
        </div>
        <div className={`text-xs px-2 py-1 rounded-full font-medium ${statusLabels[booking.payment_status]?.color || 'text-white/40 bg-white/5'}`}>
          {statusLabels[booking.payment_status]?.label || booking.payment_status}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-[#F5C300]/20 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-3 h-3 text-[#F5C300]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/40 text-xs uppercase tracking-wider">Départ</p>
            <p className="text-white text-sm">{booking.departure_point}</p>
          </div>
          <a
            href={getMapsUrl(booking.departure_point)}
            target="_blank"
            rel="noopener noreferrer"
            title="Naviguer vers le point de départ"
            className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-lg hover:bg-blue-500/20 transition-all shrink-0"
          >
            <Navigation className="w-3 h-3" />
            GPS
          </a>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-3 h-3 text-white/60" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/40 text-xs uppercase tracking-wider">Destination</p>
            <p className="text-white text-sm">{booking.arrival_point}</p>
          </div>
          <a
            href={getMapsUrl(booking.arrival_point)}
            target="_blank"
            rel="noopener noreferrer"
            title="Naviguer vers la destination"
            className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-lg hover:bg-blue-500/20 transition-all shrink-0"
          >
            <Navigation className="w-3 h-3" />
            GPS
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-white/40 text-xs mb-1">Date & Heure</p>
          <p className="text-white text-sm font-medium">{formatDate(booking.departure_date, booking.departure_time)}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-white/40 text-xs mb-1">Véhicule</p>
          <p className="text-white text-sm font-medium">{booking.vehicle_type === 'comfort' ? 'COMFORT' : 'STANDARD'}</p>
        </div>
      </div>

      {(booking.passengers || booking.flight_number || booking.notes) && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-1 text-sm text-white/50">
          {booking.passengers && <p>👥 {booking.passengers} passager(s)</p>}
          {booking.flight_number && <p>✈️ Vol : {booking.flight_number}</p>}
          {booking.notes && <p>📝 {booking.notes}</p>}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-white/40 text-xs">{booking.distance_km ? `${booking.distance_km} km` : ''}</span>
        <span className="text-[#F5C300] font-bold text-lg">CHF {booking.total_price?.toFixed(2)}</span>
      </div>

      {/* Client notification buttons */}
      <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
        <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Notifier le client</p>
        <button
          onClick={() => sendClientNotification('on_the_way')}
          disabled={!!notifying || notified.on_the_way}
          className={`w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            notified.on_the_way
              ? 'bg-green-500/10 border border-green-500/20 text-green-400 cursor-default'
              : 'bg-[#F5C300]/10 border border-[#F5C300]/20 text-[#F5C300] hover:bg-[#F5C300]/20'
          } disabled:opacity-60`}
        >
          {notifying === 'on_the_way' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : notified.on_the_way ? (
            '✓ Notifié : en route'
          ) : (
            '🚗 Je suis en route'
          )}
        </button>
        <button
          onClick={() => sendClientNotification('arrived')}
          disabled={!!notifying || notified.arrived}
          className={`w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            notified.arrived
              ? 'bg-green-500/10 border border-green-500/20 text-green-400 cursor-default'
              : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
          } disabled:opacity-60`}
        >
          {notifying === 'arrived' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : notified.arrived ? (
            '✓ Notifié : arrivé'
          ) : (
            '📍 Je suis arrivé au point de départ'
          )}
        </button>
      </div>
    </div>
  );
}

export default function DriverPortal() {
  const [driverCode, setDriverCode] = useState('');
  const [driver, setDriver] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [newBookingIds, setNewBookingIds] = useState(new Set());
  const prevBookingIds = useRef(new Set());
  const audioRef = useRef(null);

  // Load saved driver from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('driver_portal_id');
    if (saved) {
      loginWithId(saved);
    }
  }, []);

  const requestNotifications = async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setNotificationsEnabled(perm === 'granted');
  };

  const sendNotification = (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    }
  };

  const playSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  };

  const loginWithId = async (id) => {
    setLoading(true);
    setError('');
    try {
      const drivers = await base44.entities.Driver.list();
      const found = drivers.find(d => d.id === id || d.id.startsWith(id) || (d.name && d.name.toLowerCase() === id.toLowerCase()));
      if (!found) {
        setError('Chauffeur introuvable. Vérifiez le code.');
        setLoading(false);
        return;
      }
      setDriver(found);
      sessionStorage.setItem('driver_portal_id', found.id);
      await loadBookings(found.id);
    } catch (e) {
      setError('Erreur d\'authentification. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async (driverId) => {
    const all = await base44.entities.Booking.list('-departure_date', 200);
    const mine = all.filter(b => b.driver_id === driverId && b.payment_status !== 'cancelled' && b.payment_status !== 'refunded');
    
    // Detect new bookings
    const currentIds = new Set(mine.map(b => b.id));
    if (prevBookingIds.current.size > 0) {
      const newIds = new Set([...currentIds].filter(id => !prevBookingIds.current.has(id)));
      if (newIds.size > 0) {
        setNewBookingIds(newIds);
        playSound();
        const newB = mine.find(b => newIds.has(b.id));
        if (newB) sendNotification('🚗 Nouvelle course attribuée !', `${newB.departure_point} → ${newB.arrival_point}`);
        setTimeout(() => setNewBookingIds(new Set()), 10000);
      }
    }
    prevBookingIds.current = currentIds;
    setBookings(mine);
  };

  // Poll for updates every 30 seconds
  useEffect(() => {
    if (!driver) return;
    const interval = setInterval(() => loadBookings(driver.id), 30000);
    return () => clearInterval(interval);
  }, [driver]);

  // Real-time subscription
  useEffect(() => {
    if (!driver) return;
    const unsubscribe = base44.entities.Booking.subscribe((event) => {
      if (event.data?.driver_id === driver.id) {
        loadBookings(driver.id);
      }
    });
    return unsubscribe;
  }, [driver]);

  const handleLogout = () => {
    sessionStorage.removeItem('driver_portal_id');
    setDriver(null);
    setBookings([]);
    setDriverCode('');
    prevBookingIds.current = new Set();
  };

  const upcoming = bookings.filter(b => {
    const dep = new Date(`${b.departure_date}T${b.departure_time || '00:00'}:00`);
    return dep >= new Date();
  }).sort((a, b) => new Date(`${a.departure_date}T${a.departure_time || '00:00'}`) - new Date(`${b.departure_date}T${b.departure_time || '00:00'}`));

  const past = bookings.filter(b => {
    const dep = new Date(`${b.departure_date}T${b.departure_time || '00:00'}:00`);
    return dep < new Date();
  });

  // Calculate current month earnings
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthlyEarnings = bookings
    .filter(b => b.payment_status === 'paid' && b.departure_date?.startsWith(currentMonth))
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  // LOGIN SCREEN
  if (!driver) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-extralight tracking-[0.3em] text-white uppercase">ROSINI</h1>
            <p className="text-white/40 text-xs tracking-[0.2em] uppercase mt-1">Portail Chauffeur</p>
          </div>

          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">Code / Nom du chauffeur</label>
              <input
                type="text"
                value={driverCode}
                onChange={e => setDriverCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loginWithId(driverCode.trim())}
                placeholder="Entrez votre code ou nom"
                className="w-full bg-white/5 border border-white/10 rounded-xl text-white text-sm p-3 outline-none placeholder:text-white/20 focus:border-[#F5C300]/50"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={() => loginWithId(driverCode.trim())}
              disabled={loading || !driverCode.trim()}
              className="w-full h-12 rounded-xl bg-[#F5C300] text-black font-bold text-sm uppercase tracking-wider hover:bg-[#e6b800] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connexion'}
            </button>
          </div>

          <p className="text-white/20 text-xs text-center">
            Le code est fourni par l'administrateur de Rosini Transfert.
          </p>
        </div>
      </div>
    );
  }

  // DRIVER DASHBOARD
  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-light text-white">Bonjour, {driver.name.split(' ')[0]} 👋</h1>
            <p className="text-white/40 text-sm mt-0.5">{upcoming.length} course{upcoming.length !== 1 ? 's' : ''} à venir</p>
            <p className="text-[#F5C300] text-sm font-semibold mt-2">CHF {monthlyEarnings.toFixed(2)} ce mois</p>
          </div>
          <div className="flex gap-2">
            <a
              href={createPageUrl('Taximeter')}
              title="Ouvrir le taximètre"
              className="w-10 h-10 rounded-xl border border-[#F5C300]/30 bg-[#F5C300]/10 text-[#F5C300] flex items-center justify-center hover:border-[#F5C300]/60 hover:bg-[#F5C300]/20 transition-all"
            >
              <Zap className="w-4 h-4" />
            </a>
            <button
              onClick={notificationsEnabled ? null : requestNotifications}
              title={notificationsEnabled ? 'Notifications actives' : 'Activer les notifications'}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${notificationsEnabled ? 'border-[#F5C300]/50 text-[#F5C300]' : 'border-white/10 text-white/40 hover:border-white/30'}`}
            >
              {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </button>
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-red-400 hover:border-red-400/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification banner */}
        {!notificationsEnabled && (
          <button
            onClick={requestNotifications}
            className="w-full mb-4 bg-[#F5C300]/10 border border-[#F5C300]/20 rounded-xl p-3 flex items-center gap-3 text-left hover:bg-[#F5C300]/20 transition-all"
          >
            <Bell className="w-4 h-4 text-[#F5C300] shrink-0" />
            <p className="text-[#F5C300] text-sm">Activer les notifications pour recevoir des alertes de nouvelles courses</p>
          </button>
        )}

        {/* Taximeter card */}
        <a
          href={createPageUrl('Taximeter')}
          className="flex items-center gap-4 bg-[#F5C300]/10 border border-[#F5C300]/30 rounded-2xl p-4 mb-6 hover:bg-[#F5C300]/20 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#F5C300] flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-black" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Taximètre</p>
            <p className="text-white/40 text-xs mt-0.5">Démarrer le compteur kilométrique</p>
          </div>
          <div className="ml-auto text-[#F5C300]/60 group-hover:text-[#F5C300] transition-all">›</div>
        </a>

        {/* Upcoming bookings */}
        {upcoming.length > 0 ? (
          <div className="space-y-3 mb-8">
            <h2 className="text-white/50 text-xs uppercase tracking-wider px-1">Prochaines courses</h2>
            {upcoming.map(b => (
              <BookingCard key={b.id} booking={b} isNew={newBookingIds.has(b.id)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 mb-8">
            <Car className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/30">Nenhuma corrida agendada</p>
            <p className="text-white/20 text-sm mt-1">A página atualiza automaticamente a cada 30 segundos</p>
          </div>
        )}

        {/* Past bookings */}
        {past.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-white/30 text-xs uppercase tracking-wider px-1">Histórico</h2>
            {past.slice(0, 5).map(b => (
              <div key={b.id} className="opacity-50">
                <BookingCard key={b.id} booking={b} isNew={false} />
              </div>
            ))}
          </div>
        )}

        <p className="text-white/20 text-xs text-center mt-8">
          Atualiza em tempo real · Rosini Transfert
        </p>
      </div>
    </div>
  );
}