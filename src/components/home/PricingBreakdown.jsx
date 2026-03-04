import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function PricingBreakdown({
  date,
  time,
  distance_km,
  basePrice,
  vehicleType,
  priceSettings,
  departure_point,
  arrival_point
}) {
  const { lang } = useLang();
  const t = translations[lang];

  if (!priceSettings) return null;

  const dateObj = new Date(`${date}T${time}:00`);
  const dayOfWeek = dateObj.getDay();
  const hour = dateObj.getHours();

  // Check if night surcharge applies
  const nightSurchargeDays = priceSettings.night_surcharge_days || [];
  let isNightSurcharge = false;
  if (nightSurchargeDays.includes(dayOfWeek)) {
    if (priceSettings.night_surcharge_start_hour > priceSettings.night_surcharge_end_hour) {
      // Crosses midnight
      isNightSurcharge = hour >= priceSettings.night_surcharge_start_hour || hour < priceSettings.night_surcharge_end_hour;
    } else {
      // Normal range
      isNightSurcharge = hour >= priceSettings.night_surcharge_start_hour && hour < priceSettings.night_surcharge_end_hour;
    }
  }

  // Check if airport fee applies
  const isAirportTransfer =
  departure_point.toLowerCase().includes('aeroporto') ||
  departure_point.toLowerCase().includes('aéroport') ||
  departure_point.toLowerCase().includes('airport') ||
  arrival_point.toLowerCase().includes('aeroporto') ||
  arrival_point.toLowerCase().includes('aéroport') ||
  arrival_point.toLowerCase().includes('airport');

  // Check if Valais/Fribourg surcharge applies
  const isValaisFribourg = ['valais', 'fribourg', 'wallis', 'freiburg'].some(canton =>
    departure_point.toLowerCase().includes(canton)
  );

  // Calculate price breakdown
  const pricePerKm = priceSettings.standard_price_per_km;
  const distancePrice = (distance_km * pricePerKm).toFixed(2);
  // Não cobrar tarifa de base para viagens acima de 30 km
  const baseFareAmount = distance_km <= 30 ? (priceSettings.base_fare || 0) : 0;

  let nightSurchargeAmount = 0;
  if (isNightSurcharge && priceSettings.night_surcharge_percentage > 0) {
    nightSurchargeAmount = ((parseFloat(distancePrice) + baseFareAmount) * priceSettings.night_surcharge_percentage / 100).toFixed(2);
  }

  let airportFeeAmount = 0;
  if (isAirportTransfer && priceSettings.airport_fee) {
    airportFeeAmount = priceSettings.airport_fee;
  }

  let valaisFribourgAmount = 0;
  if (isValaisFribourg && priceSettings.valais_fribourg_surcharge_percentage > 0) {
    valaisFribourgAmount = ((parseFloat(distancePrice) + baseFareAmount) * priceSettings.valais_fribourg_surcharge_percentage / 100).toFixed(2);
  }

  const totalPrice = (
  parseFloat(distancePrice) +
  baseFareAmount +
  parseFloat(nightSurchargeAmount) +
  airportFeeAmount +
  parseFloat(valaisFribourgAmount)).
  toFixed(2);

  return (
    <div className="bg-zinc-950 p-5 rounded-2xl border border-[#C9A96E]/20 space-y-3">
      {/* Night surcharge */}
      {isNightSurcharge && parseFloat(nightSurchargeAmount) > 0 &&
      <div className="flex justify-between items-center text-sm">
          <span className="flex items-center gap-2 text-white/40">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            {t.nightSurcharge} ({priceSettings.night_surcharge_percentage}%)
          </span>
          <span className="text-blue-400">+CHF {nightSurchargeAmount}</span>
        </div>
      }

      {/* Airport fee */}
      {isAirportTransfer && airportFeeAmount > 0 &&
      <div className="flex justify-between items-center text-sm">
          <span className="flex items-center gap-2 text-white/40">
            <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
            {t.airportFee}
          </span>
          <span className="text-orange-400">+CHF {airportFeeAmount.toFixed(2)}</span>
        </div>
      }

      {/* Valais/Fribourg surcharge */}
      {isValaisFribourg && parseFloat(valaisFribourgAmount) > 0 &&
      <div className="flex justify-between items-center text-sm">
          <span className="flex items-center gap-2 text-white/40">
            <AlertCircle className="w-3.5 h-3.5 text-purple-400" />
            {t.regionSurcharge} ({priceSettings.valais_fribourg_surcharge_percentage}%)
          </span>
          <span className="text-purple-400">+CHF {valaisFribourgAmount}</span>
        </div>
      }

      {/* Divider */}
      <div className="w-full h-[1px] bg-white/10" />

      {/* Base fare */}
      {baseFareAmount > 0 &&
      <div className="flex justify-between items-center text-sm">
          <span className="text-white/40">{t.baseFare}</span>
          <span className="text-white/60">CHF {baseFareAmount.toFixed(2)}</span>
        </div>
      }

      {/* Distance */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-white/40">{distance_km}km × CHF {pricePerKm}</span>
        <span className="text-white/60">CHF {distancePrice}</span>
      </div>

      {/* Divider before total */}
      <div className="w-full h-[1px] bg-white/10" />

      {/* Total price */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-white font-medium">{t.total}</span>
        <span className="text-[#F5C300] text-2xl font-semibold">CHF {totalPrice}</span>
      </div>

      {/* Disclaimer */}
      <p className="text-white/30 text-xs italic">{t.noTollsIncluded}</p>
    </div>);

}