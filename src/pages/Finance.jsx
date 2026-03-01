import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Loader2 } from 'lucide-react';
import FinanceSummary from '@/components/finance/FinanceSummary.jsx';
import AddExpenseCard from '@/components/finance/AddExpenseCard.jsx';
import ExpensesList from '@/components/finance/ExpensesList.jsx';
import RevenueCharts from '@/components/finance/RevenueCharts.jsx';
import BookingsTable from '@/components/finance/BookingsTable.jsx';

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
    return <div className="min-h-screen bg-[#F5C300] flex items-center justify-center text-black"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F5C300] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light mb-2 text-black">Accès Restreint</h1>
          <p className="text-black/60">Seuls les administrateurs peuvent accéder à cette page.</p>
        </div>
      </div>
    );
  }

  const [filterDriver, setFilterDriver] = useState('all');

  const monthBookings = bookings.filter(b => {
    if (b.payment_status !== 'paid') return false;
    const dateStr = b.departure_date || b.created_date;
    if (!dateStr) return false;
    if (filterDriver !== 'all' && b.driver_id !== filterDriver) return false;
    return dateStr.substring(0, 7) === selectedMonth;
  });

  const monthExpenses = expenses.filter(e => e.month === selectedMonth);
  const totalExpenses = monthExpenses.reduce((s, e) => s + (e.amount || 0), 0);

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

  const availableMonths = Array.from(new Set(
    bookings
      .filter(b => b.departure_date || b.created_date)
      .map(b => (b.departure_date || b.created_date).substring(0, 7))
  )).sort().reverse();

  const monthLabel = new Date(`${selectedMonth}-01`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const handleDownloadPDF = async () => {
    await downloadFinancePDF({
      selectedMonth,
      monthLabel,
      monthBookings,
      grandTotal,
      paymentMethods,
      monthExpenses,
      totalExpenses,
      netResult
    });
  };

  return (
    <div className="min-h-screen bg-[#F5C300] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-black text-6xl font-extralight tracking-[0.3em] uppercase">ROSINI</h1>
          <p className="text-black/60 text-sm tracking-[0.2em] uppercase mt-2">RAPPORT FINANCIER</p>
          <div className="w-8 h-[1px] bg-black/40 mx-auto mt-3" />
        </div>

        {/* Download Button */}
        <div className="mb-8">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-black text-white font-bold px-5 py-2.5 rounded-lg hover:bg-black/80 transition-all text-sm"
          >
            <Download className="w-4 h-4" />
            Télécharger PDF
          </button>
        </div>

        {/* Month Selector */}
        <div className="mb-8">
          <label className="text-black/60 text-sm mb-2 block">Sélectionner le mois</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-black border border-black/40 text-white px-4 py-2 rounded-lg outline-none w-full"
          >
            {availableMonths.map(month => (
              <option key={month} value={month} className="bg-black text-white">
                {new Date(`${month}-01`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </option>
            ))}
            {!availableMonths.includes(selectedMonth) && (
              <option value={selectedMonth} className="bg-[#222] text-white">{monthLabel}</option>
            )}
          </select>
        </div>

        {loading ? (
          <div className="text-black/50 text-center py-12">Chargement des données...</div>
        ) : (
          <div className="space-y-8">
            {/* Summary */}
            <FinanceSummary grandTotal={grandTotal} netResult={netResult} monthBookings={monthBookings} />

            {/* Add Expense */}
            <AddExpenseCard selectedMonth={selectedMonth} onAdded={fetchData} />

            {/* Expenses List */}
            {monthExpenses.length > 0 && (
              <ExpensesList monthExpenses={monthExpenses} totalExpenses={totalExpenses} />
            )}

            {/* Charts */}
            <RevenueCharts monthBookings={monthBookings} paymentMethods={paymentMethods} monthExpenses={monthExpenses} />

            {/* Bookings Table */}
            <BookingsTable monthBookings={monthBookings} />
          </div>
        )}
      </div>
    </div>
  );
}