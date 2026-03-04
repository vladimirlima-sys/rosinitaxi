import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, User, GripVertical, ExternalLink } from 'lucide-react';
import { createPageUrl } from '@/utils';

const STATUS_STYLES = {
  pending: { border: 'border-l-yellow-400', bg: 'bg-yellow-400/10', dot: 'bg-yellow-400', label: 'En attente' },
  paid: { border: 'border-l-green-400', bg: 'bg-green-400/10', dot: 'bg-green-400', label: 'Payé' },
  cancelled: { border: 'border-l-red-400', bg: 'bg-red-400/10', dot: 'bg-red-400', label: 'Annulé' },
  refunded: { border: 'border-l-gray-400', bg: 'bg-gray-400/10', dot: 'bg-gray-400', label: 'Remboursé' },
};

export default function CalendarBookingCard({ booking, drivers, onAssignDriver, isDragging }) {
  const [showDriverMenu, setShowDriverMenu] = useState(false);
  const style = STATUS_STYLES[booking.payment_status] || STATUS_STYLES.pending;
  const assignedDriver = drivers.find(d => d.id === booking.driver_id);

  const handleDriverSelect = async (driver) => {
    setShowDriverMenu(false);
    await onAssignDriver(booking.id, driver);
  };

  return (
    <div
      className={`relative rounded-lg border-l-4 ${style.border} ${style.bg} p-2 text-xs cursor-grab select-none transition-shadow ${isDragging ? 'shadow-2xl opacity-90 rotate-1' : 'shadow-sm'}`}
    >
      {/* Time + status */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-white font-bold">{booking.departure_time || '—:——'}</span>
        <div className={`w-2 h-2 rounded-full ${style.dot}`} />
      </div>

      {/* Client */}
      <p className="text-white/90 font-medium truncate">{booking.client_name}</p>

      {/* Route */}
      <p className="text-white/50 truncate">
        {booking.departure_point?.split(',')[0]} → {booking.arrival_point?.split(',')[0]}
      </p>

      {/* Driver */}
      <div className="mt-1.5 relative">
        <button
          onClick={(e) => { e.stopPropagation(); setShowDriverMenu(v => !v); }}
          className="flex items-center gap-1 text-white/50 hover:text-white/80 transition-colors w-full"
        >
          <User className="w-3 h-3 flex-shrink-0" />
          <span className="truncate flex-1 text-left">{assignedDriver?.name || 'Non attribué'}</span>
          <ChevronDown className="w-3 h-3 flex-shrink-0" />
        </button>

        {showDriverMenu && (
          <div className="absolute top-full left-0 z-50 mt-1 bg-[#1a1a1a] border border-white/20 rounded-lg shadow-xl min-w-[140px] max-h-48 overflow-y-auto">
            <button
              onClick={() => handleDriverSelect(null)}
              className="w-full text-left px-3 py-2 text-xs text-white/50 hover:bg-white/10 transition-colors"
            >
              Non attribué
            </button>
            {drivers.filter(d => d.status === 'active').map(d => (
              <button
                key={d.id}
                onClick={() => handleDriverSelect(d)}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-white/10 transition-colors ${d.id === booking.driver_id ? 'text-[#F5C300]' : 'text-white'}`}
              >
                {d.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CHF */}
      {booking.total_price && (
        <p className="text-white/30 text-right mt-1">CHF {booking.total_price}</p>
      )}
    </div>
  );
}