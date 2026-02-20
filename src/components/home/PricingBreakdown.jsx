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
  const isNightSurcharge = 
    dayOfWeek === priceSettings.night_surcharge_day &&
    hour >= priceSettings.night_surcharge_start_hour &&
    hour < priceSettings.night_surcharge_end_hour;

  // Check if airport fee applies
  const isAirportTransfer = (
    departure_point.toLowerCase().includes('aeroporto') ||
    departure_point.toLowerCase().includes('aéroport') ||
    departure_point.toLowerCase().includes('airport') ||
    arrival_point.toLowerCase().includes('aeroporto') ||
    arrival_point.toLowerCase().includes('aéroport') ||
    arrival_point.toLowerCase().includes('airport')
  );

  // Calculate price breakdown
  let pricePerKm = vehicleType === 'economic' 
    ? priceSettings.standard_price_per_km 
    : priceSettings.standard_price_per_km + 0.60;

  const distancePrice = (distance_km * pricePerKm).toFixed(2);
  const baseFareAmount = priceSettings.base_fare || 0;
  
  let nightSurchargeAmount = 0;
  if (isNightSurcharge && priceSettings.night_surcharge_percentage > 0) {
    nightSurchargeAmount = ((parseFloat(distancePrice) + baseFareAmount) * priceSettings.night_surcharge_percentage / 100).toFixed(2);
  }

  let airportFeeAmount = 0;
  if (isAirportTransfer && priceSettings.airport_fee) {
    airportFeeAmount = priceSettings.airport_fee;
  }

  const totalPrice = (
    parseFloat(distancePrice) + 
    baseFareAmount + 
    parseFloat(nightSurchargeAmount) + 
    airportFeeAmount
  ).toFixed(2);

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-[#C9A96E]/20 p-5 space-y-3">
      {/* Distance-based price */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-white/40">Preço por km ({distance_km}km × CHF {pricePerKm})</span>
        <span className="text-white">CHF {distancePrice}</span>
      </div>

      {/* Base fare */}
      {baseFareAmount > 0 && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/40">Taxa base</span>
          <span className="text-white">CHF {baseFareAmount.toFixed(2)}</span>
        </div>
      )}

      {/* Night surcharge */}
      {isNightSurcharge && parseFloat(nightSurchargeAmount) > 0 && (
        <div className="flex justify-between items-center text-sm">
          <span className="flex items-center gap-2 text-white/40">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            Adicional Noturno ({priceSettings.night_surcharge_percentage}%)
          </span>
          <span className="text-blue-400">+CHF {nightSurchargeAmount}</span>
        </div>
      )}

      {/* Airport fee */}
      {isAirportTransfer && airportFeeAmount > 0 && (
        <div className="flex justify-between items-center text-sm">
          <span className="flex items-center gap-2 text-white/40">
            <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
            Taxa de Aeroporto
          </span>
          <span className="text-orange-400">+CHF {airportFeeAmount.toFixed(2)}</span>
        </div>
      )}

      {/* Divider */}
      <div className="w-full h-[1px] bg-white/10" />

      {/* Total price */}
      <div className="flex justify-between items-center">
        <span className="text-white font-medium">Total</span>
        <span className="text-[#C9A96E] text-2xl font-semibold">CHF {totalPrice}</span>
      </div>
    </div>
  );
}