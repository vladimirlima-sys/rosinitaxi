import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';

function playAlert() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
}

function sendBrowserNotif(title, body) {
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    const n = new Notification(title, { body, icon: '/favicon.ico' });
    n.onclick = () => {window.focus();window.location.href = '/reservas';};
  }
}

export default function AdminPushNotifications({ isAdmin }) {
  const [permStatus, setPermStatus] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const knownIds = useRef(null);
  const knownStatuses = useRef({});

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') {
      toast.error('Notificações não suportadas neste navegador');
      return;
    }
    const perm = await Notification.requestPermission();
    setPermStatus(perm);
    if (perm === 'granted') toast.success('Notificações ativadas!');
  };

  useEffect(() => {
    if (!isAdmin) return;

    const unsubscribe = base44.entities.Booking.subscribe((event) => {
      // New booking
      if (event.type === 'create') {
        const d = event.data || {};
        playAlert();
        sendBrowserNotif(
          '🚗 Nova reserva!',
          `${d.client_name || 'Cliente'} · ${d.departure_point || ''} → ${d.arrival_point || ''}`
        );
        toast.custom(() =>
        <div
          className="bg-[#F5C300] text-black px-4 py-3 rounded-xl shadow-lg cursor-pointer font-semibold"
          onClick={() => window.location.href = '/reservas'}>

            🚗 Nova reserva de {d.client_name || 'Cliente'}!
          </div>,
        { duration: 8000 });
      }

      // Cancellation
      if (event.type === 'update') {
        const d = event.data || {};
        const old = event.old_data || {};
        if (old.payment_status && d.payment_status !== old.payment_status) {
          if (d.payment_status === 'cancelled' || d.payment_status === 'refunded') {
            playAlert();
            sendBrowserNotif(
              d.payment_status === 'refunded' ? '💸 Reserva reembolsada' : '❌ Reserva cancelada',
              `${d.client_name || ''} · ${d.departure_point || ''} → ${d.arrival_point || ''}`
            );
            toast.warning(
              `${d.payment_status === 'refunded' ? '💸 Reembolso' : '❌ Cancelamento'}: ${d.client_name || 'Cliente'}`,
              { duration: 6000 }
            );
          } else if (d.payment_status === 'paid' && old.payment_status !== 'paid') {
            sendBrowserNotif('✅ Pagamento confirmado', `${d.client_name || ''} — CHF ${d.total_price?.toFixed(2) || ''}`);
            toast.success(`✅ Pagamento confirmado: ${d.client_name || 'Cliente'}`, { duration: 5000 });
          }
        }
      }
    });

    return unsubscribe;
  }, [isAdmin]);

  if (!isAdmin) return null;
  if (permStatus === 'granted') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      






    </div>);

}