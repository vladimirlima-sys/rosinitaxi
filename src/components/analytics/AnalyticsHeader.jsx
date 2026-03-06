import { BarChart2 } from 'lucide-react';

export default function AnalyticsHeader() {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="bg-blue-100 p-3 rounded-xl">
        <BarChart2 className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500">Acompanhe visitas e reservas em tempo real</p>
      </div>
    </div>
  );
}