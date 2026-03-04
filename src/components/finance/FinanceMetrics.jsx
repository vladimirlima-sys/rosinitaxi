import React from 'react';
import { TrendingUp, Users, DollarSign, Zap } from 'lucide-react';

export default function FinanceMetrics({ monthBookings, grandTotal, totalExpenses, netResult, totalTaxes }) {
  const avgTicket = monthBookings.length > 0 ? (grandTotal / monthBookings.length).toFixed(2) : 0;
  const margin = grandTotal > 0 ? ((netResult / grandTotal) * 100).toFixed(1) : 0;

  const metrics = [
    { label: 'Nombre de trajets', value: monthBookings.length, icon: Zap, color: '#F5C300' },
    { label: 'Ticket moyen', value: `CHF ${avgTicket}`, icon: DollarSign, color: '#51CF66' },
    { label: 'Marge nette', value: `${margin}%`, icon: TrendingUp, color: '#FF6B6B' },
    { label: 'Total taxes', value: `CHF ${totalTaxes.toFixed(2)}`, icon: Users, color: '#635BFF' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {metrics.map((metric, idx) => {
        const Icon = metric.icon;
        return (
          <div key={idx} className="bg-white/60 rounded-xl p-4 border border-black/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${metric.color}20` }}>
                <Icon className="w-4 h-4" style={{ color: metric.color }} />
              </div>
              <p className="text-black/60 text-xs">{metric.label}</p>
            </div>
            <p className="text-black font-bold text-lg">{metric.value}</p>
          </div>
        );
      })}
    </div>
  );
}