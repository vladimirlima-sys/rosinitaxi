import React from 'react';
import { ChevronDown, Clock, Shield, MapPin } from 'lucide-react';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function HeroSection({ onScrollToBooking }) {
  const { lang } = useLang();
  const t = translations[lang];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=1920&q=80')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/80 via-[#0A0A0A]/50 to-[#0A0A0A]" />
      
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
          <div className="w-2 h-2 rounded-full bg-[#C9A96E] animate-pulse" />
          <span className="text-[#C9A96E] text-sm font-medium tracking-wider uppercase">
            {t.badge}
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white tracking-tight mb-4">
          ROSINI
        </h1>
        <p className="text-2xl md:text-3xl lg:text-4xl font-extralight text-white/60 tracking-[0.3em] uppercase mb-8">
          Transfert
        </p>
        
        <div className="w-16 h-[1px] bg-[#C9A96E] mx-auto mb-8" />
        
        <p className="text-lg md:text-xl text-white/50 font-light max-w-2xl mx-auto mb-12 leading-relaxed">
          {t.heroDesc}
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {[
            { icon: Clock, label: t.pill1 },
            { icon: Shield, label: t.pill2 },
            { icon: MapPin, label: t.pill3 },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10">
              <item.icon className="w-4 h-4 text-[#C9A96E]" />
              <span className="text-white/70 text-sm">{item.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onScrollToBooking}
          className="group inline-flex items-center gap-3 bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] font-semibold px-10 py-4 rounded-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(201,169,110,0.3)]"
        >
          {t.cta}
          <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
        </button>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <div className="w-[1px] h-8 bg-gradient-to-b from-transparent to-white/30" />
        <ChevronDown className="w-4 h-4 text-white/30" />
      </div>
    </section>
  );
}