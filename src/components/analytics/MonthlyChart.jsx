import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export default function MonthlyChart({ pageViews, bookings, isBookings = false }) {
  const items = isBookings ? bookings : pageViews;
  const data = [];

  for (let i = 11; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(new Date(), i));
    const monthEnd = endOfMonth(subMonths(new Date(), i));

    const count = items.filter(item => {
      const d = new Date(isBookings ? item.created_date : item.date);
      return d >= monthStart && d <= monthEnd;
    }).length;

    if (count > 0) {
      data.push({ month: format(monthStart, 'MMM yy'), count });
    }
  }

  const color = isBookings ? '#10b981' : '#3b82f6';
  const title = isBookings ? 'Reservas por Mês' : 'Visitas por Mês';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <h3 className="font-semibold text-slate-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Area type="monotone" dataKey="count" stroke={color} fill={color} fillOpacity={0.15} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}