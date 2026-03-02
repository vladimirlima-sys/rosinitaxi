import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { createPageUrl } from '@/utils';
import FinanceHeader from '@/components/finance/FinanceHeader';
import FinanceFilters from '@/components/finance/FinanceFilters';
import FinanceContent from '@/components/finance/FinanceContent';
import TaxSettingsForm from '@/components/finance/TaxSettingsForm';

export default function Finance() {
  const [bookings, setBookings] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [filterDriver, setFilterDriver] = useState('all');
  const [showTaxSettings, setShowTaxSettings] = useState(false);
  const [taxSettings, setTaxSettings] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('admin_unlocked') !== 'true') {
      window.location.href = createPageUrl('AdminPanel');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [allBookings, allExpenses, allTaxSettings] = await Promise.all([
      base44.entities.Booking.list(),
      base44.entities.Expense.list(),
      base44.entities.TaxSettings.list(),
    ]);
    setBookings(allBookings);
    setExpenses(allExpenses);
    if (allTaxSettings.length > 0) {
      setTaxSettings(allTaxSettings[0]);
    }
    setLoading(false);
  };

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

  // Calculate tax deductions for driver payments
  let totalTaxes = 0;
  if (taxSettings) {
    const totalTaxPercentage = 
      (taxSettings.avs_percentage || 0) +
      (taxSettings.ai_percentage || 0) +
      (taxSettings.impot_source_percentage || 0) +
      (taxSettings.impot_cantonal_percentage || 0) +
      (taxSettings.impot_communal_percentage || 0) +
      (taxSettings.other_deductions_percentage || 0);
    totalTaxes = grandTotal * (totalTaxPercentage / 100);
  }

  const netResult = grandTotal - totalExpenses - totalTaxes;

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
        <a
          href={createPageUrl('AdminPanel')}
          className="flex items-center gap-1 text-black/40 hover:text-black/70 transition-colors mb-6 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
        </a>
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

        {/* Tax Settings Toggle */}
        <button
          onClick={() => setShowTaxSettings(!showTaxSettings)}
          className="flex items-center gap-2 text-black/60 hover:text-black transition-colors mb-6"
        >
          {showTaxSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span className="text-sm">Configurações de Impostos</span>
        </button>

        {showTaxSettings && (
          <div className="mb-8">
            <TaxSettingsForm onTaxesUpdated={fetchData} />
          </div>
        )}

        <FinanceContent
          loading={loading}
          monthBookings={monthBookings}
          monthExpenses={monthExpenses}
          totalExpenses={totalExpenses}
          grandTotal={grandTotal}
          totalTaxes={totalTaxes}
          netResult={netResult}
          paymentMethods={paymentMethods}
          selectedMonth={selectedMonth}
          onExpenseAdded={fetchData}
          taxSettings={taxSettings}
        />
      </div>
    </div>
  );
}