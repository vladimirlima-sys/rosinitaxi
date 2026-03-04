import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { MapPin, Phone, Clock, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { createPageUrl } from '@/utils';
import TrackingMap from '@/components/ridetracking/TrackingMap';
import RideTimeline from '@/components/ridetracking/RideTimeline';
import DriverCard from '@/components/ridetracking/DriverCard';
import SupportContact from '@/components/ridetracking/SupportContact';

export default function RideTracking() {
  const [booking, setBooking] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('id');

    if (!bookingId) {
      setError('Nenhuma reserva encontrada');
      setLoading(false);
      return;
    }

    loadBooking(bookingId);

    // Auto-refresh every 5 seconds
    const interval = setInterval(() => loadBooking(bookingId), 5000);
    
    return () => {
      clearInterval(interval);
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  const loadBooking = async (bookingId) => {
    try {
      const bookings = await base44.entities.Booking.list('-created_date', 200);
      const found = bookings.find(b => b.id === bookingId);
      
      if (!found) {
        setError('Reserva não encontrada');
        setLoading(false);
        return;
      }

      setBooking(found);

      if (found.driver_id) {
        const drivers = await base44.entities.Driver.list();
        const foundDriver = drivers.find(d => d.id === found.driver_id);
        setDriver(foundDriver);
      }

      setLoading(false);

      // Subscribe to real-time updates
      if (!unsubscribeRef.current) {
        unsubscribeRef.current = base44.entities.Booking.subscribe((event) => {
          if (event.id === bookingId && event.type === 'update') {
            setBooking(event.data);
          }
        });
      }
    } catch (err) {
      console.error('Error loading booking:', err);
      setError('Erro ao carregar os dados');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#F5C300]" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-white text-center mb-6">{error}</p>
        <a
          href={createPageUrl('Home')}
          className="flex items-center gap-2 text-[#F5C300] hover:text-[#e6b800] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Home
        </a>
      </div>
    );
  }

  const statusColors = {
    pending: 'text-yellow-400 bg-yellow-400/10',
    paid: 'text-green-400 bg-green-400/10',
    cancelled: 'text-red-400 bg-red-400/10',
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a
            href={createPageUrl('Home')}
            className="flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors text-sm mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </a>
          <h1 className="text-3xl md:text-4xl font-light text-white">Rastreamento de Corrida</h1>
        </div>

        {/* Map */}
        <div className="mb-8">
          <TrackingMap booking={booking} loading={loading} error={error} />
        </div>

        {/* Timeline */}
        {booking && !error && (
          <div className="mb-8">
            <RideTimeline booking={booking} />
          </div>
        )}

        {/* Main Info Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-8">
          {/* Status */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Cliente</p>
              <p className="text-white text-lg font-medium">{booking?.client_name}</p>
            </div>
            <div className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusColors[booking?.payment_status] || 'text-white/40'}`}>
              {booking?.payment_status === 'paid' ? 'Confirmada' : 'Pendente'}
            </div>
          </div>

          {/* Route Info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#C9A96E] mt-1 shrink-0" />
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider">Partida</p>
                <p className="text-white">{booking?.departure_point}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-white/60 mt-1 shrink-0" />
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider">Destino</p>
                <p className="text-white">{booking?.arrival_point}</p>
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10">
            <div>
              <p className="text-white/50 text-xs mb-1">Data</p>
              <p className="text-white text-sm font-medium">{booking?.departure_date}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs mb-1">Hora</p>
              <p className="text-white text-sm font-medium">{booking?.departure_time}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs mb-1">Distância</p>
              <p className="text-white text-sm font-medium">{booking?.distance_km} km</p>
            </div>
            <div>
              <p className="text-white/50 text-xs mb-1">Total</p>
              <p className="text-[#C9A96E] text-sm font-bold">CHF {booking?.total_price?.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Driver Card */}
        {driver && (
          <div className="mb-8">
            <DriverCard driver={driver} booking={booking} />
          </div>
        )}

        {/* Support Contact */}
        <div className="mb-8">
          <SupportContact />
        </div>

        {/* Info Footer */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-white/50 text-sm">Rastreamento em tempo real · Rosini Transfert</p>
        </div>
      </div>
    </div>
  );
}