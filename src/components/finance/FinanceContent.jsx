import React from 'react';
import { Loader2 } from 'lucide-react';
import FinanceSummary from '@/components/finance/FinanceSummary.jsx';
import AddExpenseCard from '@/components/finance/AddExpenseCard.jsx';
import ExpensesList from '@/components/finance/ExpensesList.jsx';
import RevenueCharts from '@/components/finance/RevenueCharts.jsx';
import BookingsTable from '@/components/finance/BookingsTable.jsx';

export default function FinanceContent({
  loading,
  monthBookings,
  monthExpenses,
  totalExpenses,
  grandTotal,
  netResult,
  paymentMethods,
  selectedMonth,
  onExpenseAdded
}) {
  if (loading) {
    return <div className="text-black/50 text-center py-12 flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Chargement...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Summary */}
      <FinanceSummary grandTotal={grandTotal} netResult={netResult} monthBookings={monthBookings} />

      {/* Add Expense */}
      <AddExpenseCard selectedMonth={selectedMonth} onAdded={onExpenseAdded} />

      {/* Expenses List */}
      {monthExpenses.length > 0 && (
        <ExpensesList monthExpenses={monthExpenses} totalExpenses={totalExpenses} />
      )}

      {/* Charts */}
      <RevenueCharts monthBookings={monthBookings} paymentMethods={paymentMethods} monthExpenses={monthExpenses} />

      {/* Bookings Table */}
      {monthBookings.length > 0 && (
        <BookingsTable monthBookings={monthBookings} />
      )}
    </div>
  );
}