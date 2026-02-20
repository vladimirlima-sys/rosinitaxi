import React from 'react';
import { MapPin } from 'lucide-react';
import EmbeddedRouteMap from './EmbeddedRouteMap';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function RouteCard({ departure, arrival, route, distance_km, estimatedTime }) {
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
    <div className="p-8 rounded-3xl bg-gradient-to-br from-[#C9A96E]/10 to-[#C9A96E]/5 border border-[#C9A96E]/40 backdrop-blur-sm space-y-6">
      {/* Mapa */}
      <div>
        <EmbeddedRouteMap 
          departure={departure}
          arrival={arrival}
          route={route}
        />
      </div>

      {/* Info - Quilometragem e Tempo */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#C9A96E]/20 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-[#C9A96E]" />
          </div>
          <div>
            <p className="text-white/50 text-xs uppercase tracking-wide mb-1">{t.journeyDistance}</p>
            <p className="text-white text-lg font-light">{distance_km} {t.km}</p>
          </div>
        </div>

        <div className="w-[1px] h-12 bg-white/10" />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#C9A96E]/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#C9A96E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-white/50 text-xs uppercase tracking-wide mb-1">{t.journeyTime}</p>
            <p className="text-white text-lg font-light">{formatTime(estimatedTime)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}