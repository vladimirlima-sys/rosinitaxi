import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import BookingsTable from '@/components/admin/BookingsTable';
import ReservasKPI from '@/components/admin/ReservasKPI.jsx';

export default function Reservas() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
          window.location.href = createPageUrl('AdminPanel');
          return;
        }
        
        // Fetch stats
        const bookings = await base44.asServiceRole.entities.Booking.list('-created_date', 500);
        const stats = {
          total: bookings.length,
          pending: bookings.filter(b => b.payment_status === 'pending').length,
          paid: bookings.filter(b => b.payment_status === 'paid').length,
          cancelled: bookings.filter(b => b.payment_status === 'cancelled').length,
          revenue: bookings.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + (b.total_price || 0), 0),
        };
        setStats(stats);
        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth error:', error);
        window.location.href = createPageUrl('AdminPanel');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C9A96E] animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-8 md:py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <a
            href={createPageUrl('AdminPanel')}
            className="flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </a>
          <h1 className="text-3xl md:text-4xl font-light text-white">Reservas</h1>
        </div>
        
        {stats && <ReservasKPI stats={stats} />}

        <BookingsTable />
      </div>
    </div>
  );
}