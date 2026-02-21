import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function FooterSection() {
  const { lang } = useLang();
  const t = translations[lang];

  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">ROSINI</h2>
            <p className="text-slate-400 text-sm mb-4">Premium Transfer Service</p>
            <p className="text-slate-500 text-sm leading-relaxed">
              {t.footerDesc}
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-6">{t.contact}</h3>
            <div className="space-y-4">
              <a href="mailto:taxirosini@gmail.com" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
                <Mail className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                <span className="text-sm">taxirosini@gmail.com</span>
              </a>
              <a href="tel:+41796505347" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
                <Phone className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                <span className="text-sm">+41 79 650 53 47</span>
              </a>
              <div className="flex items-center gap-3 text-slate-400">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span className="text-sm">La Tour-de-Peilz, CH</span>
              </div>
            </div>
          </div>

          {/* Hours & Status */}
          <div>
            <h3 className="text-white font-semibold mb-6">{t.hours}</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 flex-shrink-0 animate-pulse" />
                <div>
                  <p className="text-sm text-slate-400">{t.availableNow}</p>
                  <p className="text-xs text-slate-500">{t.hours24}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">{t.hours7}</p>
              <p className="text-xs text-slate-500">{t.hoursHoliday}</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-slate-700 mb-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">{t.copyright(new Date().getFullYear())}</p>
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <span>Powered by Base44</span>
          </div>
        </div>
      </div>
    </footer>
  );
}