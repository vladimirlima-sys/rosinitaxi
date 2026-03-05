import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfDay, eachDayOfInterval } from 'date-fns';

export default function DailyChart({ pageViews, isBookings = false, bookings = [] }) {
  const data = isBookings ? bookings : pageViews;
  
  const dates = eachDayOfInterval({
    start: new Date(Math.min(...data.map(d => new Date(d.created_date || d.date)))),
    end: new Date()
  });

  const chartData = dates.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const count = data.filter(d => (d.created_date || d.date).startsWith(dateStr)).length;
    return {
      date: format(date, 'dd MMM'),
      count
    };
  }).filter(d => d.count > 0).slice(-30);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <h2 className="text-lg font-bold text-slate-900 mb-4">
        {isBookings ? 'Reservas por Dia' : 'Visitas por Dia'}
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill={isBookings ? '#10b981' : '#3b82f6'} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}