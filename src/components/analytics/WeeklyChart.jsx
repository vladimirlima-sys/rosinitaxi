import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfWeek, eachWeekOfInterval, endOfWeek } from 'date-fns';

export default function WeeklyChart({ pageViews, isBookings = false, bookings = [] }) {
  const data = isBookings ? bookings : pageViews;
  
  const weeks = eachWeekOfInterval({
    start: new Date(Math.min(...data.map(d => new Date(d.created_date || d.date)))),
    end: new Date()
  });

  const chartData = weeks.map(weekStart => {
    const weekEnd = endOfWeek(weekStart);
    const count = data.filter(d => {
      const itemDate = new Date(d.created_date || d.date);
      return itemDate >= weekStart && itemDate <= weekEnd;
    }).length;
    return {
      week: format(weekStart, 'dd MMM'),
      count
    };
  }).filter(d => d.count > 0).slice(-12);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <h2 className="text-lg font-bold text-slate-900 mb-4">
        {isBookings ? 'Reservas por Semana' : 'Visitas por Semana'}
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke={isBookings ? '#10b981' : '#3b82f6'} 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}