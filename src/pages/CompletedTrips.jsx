import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Car, TrendingUp, Route, CheckCircle, ChevronDown } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function TripCard({ trip }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-medium">{trip.client_name}</p>
          <p className="text-white/40 text-xs mt-0.5">
            {trip.departure_date
              ? format(new Date(trip.departure_date + 'T00:00:00'), 'EEEE d MMMM yyyy', { locale: fr })
              : '—'}
            {trip.departure_time ? ` · ${trip.departure_time}` : ''}
          </p>
        </div>
        <p className="text-[#F5C300] font-bold text-lg">CHF {Number(trip.total_price || 0).toFixed(0)}</p>
      </div>

      <div className="flex items-center gap-2 text-white/50 text-sm">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
        <p className="truncate">{trip.departure_point?.split(',')[0]}</p>
        <span className="text-white/20">→</span>
        <p className="truncate">{trip.arrival_point?.split(',')[0]}</p>
      </div>

      <div className="flex items-center gap-4 mt-2 text-xs text-white/30">
        {trip.distance_km && <span>{trip.distance_km} km</span>}
        {trip.passengers && <span>{trip.passengers} passager{trip.passengers > 1 ? 's' : ''}</span>}
        <span>{trip.vehicle_type === 'comfort' ? 'Confort' : 'Économique'}</span>
      </div>
    </div>
  );
}

export default function CompletedTrips() {
  const [driver, setDriver] = useState(null);
  const [completedTrips, setCompletedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('all');

  useEffect(() => {
    const saved = sessionStorage.getItem('driver_portal_id') || 'demo_driver';
    loadTrips(saved);
  }, []);

  const loadTrips = async (driverId) => {
    try {
      const all = await base44.asServiceRole.entities.Booking.list('-departure_date', 500);
      // Show all paid trips for this driver (no localStorage dependency)
      const completed = all.filter(b =>
        b.driver_id === driverId &&
        b.payment_status === 'paid' &&
        new Date(b.departure_date) <= new Date()
      );
      setCompletedTrips(completed);
      
      // Get driver name from first trip or set generic
      if (completed.length > 0) {
        setDriver({ id: driverId, name: completed[0].driver_name || 'Motorista' });
      }
    } catch (err) {
      console.error('Error loading trips:', err);
      window.location.href = createPageUrl('DriverPortal');
    } finally {
      setLoading(false);
    }
  };

  // Build month options from trips
  const monthOptions = React.useMemo(() => {
    const months = new Set();
    completedTrips.forEach(t => {
      if (t.departure_date) months.add(t.departure_date.slice(0, 7));
    });
    return [...months].sort((a, b) => b.localeCompare(a));
  }, [completedTrips]);

  const filtered = selectedMonth === 'all'
    ? completedTrips
    : completedTrips.filter(t => t.departure_date?.startsWith(selectedMonth));

  const totalRevenue = filtered.reduce((s, t) => s + (t.total_price || 0), 0);
  const totalKm = filtered.reduce((s, t) => s + (t.distance_km || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <p className="text-white/40">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <a href={createPageUrl('DriverPortal')} className="flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </a>
          <div className="text-center">
            <h1 className="text-2xl font-light text-white">Courses terminées</h1>
            {driver && <p className="text-white/30 text-xs mt-0.5">{driver.name}</p>}
          </div>
          <div className="w-4" />
        </div>

        {/* Month filter */}
        {monthOptions.length > 0 && (
          <div className="relative mb-5">
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="w-full appearance-none bg-white/[0.05] border border-white/10 text-white text-sm rounded-xl px-4 py-3 outline-none pr-10"
            >
              <option value="all" className="bg-[#111]">Tous les mois</option>
              {monthOptions.map(m => (
                <option key={m} value={m} className="bg-[#111]">
                  {format(new Date(m + '-01'), 'MMMM yyyy', { locale: fr })}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          </div>
        )}

        {/* Stats */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 text-center">
              <CheckCircle className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <p className="text-white font-bold text-xl">{filtered.length}</p>
              <p className="text-white/30 text-xs">Courses</p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 text-center">
              <TrendingUp className="w-4 h-4 text-[#F5C300] mx-auto mb-1" />
              <p className="text-white font-bold text-xl">CHF {totalRevenue.toFixed(0)}</p>
              <p className="text-white/30 text-xs">Total</p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 text-center">
              <Route className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <p className="text-white font-bold text-xl">{Math.round(totalKm)}</p>
              <p className="text-white/30 text-xs">km</p>
            </div>
          </div>
        )}

        {/* Trips list */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Car className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/30">Aucune course terminée</p>
            <p className="text-white/20 text-sm mt-1">Vos courses complétées apparaîtront ici</p>
          </div>
        )}

        <p className="text-white/10 text-xs text-center mt-8">
          Historique · Rosini Transfert
        </p>
      </div>
    </div>
  );
}