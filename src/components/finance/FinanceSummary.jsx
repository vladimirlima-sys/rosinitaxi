import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function FinanceSummary({ grandTotal, netResult, monthBookings, totalTaxes, taxSettings }) {
  const totalTaxPercentage = taxSettings ? 
    (taxSettings.avs_percentage || 0) +
    (taxSettings.ai_percentage || 0) +
    (taxSettings.impot_source_percentage || 0) +
    (taxSettings.impot_cantonal_percentage || 0) +
    (taxSettings.impot_communal_percentage || 0) +
    (taxSettings.other_deductions_percentage || 0) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <p className="text-white/60 text-xs mb-1">Impostos ({totalTaxPercentage.toFixed(2)}%)</p>
            <p className="text-red-400 text-2xl font-bold">-CHF {(totalTaxes || 0).toFixed(2)}</p>
            <p className="text-white/40 text-xs mt-1">AVS, AI, Impôts...</p>
          </div>
          <TrendingDown className="w-7 h-7 text-red-400" />
        </div>
      </div>

      <div className="bg-black border border-black/40 rounded-lg p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs mb-1">Résultat net</p>
            <p className={`text-2xl font-bold ${netResult >= 0 ? 'text-white' : 'text-red-400'}`}>
              CHF {netResult.toFixed(2)}
            </p>
            <p className="text-white/40 text-xs mt-1">Após impostos</p>
          </div>
          <TrendingDown className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );
}