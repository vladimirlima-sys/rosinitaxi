import React from 'react';
import { Plane, MapPin } from 'lucide-react';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function ServicesSection() {
  const { lang } = useLang();
  const t = translations[lang];

  const services = [
    { icon: Plane, title: t.service1Title, description: t.service1Desc },
    { icon: MapPin, title: t.service3Title, description: t.service3Desc },
  ];

  return (
    <section className="py-24 px-6 bg-[#0F0F0F]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#C9A96E] text-sm tracking-[0.3em] uppercase mb-4">{t.servicesLabel}</p>
          <h2 className="text-3xl md:text-4xl font-light text-white mb-4">{t.servicesTitle}</h2>
          <div className="w-12 h-[1px] bg-[#C9A96E] mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {services.map((service, i) => (
            <div 
              key={i}
              className="group p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-[#C9A96E]/30 hover:bg-white/[0.05] transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-xl bg-[#C9A96E]/10 flex items-center justify-center mb-6 group-hover:bg-[#C9A96E]/20 transition-colors">
                <service.icon className="w-5 h-5 text-[#C9A96E]" />
              </div>
              <h3 className="text-white font-medium text-lg mb-3">{service.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}