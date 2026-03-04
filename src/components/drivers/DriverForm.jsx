import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function DriverForm({ driver, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: driver?.name || '',
    phone: driver?.phone || '',
    email: driver?.email || '',
    vehicle: driver?.vehicle || '',
    license_number: driver?.license_number || '',
    status: driver?.status || 'active',
    notes: driver?.notes || '',
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const inputClass = "w-full bg-white/10 border border-white/20 rounded-lg text-white text-sm p-3 outline-none placeholder:text-white/40 focus:border-white/60";
  const labelClass = "text-white/60 text-xs uppercase tracking-wider mb-1 block";

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-white font-semibold text-lg">{driver ? 'Modifier le chauffeur' : 'Nouveau chauffeur'}</h2>
          <button onClick={onCancel} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Nom complet *</label>
            <input type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Nom du chauffeur" className={inputClass} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Téléphone *</label>
              <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+41 XX XXX XX XX" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="email@exemple.com" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Véhicule</label>
            <input type="text" value={form.vehicle} onChange={e => update('vehicle', e.target.value)} placeholder="Ex: Mercedes E-Class · VS 123 456" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Permis de conduire</label>
              <input type="text" value={form.license_number} onChange={e => update('license_number', e.target.value)} placeholder="Numéro de permis" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Statut</label>
              <select value={form.status} onChange={e => update('status', e.target.value)} className={inputClass}>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Informations complémentaires..." rows={3} className={`${inputClass} resize-none`} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel} className="flex-1 h-11 rounded-xl border border-white/20 text-white/70 text-sm font-medium hover:bg-white/10 transition-all">
              Annuler
            </button>
            <button type="submit" className="flex-[2] h-11 rounded-xl bg-[#F5C300] text-black text-sm font-bold hover:bg-[#e6b800] transition-all">
              {driver ? 'Enregistrer' : 'Ajouter le chauffeur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}