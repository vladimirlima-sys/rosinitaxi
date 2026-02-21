import React from 'react';
import { ChevronDown, Clock, Shield, MapPin, ArrowRight } from 'lucide-react';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function HeroSection({ onScrollToBooking }) {
  const { lang } = useLang();
  const t = translations[lang];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=1920&q=80')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
      
      <div className="relative z-10 text-left px-6 max-w-5xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/80 text-xs font-medium tracking-widest uppercase">{t.badge}</span>
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-none mb-3">
          ROSINI
        </h1>
        <p className="text-lg md:text-2xl font-light text-white/40 tracking-[0.25em] uppercase mb-10">
          Transports et locations Sarl
        </p>
        
        <p className="text-base md:text-lg text-white/55 font-light max-w-xl mb-12 leading-relaxed">
          {t.heroDesc}
        </p>

        <div className="flex flex-wrap gap-3 mb-14">
          {[
            { icon: Clock, label: t.pill1 },
            { icon: Shield, label: t.pill2 },
            { icon: MapPin, label: t.pill3 },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 border border-white/15 backdrop-blur-sm">
              <item.icon className="w-3.5 h-3.5 text-white/60" />
              <span className="text-white/60 text-xs font-medium">{item.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onScrollToBooking}
          className="group inline-flex items-center gap-3 bg-white hover:bg-white/90 text-black font-bold px-10 py-4 rounded-full transition-all duration-200 text-sm tracking-wide"
        >
          {t.cta}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <div className="w-[1px] h-8 bg-gradient-to-b from-transparent to-white/20" />
        <ChevronDown className="w-4 h-4 text-white/20" />
      </div>
    </section>
  );
}