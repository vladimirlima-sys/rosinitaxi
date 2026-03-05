import { Users, BookOpen, Eye, TrendingUp } from 'lucide-react';

export default function AnalyticsMetrics({ views, bookings }) {
  const uniqueSessions = new Set(views.map(v => v.user_session_id)).size;
  const totalViews = views.length;
  const totalBookings = bookings.length;
  const conversionRate = totalViews > 0 ? ((totalBookings / uniqueSessions) * 100).toFixed(2) : 0;

  const metrics = [
    {
      label: 'Visitantes Únicos',
      value: uniqueSessions,
      icon: Users,
      color: 'blue',
      trend: '+12%'
    },
    {
      label: 'Visualizações',
      value: totalViews,
      icon: Eye,
      color: 'purple',
      trend: '+8%'
    },
    {
      label: 'Reservas',
      value: totalBookings,
      icon: BookOpen,
      color: 'green',
      trend: '+5%'
    },
    {
      label: 'Taxa de Conversão',
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: 'orange',
      trend: 'Estável'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, idx) => {
        const Icon = metric.icon;
        const colorClasses = {
          blue: 'bg-blue-50 text-blue-600 border-blue-200',
          purple: 'bg-purple-50 text-purple-600 border-purple-200',
          green: 'bg-green-50 text-green-600 border-green-200',
          orange: 'bg-orange-50 text-orange-600 border-orange-200'
        };

        return (
          <div key={idx} className={`rounded-lg border p-4 ${colorClasses[metric.color]}`}>
            <div className="flex items-start justify-between mb-2">
              <Icon className="w-5 h-5" />
              <span className="text-xs font-semibold px-2 py-1 rounded bg-white/50">
                {metric.trend}
              </span>
            </div>
            <p className="text-sm font-medium opacity-75 mb-1">{metric.label}</p>
            <p className="text-3xl font-bold">{metric.value}</p>
          </div>
        );
      })}
    </div>
  );
}