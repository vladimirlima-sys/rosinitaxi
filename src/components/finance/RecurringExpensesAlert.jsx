import React, { useMemo } from 'react';
import { AlertCircle, Clock } from 'lucide-react';

export default function RecurringExpensesAlert({ expenses, selectedMonth }) {
  const recurringAlert = useMemo(() => {
    const recurringExpenses = expenses.filter(e => e.is_recurring);
    const notYetProcessed = recurringExpenses.filter(e => 
      e.recurring_start_month && e.recurring_start_month <= selectedMonth
    );

    return {
      total: notYetProcessed.length,
      amount: notYetProcessed.reduce((s, e) => s + (e.amount || 0), 0),
      items: notYetProcessed.slice(0, 3),
    };
  }, [expenses, selectedMonth]);

  if (recurringAlert.total === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-yellow-900 font-semibold text-sm">{recurringAlert.total} dépense{recurringAlert.total > 1 ? 's' : ''} récurrente{recurringAlert.total > 1 ? 's' : ''} active{recurringAlert.total > 1 ? 's' : ''}</p>
        <p className="text-yellow-800 text-xs mt-1">Montant mensuel: <span className="font-bold">CHF {recurringAlert.amount.toFixed(2)}</span></p>
        {recurringAlert.items.length > 0 && (
          <div className="mt-2 text-xs text-yellow-800 space-y-1">
            {recurringAlert.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {item.description} · CHF {item.amount}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}