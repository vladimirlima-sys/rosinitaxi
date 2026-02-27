import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2, Trash2, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BookingStatusBadge from './BookingStatusBadge';
import BookingDetailsModal from './BookingDetailsModal';
import AssignDriverModal from '@/components/drivers/AssignDriverModal';

export default function BookingRow({ booking, onStatusChange, onDelete, onAssignDriver, drivers = [], selected, onToggleSelect }) {
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="border-b border-white/10 hover:bg-white/[0.02] transition-colors">
        <div
          className="grid grid-cols-5 gap-4 px-6 py-4 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => { e.stopPropagation(); onToggleSelect(booking.id); }}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 accent-[#C9A96E] cursor-pointer flex-shrink-0"
            />
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-[#C9A96E]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/30" />
            )}
            <div>
              <p className="text-white font-medium text-sm">{booking.client_name}</p>
              <p className="text-white/40 text-xs">{booking.client_email}</p>
            </div>
          </div>

          <div className="text-sm">
            <p className="text-white">{booking.departure_point}</p>
            <p className="text-white/40 text-xs">→ {booking.arrival_point}</p>
          </div>

          <div className="text-sm">
            <p className="text-white">{booking.departure_date}</p>
            <p className="text-white/40 text-xs">{booking.departure_time}</p>
          </div>

          <div className="text-sm">
            <p className="text-white font-medium">CHF {booking.total_price?.toFixed(2)}</p>
            <p className="text-white/40 text-xs">{booking.distance_km} km</p>
          </div>

          <div className="flex items-center justify-between">
            <BookingStatusBadge status={booking.payment_status} />
          </div>
        </div>

        {expanded && (
          <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              <div>
                <p className="text-white/40 text-xs mb-1">Telefone</p>
                <p className="text-white">{booking.client_phone}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs mb-1">Passageiros</p>
                <p className="text-white">{booking.passengers}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs mb-1">Tipo de veículo</p>
                <p className="text-white capitalize">{booking.vehicle_type}</p>
              </div>
              {booking.flight_number && (
                <div>
                  <p className="text-white/40 text-xs mb-1">Voo</p>
                  <p className="text-white">{booking.flight_number}</p>
                </div>
              )}
            </div>

            {booking.notes && (
              <div className="mb-4">
                <p className="text-white/40 text-xs mb-1">Notas</p>
                <p className="text-white text-sm">{booking.notes}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-white/5">
              <Button
                onClick={() => setShowModal(true)}
                size="sm"
                className="bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A]"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Editar status
              </Button>
              <Button
                onClick={() => onDelete(booking.id)}
                size="sm"
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Deletar
              </Button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <BookingDetailsModal
          booking={booking}
          onStatusChange={(newStatus) => {
            onStatusChange(booking.id, newStatus);
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}