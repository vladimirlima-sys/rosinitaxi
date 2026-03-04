import { TrendingUp, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';

export default function ReservasKPI({ stats }) {
  const kpis = [
    { label: 'Total', value: stats.total, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Pendentes', value: stats.pending, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Pagas', value: stats.paid, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Canceladas', value: stats.cancelled, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Receita', value: `CHF ${stats.revenue.toFixed(2)}`, icon: DollarSign, color: 'text-[#C9A96E]', bg: 'bg-[#C9A96E]/10' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div key={kpi.label} className={`${kpi.bg} border border-white/10 rounded-xl p-4`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/60 text-sm mb-1">{kpi.label}</p>
                <p className={`text-2xl font-semibold ${kpi.color}`}>{kpi.value}</p>
              </div>
              <Icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}