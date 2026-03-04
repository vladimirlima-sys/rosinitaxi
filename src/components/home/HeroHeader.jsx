import React from 'react';
import { useLang } from '@/components/LanguageContext';

const translations = {
  pt: {
    headline: 'Transferências de Luxo na Suíça',
    subheadline: 'Reserva seu táxi em segundos. Conforto, segurança e pontualidade garantidos.',
    cta: 'Reservar Agora'
  },
  fr: {
    headline: 'Transferts de Luxe en Suisse',
    subheadline: 'Réservez votre taxi en quelques secondes. Confort, sécurité et ponctualité garantis.',
    cta: 'Réserver Maintenant'
  },
  en: {
    headline: 'Luxury Transfers in Switzerland',
    subheadline: 'Book your taxi in seconds. Comfort, safety and punctuality guaranteed.',
    cta: 'Book Now'
  },
  de: {
    headline: 'Luxustransfers in der Schweiz',
    subheadline: 'Buchen Sie Ihr Taxi in Sekunden. Komfort, Sicherheit und Pünktlichkeit garantiert.',
    cta: 'Jetzt Buchen'
  }
};

export default function HeroHeader({ onBookClick }) {
  const { lang } = useLang();
  const t = translations[lang] || translations.pt;

  return (
    <div className="pt-20 pb-12 px-4 bg-gradient-to-b from-black/40 to-transparent text-center">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
        {t.headline}
      </h1>
      <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
        {t.subheadline}
      </p>
      <button
        onClick={onBookClick}
        className="bg-[#F5C300] hover:bg-[#E6B800] text-black font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl"
      >
        {t.cta}
      </button>
    </div>
  );
}