import React from 'react';
import { Baby, Luggage, Accessibility, PawPrint } from 'lucide-react';

export default function ExtrasSelector({ selectedExtras, onExtrasChange, priceSettings }) {
  const extras = [
    { id: 'baby_seat', label: 'Cadeirinha de bebé', icon: Baby, price: 15 },
    { id: 'extra_luggage', label: 'Bagageiro extra', icon: Luggage, price: 25 },
    { id: 'wheelchair_accessible', label: 'Acessível a cadeira de rodas', icon: Accessibility, price: 30 },
    { id: 'pet_friendly', label: 'Animais de estimação permitidos', icon: PawPrint, price: 20 },
  ];

  const handleToggle = (extraId) => {
    if (selectedExtras.includes(extraId)) {
      onExtrasChange(selectedExtras.filter(id => id !== extraId));
    } else {
      onExtrasChange([...selectedExtras, extraId]);
    }
  };

  const totalExtrasPrice = extras
    .filter(extra => selectedExtras.includes(extra.id))
    .reduce((sum, extra) => sum + extra.price, 0);

  return (
    <div className="bg-zinc-900 p-8 rounded-2xl border border-[#C9A96E] shadow-[0_0_30px_rgba(201,169,110,0.1)]">
      <h4 className="text-white font-bold text-lg mb-6">Extras Opcionais</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {extras.map((extra) => {
          const Icon = extra.icon;
          const isSelected = selectedExtras.includes(extra.id);
          
          return (
            <button
              key={extra.id}
              onClick={() => handleToggle(extra.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-[#C9A96E] bg-[#C9A96E]/10'
                  : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-1 flex-shrink-0 ${isSelected ? 'text-[#C9A96E]' : 'text-white/60'}`} />
                <div>
                  <p className={`font-medium ${isSelected ? 'text-white' : 'text-white/70'}`}>{extra.label}</p>
                  <p className="text-sm text-white/40 mt-1">+CHF {extra.price}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {totalExtrasPrice > 0 && (
        <div className="border-t border-zinc-700 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-white/60">Total de extras:</span>
            <span className="text-[#C9A96E] font-bold text-lg">+CHF {totalExtrasPrice}</span>
          </div>
        </div>
      )}
    </div>
  );
}