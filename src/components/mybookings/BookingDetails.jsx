import { useState } from 'react';
import { ChevronDown, Users, Gift, AlertCircle } from 'lucide-react';

const extraLabels = {
  fr: {
    baby_seat: 'Siège bébé',
    extra_luggage: 'Bagages supplémentaires',
    wheelchair_accessible: 'Accessible fauteuil roulant',
    pet_friendly: 'Animaux de compagnie',
  },
  pt: {
    baby_seat: 'Cadeira de bebé',
    extra_luggage: 'Bagagem extra',
    wheelchair_accessible: 'Acessível cadeira de rodas',
    pet_friendly: 'Amigável para animais',
  },
  en: {
    baby_seat: 'Baby seat',
    extra_luggage: 'Extra luggage',
    wheelchair_accessible: 'Wheelchair accessible',
    pet_friendly: 'Pet friendly',
  },
  de: {
    baby_seat: 'Kindersitz',
    extra_luggage: 'Zusätzliches Gepäck',
    wheelchair_accessible: 'Rollstuhlgerecht',
    pet_friendly: 'Haustierfreundlich',
  },
  it: {
    baby_seat: 'Seggiolino bambino',
    extra_luggage: 'Bagaglio extra',
    wheelchair_accessible: 'Accessibile in sedia a rotelle',
    pet_friendly: 'Animali ammessi',
  },
  es: {
    baby_seat: 'Asiento infantil',
    extra_luggage: 'Equipaje extra',
    wheelchair_accessible: 'Accesible para silla de ruedas',
    pet_friendly: 'Mascotas permitidas',
  },
  nl: {
    baby_seat: 'Babyzetel',
    extra_luggage: 'Extra bagage',
    wheelchair_accessible: 'Rolstoeltoegankelijk',
    pet_friendly: 'Huisdieren welkom',
  },
};

export default function BookingDetails({ booking, t, lang = 'fr' }) {
  const [expanded, setExpanded] = useState(false);
  const currentExtraLabels = extraLabels[lang] || extraLabels.fr;

  return (
    <div className="space-y-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left py-2.5 px-3 text-white text-xs font-medium hover:bg-white/10 transition-colors rounded-lg border border-white/10"
      >
        <span>{t.moreDetails}</span>
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