import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AssignDriverModal({ booking, drivers, onAssign, onCancel }) {
  const [search, setSearch] = useState('');

  const filtered = drivers.filter(d =>
    d.status === 'active' &&
    (d.name.toLowerCase().includes(search.toLowerCase()) || (d.vehicle || '').toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-white font-semibold text-lg">Atribuir Motorista</h2>
            <p className="text-white/40 text-xs mt-1 truncate">{booking?.departure_point} → {booking?.arrival_point}</p>
          </div>
          <button onClick={onCancel} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar motorista..."
              className="w-full bg-white/10 border border-white/20 rounded-lg text-white text-sm pl-9 pr-3 py-2.5 outline-none placeholder:text-white/30 focus:border-white/50"
            />
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-white/30 text-sm text-center py-6">Nenhum motorista ativo encontrado</p>
            )}
            {filtered.map(driver => (
              <button
                key={driver.id}
                onClick={() => onAssign(driver)}
                className={`w-full text-left p-3 rounded-xl border transition-all hover:border-[#F5C300]/50 hover:bg-white/5 ${
                  booking?.driver_id === driver.id ? 'border-[#F5C300] bg-[#F5C300]/10' : 'border-white/10'
                }`}
              >
                <p className="text-white text-sm font-medium">{driver.name}</p>
                <p className="text-white/40 text-xs mt-0.5">{driver.vehicle || 'Sem veículo'} · {driver.phone}</p>
              </button>
            ))}
          </div>

          {booking?.driver_id && (
            <button
              onClick={() => onAssign(null)}
              className="w-full mt-3 h-10 rounded-xl border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-all"
            >
              Remover motorista atribuído
            </button>
          )}
        </div>
      </div>
    </div>
  );
}