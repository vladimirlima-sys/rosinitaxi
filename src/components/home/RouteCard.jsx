import React from 'react';
import { MapPin } from 'lucide-react';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function RouteCard({ departure, arrival, distance_km, estimatedTime }) {
  const { lang } = useLang();
  const t = translations[lang];

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}${t.hours} ${mins}${t.minutes}`;
    }
    return `${mins}${t.minutes}`;
  };

  return (
    <div className="p-8 rounded-3xl bg-white/60 border border-black/10">
      {/* Info - Quilometragem e Tempo */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-black" />
          </div>
          <div>
            <p className="text-black/50 text-xs uppercase tracking-wide mb-1">{t.journeyDistance}</p>
            <p className="text-black text-lg font-bold">{distance_km} {t.km}</p>
          </div>
        </div>

        <div className="w-[1px] h-12 bg-black/15" />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-black/50 text-xs uppercase tracking-wide mb-1">{t.journeyTime}</p>
            <p className="text-black text-lg font-bold">{formatTime(estimatedTime)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}