import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { User, ChevronDown } from 'lucide-react';

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
  const [open, setOpen] = useState(false);
  const l = LABELS[lang] || LABELS.fr;

  useEffect(() => {
    base44.entities.Driver.filter({ status: 'active' }).then(setDrivers).catch(() => {});
  }, []);

  if (!drivers.length) return null;

  const items = [null, ...drivers];
  const selectedItem = selectedDriverId === null || selectedDriverId === undefined
    ? null
    : drivers.find(d => d.id === selectedDriverId) || null;

  const selectedLabel = selectedItem ? selectedItem.name : l.none;

  return (
    <div>
      <p className="text-white/60 text-xs uppercase tracking-wider mb-3">{l.title}</p>

      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-3 rounded-lg border border-white/20 hover:border-white/40 transition-all"
      >
        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white/60" />
        </div>
        <span className={`flex-1 text-left text-sm ${selectedItem === null && selectedDriverId === undefined ? 'text-white/50 italic' : 'text-white'}`}>
          {selectedLabel}
        </span>
        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown list */}
      {open && (
        <div className="mt-2 flex flex-col gap-1">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => { onSelect(item); setOpen(false); }}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all w-full text-left ${
                (item === null ? (selectedDriverId === null || selectedDriverId === undefined) : item.id === selectedDriverId)
                  ? 'border-[#F5C300] bg-[#F5C300]/10'
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white/60" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${item === null ? 'text-white/50 italic' : 'text-white'}`}>
                  {item === null ? l.none : item.name}
                </p>
                {item !== null && item.vehicle && (
                  <p className="text-white/40 text-xs truncate">{item.vehicle}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}