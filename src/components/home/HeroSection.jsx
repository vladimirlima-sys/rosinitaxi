import React from 'react';
import { ArrowRight, MapPin, Clock, Users } from 'lucide-react';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function HeroSection({ onScrollToBooking }) {
  const { lang } = useLang();
  const t = translations[lang];

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-12 px-6 bg-gradient-to-b from-white via-slate-50 to-white overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-100/30 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <div className="text-center mb-16">
          {/* Logo/Brand */}
          <div className="mb-8 inline-block">
            <div className="px-4 py-2 rounded-full bg-blue-50 border border-blue-100/50 mb-4">
              <p className="text-blue-600 text-xs font-semibold tracking-widest uppercase">Premium Transfer Service</p>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
            Your Journey, Our Commitment
          </h1>
          
          {/* Subheading */}
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.heroDesc}
          </p>

          {/* Features Pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              { icon: Clock, label: t.pill1 },
              { icon: MapPin, label: t.pill3 },
              { icon: Users, label: t.pill2 },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <item.icon className="w-4 h-4 text-blue-600" />
                <span className="text-slate-700 text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={onScrollToBooking}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:translate-y-[-2px]"
          >
            {t.cta}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-slate-400 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}