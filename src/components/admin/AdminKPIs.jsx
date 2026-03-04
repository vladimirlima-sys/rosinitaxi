import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import {
  CalendarCheck, Clock, AlertTriangle, TrendingUp,
  Users, Car, CreditCard, UserX
} from 'lucide-react';

function formatCHF(n) {
  return `CHF ${(n || 0).toFixed(0)}`;
}

export default function AdminKPIs() {
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Booking.list('-departure_date', 300),
      base44.entities.Driver.list(),
    ]).then(([bookings, drivers]) => {
      const today = new Date().toISOString().slice(0, 10);
      const thisMonth = new Date().toISOString().slice(0, 7);

      const todayBookings = bookings.filter(b => b.departure_date === today);
      const pendingPayment = bookings.filter(b => b.payment_status === 'pending');
      const noDriver = bookings.filter(b => !b.driver_id && b.payment_status !== 'cancelled' && b.departure_date >= today);
      const monthRevenue = bookings
        .filter(b => b.departure_date?.startsWith(thisMonth) && b.payment_status === 'paid')
        .reduce((s, b) => s + (b.total_price || 0), 0);
      const recentBookings = [...bookings]
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .slice(0, 5);

      setData({ todayBookings, pendingPayment, noDriver, monthRevenue, recentBookings, drivers, bookings });
    });
  }, []);

  if (!data) return (
    <div className="text-black/50 text-sm text-center py-8">Chargement des données...</div>
  );

  const kpis = [
    { icon: CalendarCheck, label: "Trajets aujourd'hui", value: data.todayBookings.length, link: createPageUrl('Reservas'), color: 'bg-black text-white' },
    { icon: TrendingUp, label: 'Revenu ce mois', value: formatCHF(data.monthRevenue), link: createPageUrl('Finance'), color: 'bg-black text-white' },
    { icon: Clock, label: 'Paiements en attente', value: data.pendingPayment.length, link: createPageUrl('Reservas'), color: data.pendingPayment.length > 0 ? 'bg-orange-500 text-white' : 'bg-black text-white' },
    { icon: AlertTriangle, label: 'Sans chauffeur', value: data.noDriver.length, link: createPageUrl('Reservas'), color: data.noDriver.length > 0 ? 'bg-red-500 text-white' : 'bg-black text-white' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        {kpis.map(({ icon: Icon, label, value, link, color }) => (
          <a key={label} href={link} className={`${color} rounded-xl p-4 hover:opacity-90 transition-opacity`}>
            <Icon className="w-5 h-5 mb-2 opacity-80" />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs opacity-70 mt-1">{label}</p>
          </a>
        ))}
      </div>

      {/* Alerts */}
      {(data.noDriver.length > 0 || data.pendingPayment.length > 0) && (
        <div className="space-y-2">
          {data.noDriver.length > 0 && (
            <a href={createPageUrl('Reservas')} className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 hover:bg-red-500/20 transition-colors">
              <UserX className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{data.noDriver.length} réservation(s) sans chauffeur assigné</p>
            </a>
          )}
          {data.pendingPayment.length > 0 && (
            <a href={createPageUrl('Reservas')} className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-3 hover:bg-orange-500/20 transition-colors">
              <CreditCard className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <p className="text-sm text-orange-700 font-medium">{data.pendingPayment.length} paiement(s) en attente</p>
            </a>
          )}
        </div>
      )}

      {/* Recent bookings */}
      <div>
        <p className="text-black/50 text-xs uppercase tracking-wider font-semibold mb-3">Dernières réservations</p>
        <div className="space-y-2">
          {data.recentBookings.map((b) => (
            <a key={b.id} href={createPageUrl('Reservas')} className="flex items-center justify-between bg-black/5 hover:bg-black/10 rounded-xl px-4 py-3 transition-colors">
              <div>
                <p className="text-black text-sm font-medium">{b.client_name}</p>
                <p className="text-black/50 text-xs">{b.departure_point} → {b.arrival_point}</p>
              </div>
              <div className="text-right">
                <p className="text-black text-sm font-bold">CHF {b.total_price?.toFixed(0)}</p>
                <p className="text-black/50 text-xs">{b.departure_date}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-black/50 text-xs uppercase tracking-wider font-semibold mb-3">Actions rapides</p>
        <div className="grid grid-cols-2 gap-2">
          <a href={createPageUrl('Reservas') + '?new=1'} className="flex items-center gap-2 bg-black text-white rounded-xl px-4 py-3 text-sm font-medium hover:bg-black/80 transition-colors">
            <CalendarCheck className="w-4 h-4" /> Nouvelle réservation
          </a>
          <a href={createPageUrl('Calendar')} className="flex items-center gap-2 bg-black/10 text-black rounded-xl px-4 py-3 text-sm font-medium hover:bg-black/20 transition-colors">
            <Car className="w-4 h-4" /> Voir le calendrier
          </a>
          <a href={createPageUrl('Drivers')} className="flex items-center gap-2 bg-black/10 text-black rounded-xl px-4 py-3 text-sm font-medium hover:bg-black/20 transition-colors">
            <Users className="w-4 h-4" /> Gérer les chauffeurs
          </a>
          <a href={createPageUrl('Finance')} className="flex items-center gap-2 bg-black/10 text-black rounded-xl px-4 py-3 text-sm font-medium hover:bg-black/20 transition-colors">
            <TrendingUp className="w-4 h-4" /> Finances
          </a>
        </div>
      </div>
    </div>
  );
}