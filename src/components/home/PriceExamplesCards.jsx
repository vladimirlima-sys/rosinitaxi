import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

const ROUTES = [
  { from: 'Montreux', to: 'Aéroport Genève', km: 85, isAirport: true },
  { from: 'Lausanne', to: 'Aéroport Genève', km: 60, isAirport: true },
  { from: 'Verbier', to: 'Zurich', km: 230, isAirport: false },
  { from: 'Vevey', to: 'Zurich', km: 180, isAirport: false },
];

function calcPrice(km, pricePerKm, baseFare, airportFee, isAirport) {
  let total = km * pricePerKm;
  if (km <= 30) total += baseFare || 0;
  if (isAirport && airportFee) total += airportFee;
  return total.toFixed(0);
}

export default function PriceExamplesCards({ priceSettings }) {
  const { lang } = useLang();
  const t = translations[lang] || translations.fr;
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setAnimating(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % ROUTES.length);
        setAnimating(false);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!priceSettings) return null;

  const { standard_price_per_km, comfort_price_per_km, base_fare, airport_fee } = priceSettings;
  const comfortPPK = comfort_price_per_km || standard_price_per_km * 1.3;

  const route = ROUTES[current];
  const stdPrice = calcPrice(route.km, standard_price_per_km, base_fare, airport_fee, route.isAirport);
  const comfPrice = calcPrice(route.km, comfortPPK, base_fare, airport_fee, route.isAirport);

  return (
    <div className="w-full max-w-md mt-4 mb-2">
      <p className="text-black/50 text-xs uppercase tracking-[0.2em] text-center mb-3">{t.priceExamples}</p>

      <div className="overflow-hidden">
        <div
          style={{
            transform: animating ? `translateX(${direction > 0 ? '-100%' : '100%'})` : 'translateX(0)',
            opacity: animating ? 0 : 1,
            transition: 'transform 0.3s ease, opacity 0.3s ease',
          }}
        >
          <div className="bg-black rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#F5C300] mt-0.5 shrink-0" />
              <div>
                <p className="text-white text-base font-semibold leading-tight">{route.from}</p>
                <p className="text-white/40 text-sm leading-tight mt-0.5">→ {route.to}</p>
                <p className="text-white/30 text-sm mt-1">{route.km} km</p>
              </div>
            </div>
            <div className="border-t border-white/10 pt-3 flex justify-between items-end">
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-wider">Standard</p>
                <p className="text-[#F5C300] text-xl font-bold">CHF {stdPrice}</p>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-[10px] uppercase tracking-wider">Comfort</p>
                <p className="text-white/80 text-xl font-bold">CHF {comfPrice}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {ROUTES.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'bg-black w-4' : 'bg-black/20 w-1.5'}`}
          />
        ))}
      </div>

      <p className="text-black/30 text-[10px] text-center mt-2">{t.priceExamplesNote}</p>
    </div>
  );
}