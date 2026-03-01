import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import FinanceHeader from '@/components/finance/FinanceHeader';
import FinanceFilters from '@/components/finance/FinanceFilters';
import FinanceContent from '@/components/finance/FinanceContent';

export default function Finance() {
  const [isAdmin, setIsAdmin] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [filterDriver, setFilterDriver] = useState('all');

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

  // Compute finance data
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

  const availableDrivers = bookings
    .filter(b => b.driver_id && b.driver_id !== 'null')
    .reduce((acc, b) => {
      if (!acc.find(d => d.id === b.driver_id)) {
        acc.push({ id: b.driver_id, name: b.driver_name });
      }
      return acc;
    }, [])
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleDownloadPDF = async () => {
    const { downloadFinancePDF } = await import('@/functions/downloadFinancePDF');
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
        <FinanceHeader onDownloadPDF={handleDownloadPDF} />

        <div className="mb-8">
          <FinanceFilters
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            filterDriver={filterDriver}
            setFilterDriver={setFilterDriver}
            availableMonths={availableMonths}
            monthLabel={monthLabel}
            availableDrivers={availableDrivers}
          />
        </div>

        <FinanceContent
          loading={loading}
          monthBookings={monthBookings}
          monthExpenses={monthExpenses}
          totalExpenses={totalExpenses}
          grandTotal={grandTotal}
          netResult={netResult}
          paymentMethods={paymentMethods}
          selectedMonth={selectedMonth}
          onExpenseAdded={fetchData}
        />
      </div>
    </div>
  );
}