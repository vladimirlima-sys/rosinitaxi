import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function FinanceSummary({ grandTotal, netResult, monthBookings }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-black border border-black/40 rounded-lg p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs mb-1">Total du mois</p>
            <p className="text-white text-2xl font-bold">CHF {grandTotal.toFixed(2)}</p>
            <p className="text-white/40 text-xs mt-1">{monthBookings.length} courses</p>
          </div>
          <TrendingUp className="w-7 h-7 text-white" />
        </div>
      </div>

      <div className="bg-black border border-black/40 rounded-lg p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs mb-1">Résultat net</p>
            <p className={`text-2xl font-bold ${netResult >= 0 ? 'text-white' : 'text-red-400'}`}>
              CHF {netResult.toFixed(2)}
            </p>
            <p className="text-white/40 text-xs mt-1">Revenus - Dépenses</p>
          </div>
          <TrendingDown className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );
}