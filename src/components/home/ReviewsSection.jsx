import React from 'react';
import { Star } from 'lucide-react';
import ReviewWidget from '@/components/reviews/ReviewWidget';
import ReviewList from '@/components/reviews/ReviewList';
import ReviewForm from '@/components/reviews/ReviewForm';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function ReviewsSection() {
  const { lang } = useLang();
  const t = translations[lang];

  return (
    <section className="py-24 px-6 bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#C9A96E] text-sm tracking-[0.3em] uppercase mb-4">
            {lang === 'pt' ? 'Avaliações' : lang === 'fr' ? 'Avis' : lang === 'de' ? 'Bewertungen' : lang === 'it' ? 'Recensioni' : 'Reviews'}
          </p>
          <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
            {lang === 'pt' ? 'Comentários de Clientes' : lang === 'fr' ? 'Avis des Clients' : lang === 'de' ? 'Kundenbewertungen' : lang === 'it' ? 'Feedback dei Clienti' : 'Customer Reviews'}
          </h2>
          <div className="w-12 h-[1px] bg-[#C9A96E] mx-auto mb-6" />
        </div>

        {/* Google Reviews Widget */}
        <div className="mb-16 bg-white/[0.03] border border-white/10 rounded-2xl p-8">
          <h3 className="text-white font-medium mb-6">
            {lang === 'pt' ? 'Avaliações do Google' : lang === 'fr' ? 'Avis Google' : lang === 'de' ? 'Google-Bewertungen' : lang === 'it' ? 'Valutazioni Google' : 'Google Reviews'}
          </h3>
          <ReviewWidget />
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Reviews List */}
          <div>
            <h3 className="text-white font-medium mb-8">
              {lang === 'pt' ? 'Últimas Avaliações' : lang === 'fr' ? 'Avis Récents' : lang === 'de' ? 'Aktuelle Bewertungen' : lang === 'it' ? 'Recensioni Recenti' : 'Latest Reviews'}
            </h3>
            <ReviewList />
          </div>

          {/* Review Form */}
          <div>
            <ReviewForm />
          </div>
        </div>
      </div>
    </section>
  );
}