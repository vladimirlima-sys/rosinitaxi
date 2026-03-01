import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const EXPENSE_CATEGORIES = [
  { value: 'carburant', label: 'Carburant', color: '#F97316' },
  { value: 'assurance', label: 'Assurance voiture', color: '#8B5CF6' },
  { value: 'peage', label: 'Péage', color: '#EC4899' },
  { value: 'telephone', label: 'Téléphone', color: '#14B8A6' },
  { value: 'internet', label: 'Internet', color: '#3B82F6' },
  { value: 'entretien', label: 'Entretien / Réparation', color: '#EF4444' },
  { value: 'autre', label: 'Autre', color: '#6B7280' },
];

export default function RevenueCharts({ monthBookings, paymentMethods, monthExpenses }) {
  const chartData = [
    { method: 'Stripe', value: paymentMethods.stripe.total, fill: '#635BFF' },
    { method: 'TWINT', value: paymentMethods.twint.total, fill: '#FF6B6B' },
    { method: 'Espèces', value: paymentMethods.cash.total, fill: '#51CF66' }
  ].filter(d => d.value > 0);

  const expenseChartData = EXPENSE_CATEGORIES.map(cat => ({
    name: cat.label,
    value: monthExpenses.filter(e => e.category === cat.value).reduce((s, e) => s + (e.amount || 0), 0),
    fill: cat.color,
  })).filter(d => d.value > 0);

  return (
    <div className="grid grid-cols-1 gap-8 mb-8">
      <div className="bg-black border border-black/40 rounded-lg p-6">
        <h3 className="text-white font-semibold mb-4">Revenus par méthode</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="method" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }} formatter={(v) => `CHF ${v.toFixed(2)}`} />
              <Bar dataKey="value" fill="#F5C300" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-white/50 text-center py-12">Aucune donnée pour cette période</p>
        )}
      </div>

      <div className="bg-black border border-black/40 rounded-lg p-6">
        <h3 className="text-white font-semibold mb-4">Dépenses par catégorie</h3>
        {expenseChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={expenseChartData} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {expenseChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }} formatter={(v) => `CHF ${v.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-white/50 text-center py-12">Aucune dépense ce mois</p>
        )}
      </div>
    </div>
  );
}