import { Eye, Users, BookOpen, TrendingUp } from 'lucide-react';

export default function AnalyticsMetrics({ views, bookings }) {
  const uniqueSessions = new Set(views.map(v => v.user_session_id)).size;
  const totalViews = views.length;
  const totalBookings = bookings.length;
  const conversionRate = uniqueSessions > 0 ? ((totalBookings / uniqueSessions) * 100).toFixed(1) : '0.0';

  const metrics = [
    { label: 'Visitas Únicas', value: uniqueSessions, icon: Users, color: 'blue' },
    { label: 'Pageviews', value: totalViews, icon: Eye, color: 'indigo' },
    { label: 'Reservas', value: totalBookings, icon: BookOpen, color: 'green' },
    { label: 'Conversão', value: `${conversionRate}%`, icon: TrendingUp, color: 'purple' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div key={m.label} className={`bg-white rounded-lg shadow-sm border border-slate-200 p-4`}>
            <div className={`bg-${m.color}-100 w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 text-${m.color}-600`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{m.value}</p>
            <p className="text-xs text-slate-500 mt-1">{m.label}</p>
          </div>
        );
      })}
    </div>
  );
}