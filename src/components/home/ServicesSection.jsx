import React from 'react';
import { Plane, Briefcase, MapPin, Users } from 'lucide-react';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function ServicesSection() {
  const { lang } = useLang();
  const t = translations[lang];

  const services = [
    { icon: Plane, title: t.service1Title, description: t.service1Desc },
    { icon: Briefcase, title: t.service2Title, description: t.service2Desc },
    { icon: MapPin, title: t.service3Title, description: t.service3Desc },
    { icon: Users, title: t.service4Title, description: t.service4Desc }
  ];

  return (
    <section className="py-32 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-24">
          <p className="text-black/50 text-sm tracking-[0.3em] uppercase mb-4">{t.servicesLabel}</p>
          <h2 className="text-4xl md:text-5xl font-light text-black mb-6">{t.servicesTitle}</h2>
          <div className="w-12 h-[2px] bg-black mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {services.map((service, idx) => (
            <div key={idx} className="text-center group hover:opacity-70 transition-opacity">
              <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#F5C300]/20 transition-colors">
                <service.icon className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-black font-semibold mb-2">{service.title}</h3>
              <p className="text-black/60 text-sm leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}