import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { TrendingUp } from 'lucide-react';

export default function BookingsEvolution({ bookings }) {
  // Calculate daily booking counts
  const bookingsByDate = {};
  bookings.forEach(booking => {
    const date = booking.created_date.split('T')[0];
    bookingsByDate[date] = (bookingsByDate[date] || 0) + 1;
  });

  const chartData = Object.entries(bookingsByDate)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .slice(-30)
    .map(([date, count], idx) => ({
      date: format(new Date(date), 'dd MMM'),
      bookings: count,
      cumulativeBookings: Object.values(bookingsByDate).slice(0, idx + 1).reduce((a, b) => a + b, 0)
    }));

  const totalBookings = bookings.length;
  const avgPerDay = (totalBookings / (chartData.length || 1)).toFixed(1);
  const maxPerDay = Math.max(...chartData.map(d => d.bookings), 0);
  
  // Calculate growth rate
  const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
  const secondHalf = chartData.slice(Math.floor(chartData.length / 2));
  const firstHalfAvg = firstHalf.length > 0 ? (firstHalf.reduce((sum, d) => sum + d.bookings, 0) / firstHalf.length).toFixed(1) : 0;
  const secondHalfAvg = secondHalf.length > 0 ? (secondHalf.reduce((sum, d) => sum + d.bookings, 0) / secondHalf.length).toFixed(1) : 0;
  const growthRate = firstHalfAvg > 0 ? (((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100).toFixed(1) : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="w-5 h-5 text-green-600" />
        <h2 className="text-lg font-bold text-slate-900">Evolução de Reservas</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <p className="text-xs text-green-600 font-semibold uppercase mb-1">Total</p>
          <p className="text-2xl font-bold text-green-700">{totalBookings}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Média/Dia</p>
          <p className="text-2xl font-bold text-blue-700">{avgPerDay}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <p className="text-xs text-purple-600 font-semibold uppercase mb-1">Máximo/Dia</p>
          <p className="text-2xl font-bold text-purple-700">{maxPerDay}</p>
        </div>
        <div className={`bg-${growthRate >= 0 ? 'green' : 'red'}-50 rounded-lg p-3 border border-${growthRate >= 0 ? 'green' : 'red'}-200`}>
          <p className={`text-xs text-${growthRate >= 0 ? 'green' : 'red'}-600 font-semibold uppercase mb-1`}>Crescimento</p>
          <p className={`text-2xl font-bold text-${growthRate >= 0 ? 'green' : 'red'}-700`}>{growthRate}%</p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <Scatter name="Reservas/Dia" data={chartData} fill="#10b981" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}