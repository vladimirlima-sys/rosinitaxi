import { useState } from 'react';
import { ChevronDown, Users, Gift, AlertCircle } from 'lucide-react';

const extraLabels = {
  baby_seat: 'Cadeira de bebé',
  extra_luggage: 'Bagagem extra',
  wheelchair_accessible: 'Acessível cadeira de rodas',
  pet_friendly: 'Amigável para animais',
};

export default function BookingDetails({ booking, t }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left py-2 text-white/60 text-xs hover:text-white transition-colors"
      >
        <span>Mais detalhes</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="bg-white/5 rounded-lg p-4 space-y-3 text-xs text-white/70">
          {booking.flight_number && (
            <div>
              <p className="text-white/50 mb-1">Voo</p>
              <p className="text-white">{booking.flight_number}</p>
            </div>
          )}

          {booking.passengers && (
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-[#F5C300]/60" />
              <span>{booking.passengers} {booking.passengers === 1 ? 'passageiro' : 'passageiros'}</span>
            </div>
          )}

          {booking.extras && booking.extras.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-white/50 mb-2">
                <Gift className="w-3.5 h-3.5" />
                <span>Extras</span>
              </div>
              <div className="space-y-1 ml-5">
                {booking.extras.map(extra => (
                  <p key={extra} className="text-white/60">{extraLabels[extra] || extra}</p>
                ))}
              </div>
            </div>
          )}

          {booking.special_notes && (
            <div>
              <div className="flex items-center gap-2 text-white/50 mb-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Notas</span>
              </div>
              <p className="text-white/60 ml-5">{booking.special_notes}</p>
            </div>
          )}

          {booking.distance_km && (
            <div>
              <p className="text-white/50 mb-1">Distância estimada</p>
              <p className="text-white">{booking.distance_km} km</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}