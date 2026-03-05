import { BarChart3, TrendingUp } from 'lucide-react';

export default function AnalyticsHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-blue-100 p-3 rounded-lg">
          <BarChart3 className="w-6 h-6 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Estatísticas de Visitas</h1>
      </div>
      <p className="text-slate-600 text-sm flex items-center gap-2">
        <TrendingUp className="w-4 h-4" />
        Acompanhe em tempo real o desempenho do app
      </p>
    </div>
  );
}