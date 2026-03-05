import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, eachMonthOfInterval, endOfMonth } from 'date-fns';

export default function MonthlyChart({ pageViews, isBookings = false, bookings = [] }) {
  const data = isBookings ? bookings : pageViews;
  
  const months = eachMonthOfInterval({
    start: new Date(Math.min(...data.map(d => new Date(d.created_date || d.date)))),
    end: new Date()
  });

  const chartData = months.map(monthStart => {
    const monthEnd = endOfMonth(monthStart);
    const count = data.filter(d => {
      const itemDate = new Date(d.created_date || d.date);
      return itemDate >= monthStart && itemDate <= monthEnd;
    }).length;
    return {
      month: format(monthStart, 'MMM yy'),
      count
    };
  }).filter(d => d.count > 0).slice(-12);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <h2 className="text-lg font-bold text-slate-900 mb-4">
        {isBookings ? 'Reservas por Mês' : 'Visitas por Mês'}
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Area 
            type="monotone" 
            dataKey="count" 
            fill={isBookings ? '#10b98166' : '#3b82f666'} 
            stroke={isBookings ? '#10b981' : '#3b82f6'}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}