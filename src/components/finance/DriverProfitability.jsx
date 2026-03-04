import React, { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function DriverProfitability({ monthBookings, expenses, taxSettings }) {
  const profitability = useMemo(() => {
    const drivers = {};

    monthBookings.forEach(b => {
      if (!b.driver_id || !b.driver_name) return;
      if (!drivers[b.driver_id]) {
        drivers[b.driver_id] = { 
          id: b.driver_id,
          name: b.driver_name, 
          revenue: 0, 
          trips: 0,
          expenses: 0
        };
      }
      drivers[b.driver_id].revenue += b.total_price || 0;
      drivers[b.driver_id].trips += 1;
    });

    expenses.forEach(e => {
      // Assign expenses to drivers if needed (optional, based on your data model)
    });

    // Calculate profit per driver
    return Object.values(drivers)
      .map(d => {
        const taxPercentage = taxSettings ? 
          ((taxSettings.avs_percentage || 0) + (taxSettings.ai_percentage || 0) + 
           (taxSettings.impot_cantonal_percentage || 0) + (taxSettings.impot_communal_percentage || 0)) / 100 
          : 0;
        const taxes = d.revenue * taxPercentage;
        const profit = d.revenue - taxes;
        return {
          ...d,
          profit,
          margin: d.revenue > 0 ? ((profit / d.revenue) * 100).toFixed(1) : 0,
          avgPerTrip: (d.revenue / d.trips).toFixed(2)
        };
      })
      .sort((a, b) => b.profit - a.profit);
  }, [monthBookings, expenses, taxSettings]);

  if (profitability.length === 0) return null;

  return (
    <div className="bg-white/60 rounded-xl p-6 border border-black/10 mb-8">
      <h3 className="text-black font-bold text-sm uppercase tracking-wider mb-4">Rentabilité par chauffeur</h3>
      <div className="space-y-2">
        {profitability.map((driver, idx) => (
          <div key={driver.id} className="p-3 bg-black/5 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-black/40 text-xs font-bold">{idx + 1}</span>
                <span className="text-black font-medium text-sm">{driver.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {driver.profit > 0 ? 
                  <ArrowUpRight className="w-4 h-4 text-green-600" /> : 
                  <ArrowDownRight className="w-4 h-4 text-red-600" />
                }
                <span className={`font-bold text-sm ${driver.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  CHF {driver.profit.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex gap-6 text-xs text-black/60">
              <span>{driver.trips} trajets</span>
              <span>Avg: CHF {driver.avgPerTrip}</span>
              <span>Marge: {driver.margin}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}