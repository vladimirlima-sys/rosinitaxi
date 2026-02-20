import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

export default function RoutePreferences({ preferences, onPreferenceChange, onAddWaypoint }) {
  const routeOptions = [
    { value: 'best_guess', label: 'Recomendada' },
    { value: 'fastest', label: 'Mais rápida' },
    { value: 'shortest', label: 'Mais curta' }
  ];

  const avoidOptions = [
    { value: 'tolls', label: 'Portagens' },
    { value: 'highways', label: 'Autoestradas' },
    { value: 'ferries', label: 'Balsas' }
  ];

  return (
    <div className="space-y-4 p-4 rounded-lg border border-white/10 bg-white/[0.02]">
      <div className="space-y-3">
        <div>
          <label className="text-white/60 text-sm mb-2 block">Tipo de Rota</label>
          <div className="flex gap-2 flex-wrap">
            {routeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => onPreferenceChange('routeType', option.value)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  preferences.routeType === option.value
                    ? 'bg-[#C9A96E] text-[#0A0A0A] font-medium'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-white/60 text-sm mb-2 block">Evitar</label>
          <div className="flex gap-2 flex-wrap">
            {avoidOptions.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  const newAvoid = preferences.avoid.includes(option.value)
                    ? preferences.avoid.filter(v => v !== option.value)
                    : [...preferences.avoid, option.value];
                  onPreferenceChange('avoid', newAvoid);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  preferences.avoid.includes(option.value)
                    ? 'bg-red-500/30 text-red-200 border border-red-500/50'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onAddWaypoint}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#C9A96E]/20 text-[#C9A96E] hover:bg-[#C9A96E]/30 border border-[#C9A96E]/50 text-sm transition-all"
      >
        <Plus className="w-4 h-4" /> Adicionar paragem
      </button>
    </div>
  );
}