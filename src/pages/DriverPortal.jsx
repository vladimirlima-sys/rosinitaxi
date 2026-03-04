import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Car, Bell, BellOff, Loader2, LogOut, Zap, ArrowLeft } from 'lucide-react';
import { createPageUrl } from '@/utils';
import ActiveTripMonitor from '@/components/drivers/ActiveTripMonitor';
// DriverPortal - clean version

export default function DriverPortal() {
  const [driverCode, setDriverCode] = useState('');
  const [rememberPassword, setRememberPassword] = useState(false);
  const [driver, setDriver] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showEarnings, setShowEarnings] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [newBookingIds, setNewBookingIds] = useState(new Set());
  const prevBookingIds = useRef(new Set());
  const loadingRef = useRef(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('driver_portal_id') || localStorage.getItem('driver_portal_code');
    if (saved) {
      setDriverCode(saved);
      setRememberPassword(!!localStorage.getItem('driver_portal_code'));
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
      new Notification(title, { body, icon: '/favicon.ico' });
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
      if (rememberPassword) {
        localStorage.setItem('driver_portal_code', id);
      } else {
        localStorage.removeItem('driver_portal_code');
      }
      await loadBookings(found.id);
    } catch (e) {
      setError('Erreur d\'authentification. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async (driverId) => {
   if (loadingRef.current) return;
   loadingRef.current = true;
   try {
     const mine = await base44.entities.Booking.filter({
       driver_id: driverId,
       payment_status: { $nin: ['cancelled', 'refunded'] }
     }, '-departure_date', 100);
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
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    if (!driver) return;
    const interval = setInterval(() => loadBookings(driver.id), 30000);
    return () => clearInterval(interval);
  }, [driver]);

  const handleLogout = () => {
    sessionStorage.removeItem('driver_portal_id');
    if (!rememberPassword) {
      localStorage.removeItem('driver_portal_code');
      setDriverCode('');
    }
    setDriver(null);
    setBookings([]);
    prevBookingIds.current = new Set();
  };

  const upcoming = bookings.filter(b => {
    if (b.payment_status === 'paid') return false;
    const localCompleted = localStorage.getItem(`trip_status_${b.id}`) === 'completed';
    if (localCompleted) return false;
    return true;
  }).sort((a, b) => new Date(`${a.departure_date}T${a.departure_time || '00:00'}`) - new Date(`${b.departure_date}T${b.departure_time || '00:00'}`));

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthlyEarnings = bookings
    .filter(b => b.payment_status === 'paid' && b.departure_date?.startsWith(currentMonth))
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  // LOGIN SCREEN
  if (!driver) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6">
        <a href={createPageUrl('Home')} className="absolute left-4 top-8 flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
        </a>
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
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberPassword}
                onChange={e => setRememberPassword(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[#F5C300] cursor-pointer"
              />
              <span className="text-white/50 text-sm">Se souvenir de moi</span>
            </label>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={() => loginWithId(driverCode.trim())}
              disabled={loading || !driverCode.trim()}
              className="w-full h-12 rounded-xl bg-[#F5C300] text-black font-bold text-sm uppercase tracking-wider hover:bg-[#e6b800] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connexion'}
            </button>
          </div>
          <p className="text-white/20 text-xs text-center">Le code est fourni par l'administrateur de Rosini Transfert.</p>
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
            <p
              className="text-sm font-semibold mt-2 cursor-pointer select-none"
              onClick={() => { setShowEarnings(true); setTimeout(() => setShowEarnings(false), 3000); }}
            >
              <span className="text-white/30 text-xs uppercase tracking-wider mr-1">ce mois</span>
              <span className={`transition-all duration-300 ${showEarnings ? 'text-[#F5C300]' : 'text-[#F5C300]/20 blur-sm'}`}>
                CHF {monthlyEarnings.toFixed(2)}
              </span>
            </p>
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

        {/* Upcoming trips */}
        {upcoming.length > 0 ? (
          <div className="space-y-3 mb-8">
            <h2 className="text-white/50 text-xs uppercase tracking-wider px-1 mb-3">Suivi en temps réel</h2>
            {upcoming.map(b => (
              <ActiveTripMonitor key={b.id} booking={b} onCompleted={() => loadBookings(driver.id)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 mb-8">
            <Car className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/30">Aucune course planifiée</p>
            <p className="text-white/20 text-sm mt-1">La page se met à jour automatiquement toutes les 30 secondes</p>
          </div>
        )}

        {/* Link to completed trips */}
        <a
          href={createPageUrl('CompletedTrips')}
          className="flex items-center gap-4 bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mb-6 hover:bg-green-500/20 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
            <Car className="w-6 h-6 text-black" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Courses terminées</p>
            <p className="text-white/40 text-xs mt-0.5">Voir l'historique des courses complétées</p>
          </div>
          <div className="ml-auto text-green-500/60 group-hover:text-green-500 transition-all">›</div>
        </a>

        <p className="text-white/20 text-xs text-center mt-8">
          {lastUpdated
            ? `Mis à jour à ${lastUpdated.getHours().toString().padStart(2,'0')}:${lastUpdated.getMinutes().toString().padStart(2,'0')} · Rosini Transfert`
            : 'Mise à jour en temps réel · Rosini Transfert'}
        </p>
      </div>
    </div>
  );
}