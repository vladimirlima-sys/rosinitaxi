import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Loader2, CalendarDays } from 'lucide-react';
import { startOfWeek, startOfMonth } from 'date-fns';
import { toast } from 'sonner';
import CalendarFilters from '@/components/calendar/CalendarFilters';
import WeekCalendar from '@/components/calendar/WeekCalendar';
import MonthCalendar from '@/components/calendar/MonthCalendar';

export default function Calendar() {
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDriver, setFilterDriver] = useState('all');

  useEffect(() => {
    if (localStorage.getItem('admin_unlocked') !== 'true') {
      window.location.href = createPageUrl('AdminPanel');
      return;
    }
    load();

    // Real-time updates
    const unsub = base44.entities.Booking.subscribe((event) => {
      if (event.type === 'create') setBookings(prev => [...prev, event.data]);
      else if (event.type === 'update') setBookings(prev => prev.map(b => b.id === event.id ? event.data : b));
      else if (event.type === 'delete') setBookings(prev => prev.filter(b => b.id !== event.id));
    });

    return () => unsub();
  }, []);

  const load = async () => {
    try {
      const [bks, drvs] = await Promise.all([
        base44.entities.Booking.list('-departure_date', 500),
        base44.entities.Driver.list(),
      ]);
      setBookings(bks);
      setDrivers(drvs);
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriver = async (bookingId, driver) => {
    const update = driver ? { driver_id: driver.id, driver_name: driver.name } : { driver_id: '', driver_name: '' };
    await base44.entities.Booking.update(bookingId, update);
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...update } : b));
    toast.success(driver ? `${driver.name} attribué` : 'Chauffeur retiré');
  };

  const handleReschedule = async (bookingId, newDate, time) => {
    await base44.entities.Booking.update(bookingId, { departure_date: newDate });
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, departure_date: newDate } : b));
    toast.success(`Course déplacée au ${newDate}`);
  };

  const filteredBookings = bookings.filter(b => {
    if (filterStatus !== 'all' && b.payment_status !== filterStatus) return false;
    if (filterDriver === 'unassigned' && b.driver_id) return false;
    if (filterDriver !== 'all' && filterDriver !== 'unassigned' && b.driver_id !== filterDriver) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <a href={createPageUrl('AdminPanel')} className="flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div className="flex items-center gap-3">
            <CalendarDays className="w-6 h-6 text-[#F5C300]" />
            <h1 className="text-4xl font-light text-white">Calendrier</h1>
          </div>
        </div>
        <p className="text-white/40 text-sm mb-8">Glissez-déposez pour changer la date · Cliquez sur le chauffeur pour le réattribuer</p>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#F5C300] animate-spin" />
          </div>
        ) : (
          <>
            <CalendarFilters
              weekStart={weekStart}
              setWeekStart={setWeekStart}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterDriver={filterDriver}
              setFilterDriver={setFilterDriver}
              drivers={drivers}
            />
            <WeekCalendar
              weekStart={weekStart}
              bookings={filteredBookings}
              drivers={drivers}
              onAssignDriver={handleAssignDriver}
              onReschedule={handleReschedule}
            />
            <div className="mt-4 text-white/30 text-xs">
              {filteredBookings.length} course{filteredBookings.length !== 1 ? 's' : ''} affichée{filteredBookings.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </div>
    </div>
  );
}