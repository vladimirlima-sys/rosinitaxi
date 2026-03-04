import React from 'react';
import { Trash2, X } from 'lucide-react';

export default function DeleteDriverModal({ driver, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
          <button onClick={onCancel} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>
          <h2 className="text-white font-semibold text-lg">Supprimer le chauffeur</h2>
          <p className="text-white/50 text-sm mt-1">
            Êtes-vous sûr de vouloir supprimer <span className="text-white font-medium">{driver.name}</span> ? Cette action est irréversible.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-11 rounded-xl border border-white/20 text-white/70 text-sm font-medium hover:bg-white/10 transition-all"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-11 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}