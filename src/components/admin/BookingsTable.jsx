import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import BookingRow from './BookingRow';
import BookingsFilters from './BookingsFilters';

export default function BookingsTable() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: '',
    status: 'all',
    vehicle: 'all',
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [deletingMultiple, setDeletingMultiple] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await base44.entities.Booking.list('-created_date', 100);
        setBookings(data);
      } catch (error) {
        toast.error('Erro ao carregar reservas');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    if (filters.date && booking.departure_date !== filters.date) return false;
    if (filters.status !== 'all' && booking.payment_status !== filters.status) return false;
    if (filters.vehicle !== 'all' && booking.vehicle_type !== filters.vehicle) return false;
    return true;
  });

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await base44.entities.Booking.update(bookingId, { payment_status: newStatus });
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, payment_status: newStatus } : b))
      );
      toast.success('Status atualizado com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDelete = async (bookingId) => {
    if (confirm('Tem certeza que deseja deletar esta reserva?')) {
      try {
        await base44.entities.Booking.delete(bookingId);
        setBookings((prev) => prev.filter((b) => b.id !== bookingId));
        setSelectedIds((prev) => prev.filter((id) => id !== bookingId));
        toast.success('Reserva deletada com sucesso');
      } catch (error) {
        toast.error('Erro ao deletar reserva');
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Tem certeza que deseja deletar ${selectedIds.length} reserva(s)?`)) return;
    setDeletingMultiple(true);
    try {
      await Promise.all(selectedIds.map((id) => base44.entities.Booking.delete(id)));
      setBookings((prev) => prev.filter((b) => !selectedIds.includes(b.id)));
      setSelectedIds([]);
      toast.success(`${selectedIds.length} reserva(s) deletada(s) com sucesso`);
    } catch (error) {
      toast.error('Erro ao deletar reservas');
    } finally {
      setDeletingMultiple(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredBookings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredBookings.map((b) => b.id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#C9A96E] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <BookingsFilters
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters({ date: '', status: 'all', vehicle: 'all' })}
      />

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <div className="hidden md:grid grid-cols-5 gap-4 px-6 py-4 bg-white/[0.05] border-b border-white/10">
          <div className="text-white/60 text-sm font-medium">Cliente</div>
          <div className="text-white/60 text-sm font-medium">Trajeto</div>
          <div className="text-white/60 text-sm font-medium">Data & Hora</div>
          <div className="text-white/60 text-sm font-medium">Valor</div>
          <div className="text-white/60 text-sm font-medium">Status</div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-white/40">Nenhuma reserva encontrada</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <BookingRow
              key={booking.id}
              booking={booking}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <div className="mt-4 text-white/40 text-sm">
        Total: {filteredBookings.length} reserva{filteredBookings.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}