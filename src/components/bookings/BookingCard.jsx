import React from 'react';
import { MapPin, Calendar, Clock, DollarSign, Edit2, Trash2, AlertCircle, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function BookingCard({ booking, onEdit, onCancel }) {
  const getStatusDisplay = (status) => {
    const statusMap = {
      pending: { label: 'En attente', icon: AlertCircle, color: 'text-yellow-500 bg-yellow-500/10' },
      paid: { label: 'Confirmé', icon: Check, color: 'text-green-500 bg-green-500/10' },
      cancelled: { label: 'Annulé', icon: Trash2, color: 'text-red-500 bg-red-500/10' },
    };
    return statusMap[status] || statusMap.pending;
  };

  const status = getStatusDisplay(booking.payment_status);
  const StatusIcon = status.icon;

  const isUpcoming = new Date(booking.departure_date) > new Date();
  const canModify = isUpcoming && booking.payment_status === 'paid';

  return (
    <div className="p-6 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all">
      {/* Status and header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${status.color}`}>
            <StatusIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider">Statut</p>
            <p className={`text-sm font-medium ${status.color.split(' ')[0]}`}>{status.label}</p>
          </div>
        </div>
        {booking.payment_status !== 'cancelled' && (
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isUpcoming
              ? 'bg-[#C9A96E]/10 text-[#C9A96E]'
              : 'bg-white/5 text-white/40'
          }`}>
            {isUpcoming ? 'À venir' : 'Passé'}
          </div>
        )}
      </div>

      {/* Journey details */}
      <div className="space-y-3 mb-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <MapPin className="w-4 h-4 text-[#C9A96E]/50 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-white/40 text-xs">Trajet</p>
            <p className="text-white text-sm truncate">{booking.departure_point} → {booking.arrival_point}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-[#C9A96E]/50 flex-shrink-0" />
          <div>
            <p className="text-white/40 text-xs">Date & Heure</p>
            <p className="text-white text-sm">
              {format(new Date(booking.departure_date), 'EEEE d MMMM yyyy', { locale: fr })} à {booking.departure_time}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div>
            <p className="text-white/40 text-xs">Véhicule</p>
            <p className="text-white text-sm">
              {booking.vehicle_type === 'economic' ? 'Économique' : 'Confort'} ({booking.passengers} {booking.passengers > 1 ? 'passagers' : 'passager'})
            </p>
          </div>
          {booking.distance_km && (
            <div>
              <p className="text-white/40 text-xs">Distance</p>
              <p className="text-white text-sm">{booking.distance_km} km</p>
            </div>
          )}
        </div>
      </div>

      {/* Cost summary */}
      <div className="mb-4 p-3 rounded-lg bg-white/[0.02]">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-4 h-4 text-[#C9A96E]" />
          <p className="text-white/40 text-xs uppercase tracking-wider">Total</p>
        </div>
        <p className="text-[#C9A96E] text-2xl font-light">CHF {booking.total_price?.toFixed(2)}</p>
      </div>

      {/* Notes */}
      {booking.notes && (
        <div className="mb-4 p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Notes</p>
          <p className="text-white/60 text-sm">{booking.notes}</p>
        </div>
      )}

      {/* Driver preference */}
      {booking.driver_preference && (
        <div className="mb-4 p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Préférence chauffeur</p>
          <p className="text-white/60 text-sm">{booking.driver_preference}</p>
        </div>
      )}

      {/* Actions */}
      {canModify && (
        <div className="flex gap-3">
          <Button
            onClick={onEdit}
            className="flex-1 bg-[#C9A96E]/10 hover:bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/30 font-medium h-10"
          >
            <Edit2 className="w-4 h-4 mr-2" /> Modifier
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium h-10"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Annuler
          </Button>
        </div>
      )}
      {booking.payment_status === 'cancelled' && (
        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-center">
          <p className="text-red-400/70 text-xs">Cette réservation a été annulée</p>
        </div>
      )}
    </div>
  );
}