import React, { useEffect, useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';

const LABELS = {
  fr: { title: 'Chauffeur préféré (optionnel)', none: 'Aucune préférence', selected: 'Sélectionné' },
  pt: { title: 'Motorista preferido (opcional)', none: 'Sem preferência', selected: 'Selecionado' },
  en: { title: 'Preferred driver (optional)', none: 'No preference', selected: 'Selected' },
  de: { title: 'Bevorzugter Fahrer (optional)', none: 'Keine Präferenz', selected: 'Ausgewählt' },
  it: { title: 'Autista preferito (opzionale)', none: 'Nessuna preferenza', selected: 'Selezionato' },
  es: { title: 'Conductor preferido (opcional)', none: 'Sin preferencia', selected: 'Seleccionado' },
  nl: { title: 'Voorkeurschauffeur (optioneel)', none: 'Geen voorkeur', selected: 'Geselecteerd' },
};

export default function PreferredDriverSelector({ lang = 'fr', selectedDriverId, onSelect }) {
  const [drivers, setDrivers] = useState([]);
  const [index, setIndex] = useState(0);
  const l = LABELS[lang] || LABELS.fr;

  useEffect(() => {
    base44.entities.Driver.filter({ status: 'active' }).then(setDrivers).catch(() => {});
  }, []);

  if (!drivers.length) return null;

  // All items: [null = no preference, ...drivers]
  const items = [null, ...drivers];
  const current = items[index];

  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setIndex((i) => (i + 1) % items.length);

  const isSelected = (item) =>
    item === null ? selectedDriverId === null || selectedDriverId === undefined : item.id === selectedDriverId;

  const handleSelect = () => {
    if (current === null) {
      onSelect(null);
    } else {
      onSelect(current);
    }
  };

  return (
    <div>
      <p className="text-white/60 text-xs uppercase tracking-wider mb-3">{l.title}</p>
      <div className="flex items-center gap-3">
        <button onClick={prev} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0">
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>

        <button
          onClick={handleSelect}
          className={`flex-1 flex items-center gap-3 p-3 rounded-lg border transition-all ${
            isSelected(current)
              ? 'border-[#F5C300] bg-[#F5C300]/10'
              : 'border-white/20 hover:border-white/40'
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white/60" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${current === null ? 'text-white/50 italic' : 'text-white'}`}>
              {current === null ? l.none : current.name}
            </p>
            {current !== null && current.vehicle && (
              <p className="text-white/40 text-xs truncate">{current.vehicle}</p>
            )}
          </div>
          {isSelected(current) && (
            <span className="text-[#F5C300] text-xs flex-shrink-0">{l.selected}</span>
          )}
        </button>

        <button onClick={next} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0">
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1 mt-3">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === index ? 'bg-[#F5C300]' : 'bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  );
}