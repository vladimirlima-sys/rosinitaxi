import { MapPin, CalendarDays, AlertCircle } from 'lucide-react';

export default function NextTripHighlight({ booking, t }) {
  const tripTime = new Date(`${booking.departure_date}T${booking.departure_time}`);
  const now = new Date();
  const hoursUntil = Math.floor((tripTime - now) / (1000 * 60 * 60));

  return (
    <div className="bg-gradient-to-r from-[#F5C300]/20 to-[#F5C300]/5 border border-[#F5C300]/40 rounded-2xl p-6 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#F5C300] mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[#F5C300] font-bold text-sm mb-3">Próxima viagem: em {hoursUntil}h</p>

          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-white font-medium truncate">{booking.departure_point}</p>
                <p className="text-white/40 text-xs">→</p>
                <p className="text-white font-medium truncate">{booking.arrival_point}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-white/60 text-xs">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>{booking.departure_date} às {booking.departure_time}</span>
            </div>
          </div>

          {hoursUntil < 24 && hoursUntil >= 0 && (
            <p className="text-yellow-400 text-xs mt-3">⚠️ Confirme presença 30 min antes</p>
          )}
        </div>
      </div>
    </div>
  );
}