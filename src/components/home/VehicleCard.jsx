import React from 'react';
import { Users, Check, Car } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function VehicleCard({ type, selected, onSelect, distance, pricePerKm, baseFare }) {
  const { lang } = useLang();
  const t = translations[lang];
  const isEconomic = type === 'economic';

  const config = isEconomic ? {
    name: 'STANDARD',
    capacity: 4,
    pricePerKm: pricePerKm || 2.35,
    image: 'https://images.unsplash.com/photo-1533473359331-35a64b29e200?w=600&q=80',
    features: t.vehicleFeatures.economic
  } : {
    name: t.comfort,
    capacity: 4,
    pricePerKm: pricePerKm || 2.95,
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&q=80',
    features: t.vehicleFeatures.comfort
  };

  // Não cobrar tarifa de base para viagens acima de 30 km
  const baseFareToUse = distance > 30 ? 0 : (baseFare || 0);
  const totalPrice = distance > 0 ? (distance * config.pricePerKm + baseFareToUse).toFixed(2) : null;

  return (
    <div
      onClick={() => onSelect(type)} className="bg-zinc-900 p-6 rounded-2xl relative cursor-pointer border transition-all duration-500 border-[#C9A96E] shadow-[0_0_30px_rgba(201,169,110,0.1)]">







      {selected &&
      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#C9A96E] flex items-center justify-center">
          <Check className="w-3 h-3 text-[#0A0A0A]" />
        </div>
      }

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5 text-[#C9A96E]" />
          <h3 className="text-white text-lg font-medium">{config.name}</h3>
        </div>
        <div className="flex items-center gap-1.5 text-white/50">
          <Users className="w-3.5 h-3.5" />
          <span className="text-xs">{config.capacity} {t.persons}</span>
        </div>
      </div>

      <div className="mb-3">
        {totalPrice ?
        <div className="flex items-baseline gap-1">
            <span className="text-[#C9A96E] text-xl font-semibold">CHF {totalPrice}</span>
          </div> :

        <p className="text-white/30 text-xs italic">{t.estimatedPrice}...</p>
        }
      </div>

      <div className="space-y-1.5">
        {config.features.map((f, i) =>
        <div key={i} className="flex items-center gap-2">
            <div className="w-0.5 h-0.5 rounded-full bg-[#C9A96E]" />
            <span className="text-white/40 text-xs">{f}</span>
          </div>
        )}
      </div>
    </div>);

}