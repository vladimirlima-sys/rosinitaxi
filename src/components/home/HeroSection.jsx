import React from 'react';
import { ChevronDown, Clock, Shield, MapPin, HelpCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function HeroSection({ onScrollToBooking }) {
  const { lang } = useLang();
  const t = translations[lang];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#F5C300]">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=1920&q=80')" }}
      />
      
      <div className="relative z-10 text-center px-6 py-2 max-w-5xl mx-auto">

        <div className="mb-4 mt-0">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extralight text-black tracking-[0.15em] mb-1 leading-none">
            ROSINI
          </h1>
          <p className="text-xl md:text-2xl font-light text-black/60 tracking-[0.25em] uppercase letter-spacing mb-2">
            TÁXI
          </p>
          <p className="text-sm text-black/50 font-medium">
            Disponível 24 horas por dia
          </p>
        </div>

        <div className="w-12 h-[1px] bg-black mx-auto mb-4" />
        
        <p className="text-base md:text-lg text-black/70 font-medium max-w-2xl mx-auto mb-6 leading-relaxed">
          {t.heroDesc}
        </p>

        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-10">
          {[
            { icon: Clock, label: t.pill1 },
            { icon: Shield, label: t.pill2 },
            { icon: MapPin, label: t.pill3 },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-1.5 md:py-2.5 rounded-full bg-black/10 border border-black/20">
              <item.icon className="w-3.5 md:w-4 h-3.5 md:h-4 text-black" />
              <span className="text-black/80 text-xs md:text-sm font-medium whitespace-nowrap">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={onScrollToBooking}
            className="group inline-flex items-center gap-3 bg-black hover:bg-black/80 text-[#F5C300] font-bold px-8 py-3 rounded-full transition-all duration-300 hover:shadow-lg"
          >
            {t.cta}
            <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </button>
          <a
            href={createPageUrl('FAQ')}
            className="inline-flex items-center gap-2 bg-black/10 hover:bg-black/20 text-black font-semibold px-6 py-3 rounded-full border border-black/20 transition-all duration-300"
          >
            <HelpCircle className="w-4 h-4" />
            FAQ
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <div className="w-[1px] h-8 bg-gradient-to-b from-transparent to-black/40" />
        <ChevronDown className="w-4 h-4 text-black/40" />
      </div>
    </section>
  );
}