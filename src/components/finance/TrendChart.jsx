import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TrendChart({ bookings, expenses }) {
  const data = useMemo(() => {
    const monthData = {};
    const now = new Date();
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthData[month] = { month, revenue: 0, expenses: 0 };
    }

    // Add bookings
    bookings.forEach(b => {
      if (b.payment_status !== 'paid') return;
      const dateStr = b.departure_date || b.created_date;
      if (!dateStr) return;
      const month = dateStr.substring(0, 7);
      if (monthData[month]) {
        monthData[month].revenue += b.total_price || 0;
      }
    });

    // Add expenses
    expenses.forEach(e => {
      const month = e.month;
      if (monthData[month]) {
        monthData[month].expenses += e.amount || 0;
      }
    });

    // Calculate profit
    return Object.values(monthData).map(m => ({
      ...m,
      profit: m.revenue - m.expenses,
      label: new Date(`${m.month}-01`).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
    }));
  }, [bookings, expenses]);

  return (
    <div className="bg-white/60 rounded-xl p-6 border border-black/10 mb-8">
      <h3 className="text-black font-bold text-sm uppercase tracking-wider mb-4">Tendances (6 derniers mois)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis dataKey="label" stroke="rgba(0,0,0,0.3)" style={{ fontSize: '12px' }} />
          <YAxis stroke="rgba(0,0,0,0.3)" style={{ fontSize: '12px' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }}
            formatter={(v) => `CHF ${v.toFixed(2)}`}
          />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#F5C300" strokeWidth={2} dot={{ r: 4 }} name="Revenus" />
          <Line type="monotone" dataKey="expenses" stroke="#FF6B6B" strokeWidth={2} dot={{ r: 4 }} name="Dépenses" />
          <Line type="monotone" dataKey="profit" stroke="#51CF66" strokeWidth={2} dot={{ r: 4 }} name="Bénéfice" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}