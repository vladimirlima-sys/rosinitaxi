import React from 'react';
import { TrendingUp, Clock, Calendar, AlertCircle } from 'lucide-react';

function getPricingFactors(date, time) {
  const factors = [];
  let multiplier = 1.0;

  if (!date || !time) return { multiplier, factors };

  const dateObj = new Date(`${date}T${time}`);
  const hour = dateObj.getHours();
  const dow = dateObj.getDay(); // 0=Sun, 6=Sat

  // Weekend surcharge
  if (dow === 0 || dow === 6) {
    multiplier += 0.10;
    factors.push({ label: 'Weekend', icon: Calendar, color: 'text-orange-400', value: '+10%' });
  }

  // Night/early morning
  if (hour >= 22 || hour < 6) {
    multiplier += 0.20;
    factors.push({ label: 'Tarif nuit (22h–6h)', icon: Clock, color: 'text-blue-400', value: '+20%' });
  } else if (hour >= 6 && hour < 8) {
    // Early morning peak
    multiplier += 0.10;
    factors.push({ label: 'Pointe matin (6h–8h)', icon: TrendingUp, color: 'text-yellow-400', value: '+10%' });
  } else if (hour >= 17 && hour < 20) {
    // Evening peak
    multiplier += 0.15;
    factors.push({ label: 'Heure de pointe (17h–20h)', icon: TrendingUp, color: 'text-yellow-400', value: '+15%' });
  }

  // Public holiday approximation: Dec 25, Jan 1
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  if ((month === 12 && day === 25) || (month === 1 && day === 1) || (month === 8 && day === 1)) {
    multiplier += 0.25;
    factors.push({ label: 'Jour férié', icon: AlertCircle, color: 'text-red-400', value: '+25%' });
  }

  return { multiplier: Math.round(multiplier * 100) / 100, factors };
}

export default function PricingBreakdown({ date, time, basePrice, vehicleType, onPriceChange }) {
  const { multiplier, factors } = getPricingFactors(date, time);
  const dynamicPrice = basePrice ? (parseFloat(basePrice) * multiplier).toFixed(2) : null;

  React.useEffect(() => {
    if (onPriceChange && dynamicPrice) {
      onPriceChange(dynamicPrice, multiplier);
    }
  }, [dynamicPrice, multiplier]);

  if (!basePrice) return null;

  const hasModifiers = factors.length > 0;

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-[#C9A96E]/20 p-5 space-y-3">
      {/* Base price */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-white/40">Prix de base</span>
        <span className="text-white">CHF {parseFloat(basePrice).toFixed(2)}</span>
      </div>

      {/* Dynamic factors */}
      {hasModifiers && factors.map((f, i) => {
        const Icon = f.icon;
        return (
          <div key={i} className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2 text-white/40">
              <Icon className={`w-3.5 h-3.5 ${f.color}`} />
              {f.label}
            </span>
            <span className={f.color}>{f.value}</span>
          </div>
        );
      })}

      {hasModifiers && <div className="w-full h-[1px] bg-white/10" />}

      {/* Final price */}
      <div className="flex justify-between items-center">
        <span className="text-white font-medium">Total</span>
        <div className="text-right">
          <span className="text-[#C9A96E] text-2xl font-semibold">CHF {dynamicPrice}</span>
          {hasModifiers && (
            <p className="text-white/20 text-xs mt-0.5 line-through">CHF {parseFloat(basePrice).toFixed(2)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export { getPricingFactors };