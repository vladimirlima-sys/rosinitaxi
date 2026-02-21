import React from 'react';
import { ChevronDown, Clock, Shield, MapPin } from 'lucide-react';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function HeroSection({ onScrollToBooking }) {
  const { lang } = useLang();
  const t = translations[lang];

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-[#F5C300]">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=1920&q=80')" }}
      />
      
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-black tracking-tight mb-2">
          ROSINI
        </h1>
        <p className="text-lg md:text-2xl font-semibold text-black/70 tracking-[0.3em] uppercase mb-5">
          Transferts
        </p>
        
        <div className="w-16 h-[2px] bg-black mx-auto mb-5" />
        
        <p className="text-base md:text-lg text-black/70 font-medium max-w-2xl mx-auto mb-8 leading-relaxed">
          {t.heroDesc}
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {[
            { icon: Clock, label: t.pill1 },
            { icon: Shield, label: t.pill2 },
            { icon: MapPin, label: t.pill3 },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/10 border border-black/20">
              <item.icon className="w-4 h-4 text-black" />
              <span className="text-black/80 text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onScrollToBooking}
          className="group inline-flex items-center gap-3 bg-black hover:bg-black/80 text-[#F5C300] font-bold px-8 py-3 rounded-full transition-all duration-300 hover:shadow-lg"
        >
          {t.cta}
          <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
        </button>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <div className="w-[1px] h-8 bg-gradient-to-b from-transparent to-black/40" />
        <ChevronDown className="w-4 h-4 text-black/40" />
      </div>
    </section>
  );
}