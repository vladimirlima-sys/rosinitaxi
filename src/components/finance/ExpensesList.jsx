import React from 'react';
import { base44 } from '@/api/base44Client';
import { X } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  { value: 'carburant', label: 'Carburant', color: '#F97316' },
  { value: 'assurance', label: 'Assurance voiture', color: '#8B5CF6' },
  { value: 'peage', label: 'Péage', color: '#EC4899' },
  { value: 'telephone', label: 'Téléphone', color: '#14B8A6' },
  { value: 'internet', label: 'Internet', color: '#3B82F6' },
  { value: 'entretien', label: 'Entretien / Réparation', color: '#EF4444' },
  { value: 'autre', label: 'Autre', color: '#6B7280' },
];

export default function ExpensesList({ monthExpenses, totalExpenses }) {
  const deleteExpense = async (id) => {
    await base44.entities.Expense.delete(id);
    window.location.reload();
  };

  return (
    <div className="bg-black border border-black/40 rounded-lg p-6 mb-8">
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
  );
}