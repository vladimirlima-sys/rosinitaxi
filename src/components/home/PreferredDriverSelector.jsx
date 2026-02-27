import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { UserCheck } from 'lucide-react';

const preferredDriverLabels = {
  pt: {
    title: 'Tem um motorista preferido?',
    subtitle: 'Escolha aqui',
    noPreference: 'Sem preferência',
    noPreferenceDesc: 'Qualquer motorista disponível',
  },
  fr: {
    title: 'Vous avez un chauffeur préféré ?',
    subtitle: 'Choisissez ici',
    noPreference: 'Aucune préférence',
    noPreferenceDesc: 'Tout chauffeur disponible',
  },
  en: {
    title: 'Do you have a preferred driver?',
    subtitle: 'Choose here',
    noPreference: 'No preference',
    noPreferenceDesc: 'Any available driver',
  },
  de: {
    title: 'Haben Sie einen bevorzugten Fahrer?',
    subtitle: 'Hier auswählen',
    noPreference: 'Keine Präferenz',
    noPreferenceDesc: 'Jeder verfügbare Fahrer',
  },
  it: {
    title: 'Hai un autista preferito?',
    subtitle: 'Scegli qui',
    noPreference: 'Nessuna preferenza',
    noPreferenceDesc: 'Qualsiasi autista disponibile',
  },
  es: {
    title: '¿Tienes un conductor preferido?',
    subtitle: 'Elige aquí',
    noPreference: 'Sin preferencia',
    noPreferenceDesc: 'Cualquier conductor disponible',
  },
  nl: {
    title: 'Heeft u een voorkeurschauffeur?',
    subtitle: 'Kies hier',
    noPreference: 'Geen voorkeur',
    noPreferenceDesc: 'Elke beschikbare chauffeur',
  },
};

export default function PreferredDriverSelector({ lang = 'fr', selectedDriverId, onSelect }) {
  const [drivers, setDrivers] = useState([]);
  const tl = preferredDriverLabels[lang] || preferredDriverLabels['fr'];

  useEffect(() => {
    base44.entities.Driver.filter({ status: 'active' }).then(setDrivers).catch(() => {});
  }, []);

  if (drivers.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="text-center">
        <p className="text-white font-semibold text-sm uppercase tracking-wider">{tl.title}</p>
        <p className="text-[#F5C300] text-xs mt-0.5">{tl.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {/* No preference option */}
        <div
          onClick={() => onSelect(null)}
          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
            !selectedDriverId
              ? 'bg-white/10 border-white/40'
              : 'bg-black border-white/10 hover:border-white/30'
          }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!selectedDriverId ? 'bg-white/20' : 'bg-white/5'}`}>
            <UserCheck className={`w-4 h-4 ${!selectedDriverId ? 'text-white' : 'text-white/40'}`} />
          </div>
          <div>
            <p className={`text-sm font-medium ${!selectedDriverId ? 'text-white' : 'text-white/60'}`}>{tl.noPreference}</p>
            <p className="text-white/30 text-xs">{tl.noPreferenceDesc}</p>
          </div>
          {!selectedDriverId && (
            <div className="ml-auto w-4 h-4 rounded-full bg-[#F5C300] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-black" />
            </div>
          )}
        </div>

        {/* Driver cards */}
        {drivers.map((driver) => (
          <div
            key={driver.id}
            onClick={() => onSelect(driver)}
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              selectedDriverId === driver.id
                ? 'bg-[#F5C300]/10 border-[#F5C300]/60'
                : 'bg-black border-white/10 hover:border-white/30'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
              selectedDriverId === driver.id ? 'bg-[#F5C300] text-black' : 'bg-white/10 text-white/60'
            }`}>
              {driver.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${selectedDriverId === driver.id ? 'text-[#F5C300]' : 'text-white'}`}>{driver.name}</p>
              {driver.vehicle && <p className="text-white/40 text-xs truncate">{driver.vehicle}</p>}
            </div>
            {selectedDriverId === driver.id && (
              <div className="ml-auto w-4 h-4 rounded-full bg-[#F5C300] flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-black" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}