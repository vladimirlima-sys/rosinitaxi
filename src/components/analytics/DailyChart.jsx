import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

export default function DailyChart({ pageViews, bookings, isBookings = false }) {
  const data = [];
  const items = isBookings ? bookings : pageViews;

  for (let i = 29; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const count = items.filter(item => {
      const d = isBookings ? item.created_date?.split('T')[0] : item.date;
      return d === dateStr;
    }).length;
    if (count > 0) {
      data.push({ date: format(date, 'dd/MM'), count });
    }
  }

  const color = isBookings ? '#10b981' : '#3b82f6';
  const title = isBookings ? 'Reservas por Dia' : 'Visitas por Dia';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <h3 className="font-semibold text-slate-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}