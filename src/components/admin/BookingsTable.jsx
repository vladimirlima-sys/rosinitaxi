import React, { useEffect, useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import BookingRow from './BookingRow';
import BookingsFilters from './BookingsFilters';

export default function BookingsTable() {
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    date: '',
    status: 'all',
    vehicle: 'all',
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [deletingMultiple, setDeletingMultiple] = useState(false);
  const [seenIds, setSeenIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('seen_booking_ids') || '[]')); } catch { return new Set(); }
  });
  
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const [data, driversData] = await Promise.all([
          base44.entities.Booking.list('-created_date', 100),
          base44.entities.Driver.list(),
        ]);
        setBookings(data);
        setDrivers(driversData);
      } catch (error) {
        toast.error('Erro ao carregar reservas');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();

    // Subscribe to real-time updates
    const unsubscribe = base44.entities.Booking.subscribe((event) => {
      setBookings(prev => {
        if (event.type === 'create') {
          return [event.data, ...prev].slice(0, 100);
        } else if (event.type === 'update') {
          return prev.map(b => b.id === event.id ? event.data : b);
        } else if (event.type === 'delete') {
          return prev.filter(b => b.id !== event.id);
        }
        return prev;
      });
    });

    return unsubscribe;
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Apply filters
      if (filters.date && booking.departure_date !== filters.date) return false;
      if (filters.status !== 'all' && booking.payment_status !== filters.status) return false;
      if (filters.vehicle !== 'all' && booking.vehicle_type !== filters.vehicle) return false;
      
      // Apply search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          booking.client_name?.toLowerCase().includes(query) ||
          booking.client_email?.toLowerCase().includes(query) ||
          booking.client_phone?.includes(query) ||
          booking.id.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [bookings, filters, searchQuery]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBookings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBookings, currentPage]);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await base44.entities.Booking.update(bookingId, { payment_status: newStatus });
      const updatedBookings = bookings.map((b) => (b.id === bookingId ? { ...b, payment_status: newStatus } : b));
      setBookings(updatedBookings);
      toast.success('Status atualizado com sucesso');

      // Send WhatsApp notification when booking is cancelled
      if (newStatus === 'cancelled') {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
          try {
            await base44.functions.invoke('sendWhatsApp', {
              type: 'cancelled',
              booking: {
                client_name: booking.client_name,
                client_phone: booking.client_phone,
                departure_point: booking.departure_point,
                arrival_point: booking.arrival_point,
                departure_date: booking.departure_date,
                departure_time: booking.departure_time,
                vehicle_type: booking.vehicle_type,
                total_price: booking.total_price,
              }
            });
          } catch (waErr) {
            console.error('WhatsApp cancellation notification failed:', waErr);
          }
        }
      }
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

  const markAsSeen = (id) => {
    setSeenIds(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('seen_booking_ids', JSON.stringify([...next]));
      return next;
    });
  };

  const handleAssignDriver = async (bookingId, driver) => {
    const update = driver
      ? { driver_id: driver.id, driver_name: driver.name }
      : { driver_id: '', driver_name: '' };
    await base44.entities.Booking.update(bookingId, update);
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...update } : b));
    toast.success(driver ? `Motorista ${driver.name} atribuído` : 'Motorista removido');
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedBookings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedBookings.map((b) => b.id));
    }
  };

  const handleResetFilters = () => {
    setFilters({ date: '', status: 'all', vehicle: 'all' });
    setSearchQuery('');
    setCurrentPage(1);
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
        onReset={handleResetFilters}
      />

      {/* Search Bar */}
      <div className="mb-4 relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-white/40" />
        <input
          type="text"
          placeholder="Buscar por cliente, email, telefone ou ID..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#C9A96E]/50"
        />
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between mb-3 px-4 py-3 bg-red-950/40 border border-red-500/30 rounded-xl">
          <span className="text-red-300 text-sm">{selectedIds.length} reserva(s) selecionada(s)</span>
          <button
            onClick={handleDeleteSelected}
            disabled={deletingMultiple}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {deletingMultiple ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Deletar selecionadas
          </button>
        </div>
      )}

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <div className="hidden md:grid grid-cols-5 gap-4 px-6 py-4 bg-white/[0.05] border-b border-white/10">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={paginatedBookings.length > 0 && selectedIds.length === paginatedBookings.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 accent-[#C9A96E] cursor-pointer"
            />
            <span className="text-white/60 text-sm font-medium">Cliente</span>
          </div>
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
          paginatedBookings.map((booking) => (
            <BookingRow
            key={booking.id}
            booking={booking}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onAssignDriver={handleAssignDriver}
            drivers={drivers}
            selected={selectedIds.includes(booking.id)}
            onToggleSelect={toggleSelect}
            isNew={!seenIds.has(booking.id)}
            onSeen={markAsSeen}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-white/40 text-sm">
            Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)} de {filteredBookings.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-white text-sm hover:bg-white/[0.05] disabled:opacity-50 transition-colors"
            >
              Anterior
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentPage === page
                      ? 'bg-[#C9A96E] text-black'
                      : 'bg-white/[0.03] border border-white/10 text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-white text-sm hover:bg-white/[0.05] disabled:opacity-50 transition-colors"
            >
              Próximo
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 text-white/40 text-sm">
        Total: {filteredBookings.length} reserva{filteredBookings.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}