import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Car, MapPin, Phone, Bell, BellOff, Loader2, LogOut, Navigation } from 'lucide-react';
import { toast } from 'sonner';

const statusLabels = {
  pending: { label: 'Pendente', color: 'text-yellow-700 bg-yellow-700/10' },
  paid: { label: 'Pago', color: 'text-green-700 bg-green-700/10' },
  cancelled: { label: 'Cancelado', color: 'text-red-600 bg-red-600/10' },
  refunded: { label: 'Reembolsado', color: 'text-blue-700 bg-blue-700/10' },
};

function formatDate(dateStr, timeStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}${timeStr ? ' às ' + timeStr : ''}`;
}

function getMapsUrl(address) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=driving`;
}

function BookingCard({ booking, isNew }) {
  const [notifying, setNotifying] = useState(null);
  const [notified, setNotified] = useState({ on_the_way: false, arrived: false });

  const sendClientNotification = async (type) => {
    setNotifying(type);
    try {
      await base44.functions.invoke('notifyClientDriverStatus', { booking_id: booking.id, type });
      setNotified(prev => ({ ...prev, [type]: true }));
      toast.success(type === 'on_the_way' ? 'Cliente notificado: motorista a caminho!' : 'Cliente notificado: motorista chegou!');
    } catch (e) {
      toast.error('Erro ao enviar notificação. Tente novamente.');
    } finally {
      setNotifying(null);
    }
  };

  return (
    <div className={`bg-[#F5C300] border-2 rounded-2xl p-5 transition-all ${isNew ? 'border-black shadow-[0_0_20px_rgba(0,0,0,0.2)]' : 'border-black/20'}`}>
      {isNew && (
        <div className="flex items-center gap-2 mb-3 text-black text-xs font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
          Nova corrida atribuída
        </div>
      )}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-black font-semibold text-lg">{booking.client_name}</p>
          {booking.client_phone && (
            <a href={`tel:${booking.client_phone}`} className="flex items-center gap-1 text-black/50 text-sm hover:text-black transition-colors mt-0.5">
              <Phone className="w-3 h-3" />{booking.client_phone}
            </a>
          )}
        </div>
        <div className={`text-xs px-2 py-1 rounded-full font-medium ${statusLabels[booking.payment_status]?.color || 'text-black/40 bg-black/5'}`}>
          {statusLabels[booking.payment_status]?.label || booking.payment_status}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-3 h-3 text-black" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-black/50 text-xs uppercase tracking-wider">Partida</p>
            <p className="text-black text-sm">{booking.departure_point}</p>
          </div>
          <a
            href={getMapsUrl(booking.departure_point)}
            target="_blank"
            rel="noopener noreferrer"
            title="Navegar até ao ponto de partida"
            className="flex items-center gap-1 bg-black/10 border border-black/20 text-black text-xs px-2 py-1 rounded-lg hover:bg-black/20 transition-all shrink-0"
          >
            <Navigation className="w-3 h-3" />
            GPS
          </a>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-3 h-3 text-black/60" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-black/50 text-xs uppercase tracking-wider">Destino</p>
            <p className="text-black text-sm">{booking.arrival_point}</p>
          </div>
          <a
            href={getMapsUrl(booking.arrival_point)}
            target="_blank"
            rel="noopener noreferrer"
            title="Navegar até ao destino"
            className="flex items-center gap-1 bg-black/10 border border-black/20 text-black text-xs px-2 py-1 rounded-lg hover:bg-black/20 transition-all shrink-0"
          >
            <Navigation className="w-3 h-3" />
            GPS
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-black/10 rounded-xl p-3">
          <p className="text-black/50 text-xs mb-1">Data & Hora</p>
          <p className="text-black text-sm font-medium">{formatDate(booking.departure_date, booking.departure_time)}</p>
        </div>
        <div className="bg-black/10 rounded-xl p-3">
          <p className="text-black/50 text-xs mb-1">Veículo</p>
          <p className="text-black text-sm font-medium">{booking.vehicle_type === 'comfort' ? 'COMFORT' : 'STANDARD'}</p>
        </div>
      </div>

      {(booking.passengers || booking.flight_number || booking.notes) && (
        <div className="mt-3 pt-3 border-t border-black/10 space-y-1 text-sm text-black/60">
          {booking.passengers && <p>👥 {booking.passengers} passageiro(s)</p>}
          {booking.flight_number && <p>✈️ Voo: {booking.flight_number}</p>}
          {booking.notes && <p>📝 {booking.notes}</p>}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-black/40 text-xs">{booking.distance_km ? `${booking.distance_km} km` : ''}</span>
        <span className="text-black font-bold text-lg">CHF {booking.total_price?.toFixed(2)}</span>
      </div>

      {/* Client notification buttons */}
      <div className="mt-4 pt-4 border-t border-black/10 space-y-2">
        <p className="text-black/40 text-xs uppercase tracking-wider mb-2">Notificar o cliente</p>
        <button
          onClick={() => sendClientNotification('on_the_way')}
          disabled={!!notifying || notified.on_the_way}
          className={`w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            notified.on_the_way
              ? 'bg-green-600/10 border border-green-600/20 text-green-700 cursor-default'
              : 'bg-black text-[#F5C300] border border-black hover:bg-black/80'
          } disabled:opacity-60`}
        >
          {notifying === 'on_the_way' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : notified.on_the_way ? (
            '✓ Notificado: a caminho'
          ) : (
            '🚗 Estou a caminho'
          )}
        </button>
        <button
          onClick={() => sendClientNotification('arrived')}
          disabled={!!notifying || notified.arrived}
          className={`w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            notified.arrived
              ? 'bg-green-600/10 border border-green-600/20 text-green-700 cursor-default'
              : 'bg-black/10 border border-black/20 text-black hover:bg-black/20'
          } disabled:opacity-60`}
        >
          {notifying === 'arrived' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : notified.arrived ? (
            '✓ Notificado: chegou'
          ) : (
            '📍 Cheguei ao ponto de partida'
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

  useEffect(() => {
    const saved = sessionStorage.getItem('driver_portal_id');
    if (saved) loginWithId(saved);
  }, []);

  const requestNotifications = async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setNotificationsEnabled(perm === 'granted');
  };

  const sendNotification = (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico', badge: '/favicon.ico' });
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
        setError('Motorista não encontrado. Verifique o código.');
        setLoading(false);
        return;
      }
      setDriver(found);
      sessionStorage.setItem('driver_portal_id', found.id);
      await loadBookings(found.id);
    } catch (e) {
      setError('Erro ao autenticar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async (driverId) => {
    const all = await base44.entities.Booking.list('-departure_date', 200);
    const mine = all.filter(b => b.driver_id === driverId && b.payment_status !== 'cancelled' && b.payment_status !== 'refunded');
    const currentIds = new Set(mine.map(b => b.id));
    if (prevBookingIds.current.size > 0) {
      const newIds = new Set([...currentIds].filter(id => !prevBookingIds.current.has(id)));
      if (newIds.size > 0) {
        setNewBookingIds(newIds);
        playSound();
        const newB = mine.find(b => newIds.has(b.id));
        if (newB) sendNotification('🚗 Nova corrida atribuída!', `${newB.departure_point} → ${newB.arrival_point}`);
        setTimeout(() => setNewBookingIds(new Set()), 10000);
      }
    }
    prevBookingIds.current = currentIds;
    setBookings(mine);
  };

  useEffect(() => {
    if (!driver) return;
    const interval = setInterval(() => loadBookings(driver.id), 30000);
    return () => clearInterval(interval);
  }, [driver]);

  useEffect(() => {
    if (!driver) return;
    const unsubscribe = base44.entities.Booking.subscribe((event) => {
      if (event.data?.driver_id === driver.id) loadBookings(driver.id);
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

  // LOGIN SCREEN
  if (!driver) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-extralight tracking-[0.3em] text-white uppercase">ROSINI</h1>
            <p className="text-white/40 text-xs tracking-[0.2em] uppercase mt-1">Portal do Motorista</p>
          </div>

          <div className="bg-[#F5C300] rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">Código / Nome do Motorista</label>
              <input
                type="text"
                value={driverCode}
                onChange={e => setDriverCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loginWithId(driverCode.trim())}
                placeholder="Insira o seu código ou nome"
                className="w-full bg-black/10 border border-black/20 rounded-xl text-black text-sm p-3 outline-none placeholder:text-black/40 focus:border-black/60"
              />
            </div>

            {error && <p className="text-red-700 text-sm">{error}</p>}

            <button
              onClick={() => loginWithId(driverCode.trim())}
              disabled={loading || !driverCode.trim()}
              className="w-full h-12 rounded-xl bg-black text-[#F5C300] font-bold text-sm uppercase tracking-wider hover:bg-black/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Entrar'}
            </button>
          </div>

          <p className="text-white/30 text-xs text-center">
            O código é fornecido pelo administrador da Rosini Transfert.
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
            <h1 className="text-2xl font-light text-white">Olá, {driver.name.split(' ')[0]} 👋</h1>
            <p className="text-white/40 text-sm mt-0.5">{upcoming.length} corrida{upcoming.length !== 1 ? 's' : ''} a vir</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={notificationsEnabled ? null : requestNotifications}
              title={notificationsEnabled ? 'Notificações ativas' : 'Ativar notificações'}
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
            className="w-full mb-4 bg-black/10 border border-black/20 rounded-xl p-3 flex items-center gap-3 text-left hover:bg-black/20 transition-all"
          >
            <Bell className="w-4 h-4 text-black shrink-0" />
            <p className="text-black text-sm">Ativar notificações para receber alertas de novas corridas</p>
          </button>
        )}

        {/* Upcoming bookings */}
        {upcoming.length > 0 ? (
          <div className="space-y-3 mb-8">
            <h2 className="text-black/50 text-xs uppercase tracking-wider px-1">Próximas corridas</h2>
            {upcoming.map(b => (
              <BookingCard key={b.id} booking={b} isNew={newBookingIds.has(b.id)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 mb-8">
            <Car className="w-10 h-10 text-black/20 mx-auto mb-3" />
            <p className="text-black/40">Nenhuma corrida agendada</p>
            <p className="text-black/30 text-sm mt-1">A página atualiza automaticamente a cada 30 segundos</p>
          </div>
        )}

        {/* Past bookings */}
        {past.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-black/40 text-xs uppercase tracking-wider px-1">Histórico</h2>
            {past.slice(0, 5).map(b => (
              <div key={b.id} className="opacity-50">
                <BookingCard key={b.id} booking={b} isNew={false} />
              </div>
            ))}
          </div>
        )}

        <p className="text-black/30 text-xs text-center mt-8">
          Atualiza em tempo real · Rosini Transfert
        </p>
      </div>
    </div>
  );
}