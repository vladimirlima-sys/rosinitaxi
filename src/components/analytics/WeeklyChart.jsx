import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfWeek, subWeeks } from 'date-fns';

export default function WeeklyChart({ pageViews, bookings, isBookings = false }) {
  const items = isBookings ? bookings : pageViews;
  const data = [];

  for (let i = 11; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const count = items.filter(item => {
      const d = new Date(isBookings ? item.created_date : item.date);
      return d >= weekStart && d <= weekEnd;
    }).length;

    if (count > 0) {
      data.push({ week: format(weekStart, 'dd/MM'), count });
    }
  }

  const color = isBookings ? '#10b981' : '#3b82f6';
  const title = isBookings ? 'Reservas por Semana' : 'Visitas por Semana';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <h3 className="font-semibold text-slate-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke={color} strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}