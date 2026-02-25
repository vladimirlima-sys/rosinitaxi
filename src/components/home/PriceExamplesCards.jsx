import React from 'react';
import { MapPin } from 'lucide-react';

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
  if (!priceSettings) return null;

  const { standard_price_per_km, comfort_price_per_km, base_fare, airport_fee } = priceSettings;
  const comfortPPK = comfort_price_per_km || standard_price_per_km * 1.3;

  return (
    <div className="w-full max-w-md mt-4 mb-2">
      <p className="text-black/50 text-xs uppercase tracking-[0.2em] text-center mb-3">Exemples de prix</p>
      <div className="grid grid-cols-2 gap-2">
        {ROUTES.map((route, i) => {
          const stdPrice = calcPrice(route.km, standard_price_per_km, base_fare, airport_fee, route.isAirport);
          const comfPrice = calcPrice(route.km, comfortPPK, base_fare, airport_fee, route.isAirport);
          return (
            <div key={i} className="bg-black rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3 h-3 text-[#F5C300] mt-0.5 shrink-0" />
                <div>
                  <p className="text-white text-xs font-semibold leading-tight">{route.from}</p>
                  <p className="text-white/40 text-[10px] leading-tight">→ {route.to}</p>
                  <p className="text-white/30 text-[10px] mt-0.5">{route.km} km</p>
                </div>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between items-end">
                <div>
                  <p className="text-white/40 text-[9px] uppercase tracking-wider">Standard</p>
                  <p className="text-[#F5C300] text-sm font-bold">CHF {stdPrice}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-[9px] uppercase tracking-wider">Comfort</p>
                  <p className="text-white/80 text-sm font-bold">CHF {comfPrice}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-black/30 text-[10px] text-center mt-2">* Prix indicatifs, hors péages</p>
    </div>
  );
}