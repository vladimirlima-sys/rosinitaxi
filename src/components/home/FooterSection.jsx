import React from 'react';
import { Phone, Mail, Clock } from 'lucide-react';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function FooterSection() {
  const { lang } = useLang();
  const t = translations[lang];

  return (
    <footer className="py-16 px-6 bg-gray-100 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div>
            <div className="mb-4">
              <h3 className="text-gray-900 text-2xl font-light tracking-tight">ROSINI</h3>
              <p className="text-gray-500 text-xs tracking-[0.15em] uppercase">Transports et locations Sarl</p>
            </div>
          </div>

          <div>
            <h4 className="text-gray-500 text-sm tracking-[0.2em] uppercase mb-6">{t.contact}</h4>
            <div className="space-y-4">
              <a href="mailto:taxirosini@gmail.com" className="flex items-center gap-3 text-gray-500 hover:text-gray-900 transition-colors text-sm">
                <Mail className="w-4 h-4" />
                taxirosini@gmail.com
              </a>
              <a href="tel:+41796505347" className="flex items-center gap-3 text-gray-500 hover:text-gray-900 transition-colors text-sm">
                <Phone className="w-4 h-4" />
                +41 79 650 53 47
              </a>
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-gray-200 mb-8" />

        <div className="text-center mb-8">
          <p className="text-gray-400 text-sm">Chemin des Bulesses 16, 1814 La Tour-de-Peilz — Suisse</p>
        </div>

        <div className="h-[1px] bg-gray-200 mb-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">{t.copyright(new Date().getFullYear())}</p>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-gray-400 text-xs">{t.availableNow}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}