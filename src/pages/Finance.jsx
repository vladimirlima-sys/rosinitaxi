import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, CreditCard, Banknote, Download, Plus, X, TrendingDown } from 'lucide-react';
import { jsPDF } from 'jspdf';

const EXPENSE_CATEGORIES = [
  { value: 'carburant', label: 'Carburant', color: '#F97316' },
  { value: 'assurance', label: 'Assurance voiture', color: '#8B5CF6' },
  { value: 'peage', label: 'Péage', color: '#EC4899' },
  { value: 'telephone', label: 'Téléphone', color: '#14B8A6' },
  { value: 'internet', label: 'Internet', color: '#3B82F6' },
  { value: 'entretien', label: 'Entretien / Réparation', color: '#EF4444' },
  { value: 'autre', label: 'Autre', color: '#6B7280' },
];

function getCategoryLabel(val) {
  return EXPENSE_CATEGORIES.find(c => c.value === val)?.label || val;
}

function AddExpenseCard({ selectedMonth, onAdded }) {
  const [form, setForm] = useState({ category: 'carburant', amount: '', description: '', date: new Date().toISOString().slice(0, 10) });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.entities.Expense.create({
      ...form,
      amount: parseFloat(form.amount),
      month: selectedMonth,
    });
    setSaving(false);
    setForm({ category: 'carburant', amount: '', description: '', date: new Date().toISOString().slice(0, 10) });
    onAdded();
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Plus className="w-4 h-4 text-[#F5C300]" />
        Ajouter une dépense
      </h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-white/50 text-xs mb-1 block">Catégorie</label>
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 rounded-lg outline-none text-sm"
          >
            {EXPENSE_CATEGORIES.map(c => (
              <option key={c.value} value={c.value} className="bg-black">{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-white/50 text-xs mb-1 block">Montant (CHF)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            placeholder="0.00"
            className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 rounded-lg outline-none text-sm"
          />
        </div>
        <div>
          <label className="text-white/50 text-xs mb-1 block">Date</label>
          <input
            type="date"
            required
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 rounded-lg outline-none text-sm"
          />
        </div>
        <div>
          <label className="text-white/50 text-xs mb-1 block">Description (optionnel)</label>
          <input
            type="text"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="ex: plein d'essence"
            className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 rounded-lg outline-none text-sm"
          />
        </div>
        <div className="md:col-span-2 lg:col-span-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#F5C300] text-black font-bold px-6 py-2 rounded-lg hover:bg-[#e6b800] transition-all disabled:opacity-50 text-sm"
          >
            {saving ? 'Enregistrement...' : 'Ajouter la dépense'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Finance() {
  const [isAdmin, setIsAdmin] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    base44.auth.me()
      .then(user => setIsAdmin(user?.role === 'admin'))
      .catch(() => setIsAdmin(false));
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [allBookings, allExpenses] = await Promise.all([
      base44.entities.Booking.list(),
      base44.entities.Expense.list(),
    ]);
    setBookings(allBookings);
    setExpenses(allExpenses);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  if (isAdmin === null) {
    return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">Chargement...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-light mb-2">Accès Restreint</h1>
          <p className="text-white/50">Seuls les administrateurs peuvent accéder à cette page.</p>
        </div>
      </div>
    );
  }

  // Filter bookings for selected month and paid status (by departure_date)
  const monthBookings = bookings.filter(b => {
    if (b.payment_status !== 'paid') return false;
    const dateStr = b.departure_date || b.created_date;
    if (!dateStr) return false;
    return dateStr.substring(0, 7) === selectedMonth;
  });

  // Filter expenses for selected month
  const monthExpenses = expenses.filter(e => e.month === selectedMonth);
  const totalExpenses = monthExpenses.reduce((s, e) => s + (e.amount || 0), 0);

  // Calculate totals by payment method
  const paymentMethods = {
    stripe: { total: 0, count: 0, label: 'Stripe (Carte)', color: '#635BFF' },
    twint: { total: 0, count: 0, label: 'TWINT', color: '#FF6B6B' },
    cash: { total: 0, count: 0, label: 'Espèces', color: '#51CF66' }
  };

  let grandTotal = 0;
  monthBookings.forEach(booking => {
    if (!paymentMethods[booking.payment_method]) return;
    paymentMethods[booking.payment_method].total += booking.total_price || 0;
    paymentMethods[booking.payment_method].count += 1;
    grandTotal += booking.total_price || 0;
  });

  const netResult = grandTotal - totalExpenses;

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

  const availableMonths = Array.from(new Set(
    bookings
      .filter(b => b.departure_date || b.created_date)
      .map(b => (b.departure_date || b.created_date).substring(0, 7))
  )).sort().reverse();

  const monthLabel = new Date(`${selectedMonth}-01`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Rapport Financier Mensuel', 20, 20);
    doc.setFontSize(12);
    doc.text(`Période : ${monthLabel}`, 20, 30);
    doc.setFontSize(10);
    doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, 20, 38);

    // Revenues
    doc.setFontSize(14);
    doc.text('REVENUS', 20, 52);
    doc.setFontSize(10);
    doc.text(`Total des courses (${monthBookings.length} courses) : CHF ${grandTotal.toFixed(2)}`, 25, 62);
    doc.text(`  - Stripe : CHF ${paymentMethods.stripe.total.toFixed(2)} (${paymentMethods.stripe.count} transactions)`, 25, 70);
    doc.text(`  - TWINT : CHF ${paymentMethods.twint.total.toFixed(2)} (${paymentMethods.twint.count} transactions)`, 25, 78);
    doc.text(`  - Espèces : CHF ${paymentMethods.cash.total.toFixed(2)} (${paymentMethods.cash.count} transactions)`, 25, 86);

    // Expenses
    doc.setFontSize(14);
    doc.text('DÉPENSES', 20, 100);
    doc.setFontSize(10);
    let y = 110;
    if (monthExpenses.length === 0) {
      doc.text('Aucune dépense enregistrée', 25, y);
      y += 8;
    } else {
      monthExpenses.forEach(exp => {
        doc.text(`  - ${getCategoryLabel(exp.category)} : CHF ${(exp.amount || 0).toFixed(2)}${exp.description ? ' (' + exp.description + ')' : ''}`, 25, y);
        y += 8;
        if (y > 270) { doc.addPage(); y = 20; }
      });
    }
    doc.text(`Total dépenses : CHF ${totalExpenses.toFixed(2)}`, 25, y + 4);

    // Net result
    y += 18;
    doc.setFontSize(14);
    doc.text(`RÉSULTAT NET : CHF ${netResult.toFixed(2)}`, 20, y);

    // Courses detail
    y += 16;
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.text('DÉTAIL DES COURSES', 20, y);
    y += 10;
    doc.setFontSize(9);
    doc.text('Date', 20, y);
    doc.text('Client', 45, y);
    doc.text('Trajet', 90, y);
    doc.text('Mode', 155, y);
    doc.text('CHF', 185, y);
    y += 6;
    doc.line(20, y, 200, y);
    y += 4;
    monthBookings.forEach(b => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(new Date(b.created_date).toLocaleDateString('fr-FR'), 20, y);
      doc.text((b.client_name || '').substring(0, 20), 45, y);
      doc.text(((b.departure_point || '').split(',')[0] + ' → ' + (b.arrival_point || '').split(',')[0]).substring(0, 40), 90, y);
      doc.text(b.payment_method === 'stripe' ? 'Stripe' : b.payment_method === 'twint' ? 'TWINT' : 'Espèces', 155, y);
      doc.text(`${(b.total_price || 0).toFixed(2)}`, 185, y);
      y += 7;
    });

    doc.save(`rapport-financier-${selectedMonth}.pdf`);
  };

  const deleteExpense = async (id) => {
    await base44.entities.Expense.delete(id);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="text-4xl font-light text-white">Rapport Financier</h1>
            <p className="text-white/50 mt-1">Suivez les revenus et dépenses par mois</p>
          </div>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 bg-[#F5C300] text-black font-bold px-5 py-2.5 rounded-lg hover:bg-[#e6b800] transition-all text-sm"
          >
            <Download className="w-4 h-4" />
            Télécharger PDF
          </button>
        </div>

        {/* Month Selector */}
        <div className="mt-6 mb-8">
          <label className="text-white/60 text-sm mb-2 block">Sélectionner le mois</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg outline-none"
          >
            {availableMonths.map(month => (
              <option key={month} value={month} className="bg-black text-white">
                {new Date(`${month}-01`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </option>
            ))}
            {!availableMonths.includes(selectedMonth) && (
              <option value={selectedMonth} className="bg-black text-white">{monthLabel}</option>
            )}
          </select>
        </div>

        {loading ? (
          <div className="text-white/50">Chargement des données...</div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/50 text-xs mb-1">Total du mois</p>
                    <p className="text-white text-2xl font-bold">CHF {grandTotal.toFixed(2)}</p>
                    <p className="text-white/40 text-xs mt-1">{monthBookings.length} courses</p>
                  </div>
                  <TrendingUp className="w-7 h-7 text-[#F5C300]" />
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/50 text-xs mb-1">Stripe</p>
                    <p className="text-white text-2xl font-bold">CHF {paymentMethods.stripe.total.toFixed(2)}</p>
                    <p className="text-white/40 text-xs mt-1">{paymentMethods.stripe.count} transactions</p>
                  </div>
                  <CreditCard className="w-7 h-7 text-blue-400" />
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/50 text-xs mb-1">TWINT</p>
                    <p className="text-white text-2xl font-bold">CHF {paymentMethods.twint.total.toFixed(2)}</p>
                    <p className="text-white/40 text-xs mt-1">{paymentMethods.twint.count} transactions</p>
                  </div>
                  <DollarSign className="w-7 h-7 text-red-400" />
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/50 text-xs mb-1">Espèces</p>
                    <p className="text-white text-2xl font-bold">CHF {paymentMethods.cash.total.toFixed(2)}</p>
                    <p className="text-white/40 text-xs mt-1">{paymentMethods.cash.count} transactions</p>
                  </div>
                  <Banknote className="w-7 h-7 text-green-400" />
                </div>
              </div>
              <div className={`border rounded-lg p-5 ${netResult >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/50 text-xs mb-1">Résultat net</p>
                    <p className={`text-2xl font-bold ${netResult >= 0 ? 'text-green-400' : 'text-red-400'}`}>CHF {netResult.toFixed(2)}</p>
                    <p className="text-white/40 text-xs mt-1">Revenus - Dépenses</p>
                  </div>
                  <TrendingDown className={`w-7 h-7 ${netResult >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                </div>
              </div>
            </div>

            {/* Add Expense */}
            <AddExpenseCard selectedMonth={selectedMonth} onAdded={fetchData} />

            {/* Expenses List */}
            {monthExpenses.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Dépenses du mois</h3>
                  <span className="text-[#F5C300] font-bold">Total : CHF {totalExpenses.toFixed(2)}</span>
                </div>
                <div className="space-y-2">
                  {monthExpenses.map(exp => {
                    const cat = EXPENSE_CATEGORIES.find(c => c.value === exp.category);
                    return (
                      <div key={exp.id} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full" style={{ background: cat?.color || '#fff' }} />
                          <div>
                            <p className="text-white text-sm font-medium">{cat?.label}</p>
                            {exp.description && <p className="text-white/40 text-xs">{exp.description}</p>}
                            <p className="text-white/30 text-xs">{exp.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-white font-semibold">CHF {(exp.amount || 0).toFixed(2)}</span>
                          <button onClick={() => deleteExpense(exp.id)} className="text-white/20 hover:text-red-400 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
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

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
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

            {/* Detailed Table */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Détail des courses</h3>
              {monthBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-white/60 text-left py-2 px-3">Date</th>
                        <th className="text-white/60 text-left py-2 px-3">Client</th>
                        <th className="text-white/60 text-left py-2 px-3">Trajet</th>
                        <th className="text-white/60 text-left py-2 px-3">Méthode</th>
                        <th className="text-white/60 text-right py-2 px-3">Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthBookings.map(booking => (
                        <tr key={booking.id} className="border-b border-white/5 hover:bg-white/5 transition">
                          <td className="text-white py-3 px-3">
                            {new Date(booking.departure_date || booking.created_date).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="text-white py-3 px-3">{booking.client_name}</td>
                          <td className="text-white/70 py-3 px-3 text-xs">
                            {booking.departure_point.split(',')[0]} → {booking.arrival_point.split(',')[0]}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                              booking.payment_method === 'stripe' ? 'bg-blue-500/30 text-blue-300' :
                              booking.payment_method === 'twint' ? 'bg-red-500/30 text-red-300' :
                              'bg-green-500/30 text-green-300'
                            }`}>
                              {booking.payment_method === 'stripe' ? 'Stripe' :
                               booking.payment_method === 'twint' ? 'TWINT' : 'Espèces'}
                            </span>
                          </td>
                          <td className="text-white font-semibold text-right py-3 px-3">
                            CHF {booking.total_price?.toFixed(2) || '0.00'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-white/50 text-center py-8">Aucune course payée sur cette période</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}