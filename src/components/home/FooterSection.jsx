import React from 'react';
import { Phone, Mail, Clock } from 'lucide-react';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function FooterSection() {
  const { lang } = useLang();
  const t = translations[lang];

  return (
    <footer className="py-16 px-6 bg-[#080808] border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="text-white text-xl font-light tracking-tight mb-4">Rosini Transports et locations Sarl</h3>
          </div>

          <div>
            <h4 className="text-white/60 text-sm tracking-[0.2em] uppercase mb-6">{t.contact}</h4>
            <div className="space-y-4">
              <a href="mailto:taxirosini@gmail.com" className="flex items-center gap-3 text-white/40 hover:text-[#C9A96E] transition-colors text-sm">
                <Mail className="w-4 h-4" />
                taxirosini@gmail.com
              </a>
              <a href="tel:+41796505347" className="flex items-center gap-3 text-white/40 hover:text-[#C9A96E] transition-colors text-sm">
                <Phone className="w-4 h-4" />
                +41 79 650 53 47
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white/60 text-sm tracking-[0.2em] uppercase mb-6">{t.hours}</h4>
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#C9A96E] mt-0.5" />
              <div>
                <p className="text-white/60 text-sm font-medium">{t.hours24}</p>
                <p className="text-white/40 text-sm">{t.hours7}</p>
                <p className="text-white/30 text-xs mt-2">{t.hoursHoliday}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-white/5 mb-8" />

        <div className="text-center mb-8">
          <p className="text-white/30 text-sm">Chemin des Bulesses 16, 1814 La Tour-de-Peilz — Suisse</p>
        </div>

        <div className="h-[1px] bg-white/5 mb-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/20 text-sm">{t.copyright(new Date().getFullYear())}</p>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-white/30 text-xs">{t.availableNow}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}