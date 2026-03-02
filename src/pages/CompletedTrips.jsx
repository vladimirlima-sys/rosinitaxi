import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Car } from 'lucide-react';
import { createPageUrl } from '@/utils';
import BookingCard from '@/components/bookings/BookingCard';

export default function CompletedTrips() {
  const [driver, setDriver] = useState(null);
  const [completedTrips, setCompletedTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem('driver_portal_id');
    if (!saved) {
      window.location.href = createPageUrl('DriverPortal');
      return;
    }

    loadTrips(saved);
  }, []);

  const loadTrips = async (driverId) => {
    try {
      const drivers = await base44.entities.Driver.list();
      const found = drivers.find(d => d.id === driverId);
      if (!found) {
        window.location.href = createPageUrl('DriverPortal');
        return;
      }
      setDriver(found);

      const all = await base44.entities.Booking.list('-updated_date', 200);
      const completed = all.filter(b => 
        b.driver_id === driverId && 
        b.payment_status === 'paid' &&
        localStorage.getItem(`trip_status_${b.id}`) === 'completed'
      );
      setCompletedTrips(completed);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <p className="text-white/40">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <a
            href={createPageUrl('DriverPortal')}
            className="flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </a>
          <h1 className="text-2xl font-light text-white">Corridas Finalizadas</h1>
          <div className="w-4" />
        </div>

        {/* Content */}
        {completedTrips.length > 0 ? (
          <div className="space-y-3">
            {completedTrips.map(trip => (
              <BookingCard key={trip.id} booking={trip} isNew={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Car className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/30">Nenhuma corrida finalizada</p>
            <p className="text-white/20 text-sm mt-1">Suas corridas completadas aparecerão aqui</p>
          </div>
        )}

        <p className="text-white/20 text-xs text-center mt-8">
          Histórico de corridas · Rosini Transfert
        </p>
      </div>
    </div>
  );
}