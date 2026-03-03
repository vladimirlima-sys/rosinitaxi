import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { User, ChevronDown } from 'lucide-react';

const LABELS = {
  fr: { title: 'Chauffeur préféré (optionnel)', none: 'Aucune préférence', selected: 'Sélectionné', unavailable: 'Indisponible' },
  pt: { title: 'Motorista preferido (opcional)', none: 'Sem preferência', selected: 'Selecionado', unavailable: 'Indisponível' },
  en: { title: 'Preferred driver (optional)', none: 'No preference', selected: 'Selected', unavailable: 'Unavailable' },
  de: { title: 'Bevorzugter Fahrer (optional)', none: 'Keine Präferenz', selected: 'Ausgewählt', unavailable: 'Nicht verfügbar' },
  it: { title: 'Autista preferito (opzionale)', none: 'Nessuna preferenza', selected: 'Selezionato', unavailable: 'Non disponibile' },
  es: { title: 'Conductor preferido (opcional)', none: 'Sin preferencia', selected: 'Seleccionado', unavailable: 'No disponible' },
  nl: { title: 'Voorkeurschauffeur (optioneel)', none: 'Geen voorkeur', selected: 'Geselecteerd', unavailable: 'Niet beschikbaar' },
};

/**
 * Returns true if a driver is busy at the given departure datetime,
 * based on their existing bookings. Considers the trip duration (distance_km / 50km/h average).
 */
function isDriverBusy(driverId, departureDate, departureTime, bookings) {
  if (!departureDate || !departureTime) return false;

  const [h, m] = departureTime.split(':').map(Number);
  const requestedStart = new Date(`${departureDate}T${departureTime}:00`).getTime();

  const driverBookings = bookings.filter(b =>
    b.driver_id === driverId &&
    b.departure_date === departureDate &&
    !['cancelled', 'refunded'].includes(b.payment_status)
  );

  for (const b of driverBookings) {
    if (!b.departure_time) continue;
    const bookingStart = new Date(`${b.departure_date}T${b.departure_time}:00`).getTime();
    // Estimate trip duration: distance_km / 50 km/h in ms, min 30 min, max 4 hours
    const estimatedMinutes = b.distance_km ? Math.min(Math.max(Math.ceil(b.distance_km / 50 * 60), 30), 240) : 60;
    const bookingEnd = bookingStart + estimatedMinutes * 60 * 1000;

    // Add 30-min buffer after trip ends
    const buffer = 30 * 60 * 1000;

    if (requestedStart >= bookingStart && requestedStart < (bookingEnd + buffer)) {
      return true;
    }
  }
  return false;
}

export default function PreferredDriverSelector({ lang = 'fr', selectedDriverId, onSelect, departureDate, departureTime }) {
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [open, setOpen] = useState(false);
  const l = LABELS[lang] || LABELS.fr;

  useEffect(() => {
    base44.entities.Driver.filter({ status: 'active' }).then(data => {
      setDrivers([...data].sort((a, b) => a.name.localeCompare(b.name)));
    }).catch(() => {});

    // Load bookings to check driver availability
    base44.entities.Booking.list('-departure_date', 200).then(data => {
      setBookings(data);
    }).catch(() => {});
  }, []);

  if (!drivers.length) return null;

  const items = [null, ...drivers];
  const selectedItem = selectedDriverId === null || selectedDriverId === undefined
    ? null
    : drivers.find(d => d.id === selectedDriverId) || null;

  const selectedLabel = selectedItem ? selectedItem.name : l.none;

  return (
    <div>
      <p className="text-white/60 text-xs uppercase tracking-wider mb-3">{l.title}</p>

      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-3 rounded-lg border border-white/20 hover:border-white/40 transition-all"
      >
        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white/60" />
        </div>
        <span className={`flex-1 text-left text-sm ${selectedItem === null && selectedDriverId === undefined ? 'text-white/50 italic' : 'text-white'}`}>
          {selectedLabel}
        </span>
        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown list */}
      {open && (
        <div className="mt-2 flex flex-col gap-1">
          {items.map((item, i) => {
            const busy = item ? isDriverBusy(item.id, departureDate, departureTime, bookings) : false;
            return (
              <button
                key={i}
                onClick={() => {
                  if (!busy) {
                    onSelect(item);
                    setOpen(false);
                  }
                }}
                disabled={busy}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all w-full text-left ${
                  busy
                    ? 'border-white/10 opacity-40 cursor-not-allowed'
                    : (item === null ? (selectedDriverId === null || selectedDriverId === undefined) : item.id === selectedDriverId)
                      ? 'border-[#F5C300] bg-[#F5C300]/10'
                      : 'border-white/20 hover:border-white/40'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${item === null ? 'text-white/50 italic' : 'text-white'}`}>
                    {item === null ? l.none : item.name}
                  </p>
                  {item !== null && (
                    <p className="text-white/40 text-xs truncate">
                      {busy ? `⚠ ${l.unavailable}` : (item.vehicle || '')}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}