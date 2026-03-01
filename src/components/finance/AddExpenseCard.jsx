import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  { value: 'carburant', label: 'Carburant', color: '#F97316' },
  { value: 'assurance', label: 'Assurance voiture', color: '#8B5CF6' },
  { value: 'peage', label: 'Péage', color: '#EC4899' },
  { value: 'telephone', label: 'Téléphone', color: '#14B8A6' },
  { value: 'internet', label: 'Internet', color: '#3B82F6' },
  { value: 'entretien', label: 'Entretien / Réparation', color: '#EF4444' },
  { value: 'autre', label: 'Autre', color: '#6B7280' },
];

export default function AddExpenseCard({ selectedMonth, onAdded }) {
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
    <div className="bg-black border border-black/40 rounded-lg p-6 mb-8">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Plus className="w-4 h-4 text-white" />
        Ajouter une dépense
      </h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-white/60 text-xs mb-1 block">Catégorie</label>
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 rounded-lg outline-none text-sm"
          >
            {EXPENSE_CATEGORIES.map(c => (
              <option key={c.value} value={c.value} className="bg-[#222]">{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-white/60 text-xs mb-1 block">Montant (CHF)</label>
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
          <label className="text-white/60 text-xs mb-1 block">Data</label>
          <input
            type="date"
            required
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 rounded-lg outline-none text-sm"
          />
        </div>
        <div>
          <label className="text-white/60 text-xs mb-1 block">Descrição (optionnel)</label>
          <input
            type="text"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="ex: plein d'essence"
            className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 rounded-lg outline-none text-sm"
          />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-white text-black font-bold px-6 py-2 rounded-lg hover:bg-white/90 transition-all disabled:opacity-50 text-sm"
          >
            {saving ? 'Enregistrement...' : 'Ajouter la dépense'}
          </button>
        </div>
      </form>
    </div>
  );
}