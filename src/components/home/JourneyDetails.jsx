import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function JourneyDetails({ distance_km, estimatedTime }) {
  const { lang } = useLang();
  const t = translations[lang];

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}${t.hours} ${mins}${t.minutes}`;
    } else if (hours > 0) {
      return `${hours}${t.hours}`;
    } else {
      return `${mins}${t.minutes}`;
    }
  };

  if (!distance_km) return null;

  return (
    <div className="p-6 rounded-2xl bg-white/[0.03] border border-[#C9A96E]/20">
      <h4 className="text-white/60 text-sm uppercase tracking-wider mb-4">{t.journeyDetails}</h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-[#C9A96E]" />
          <div>
            <p className="text-white/40 text-xs">{t.journeyDistance}</p>
            <p className="text-white text-lg font-medium">{distance_km} {t.km}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-[#C9A96E]" />
          <div>
            <p className="text-white/40 text-xs">{t.journeyTime}</p>
            <p className="text-white text-lg font-medium">{formatTime(estimatedTime)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}