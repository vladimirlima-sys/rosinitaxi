import React from 'react';
import { Clock, Shield, Award, Users } from 'lucide-react';
import { useLang } from '@/components/LanguageContext';

const translations = {
  pt: {
    title: 'Por Que Escolher a Rosini?',
    advantages: [
      { icon: Clock, title: 'Reserva em 30 segundos', desc: 'Processo simples e rápido' },
      { icon: Shield, title: 'Segurança Garantida', desc: 'Motoristas verificados e segurados' },
      { icon: Award, title: 'Qualidade Premium', desc: 'Frotas modernas e bem mantidas' },
      { icon: Users, title: 'Suporte 24/7', desc: 'Sempre à sua disposição' }
    ]
  },
  fr: {
    title: 'Pourquoi Choisir Rosini?',
    advantages: [
      { icon: Clock, title: 'Réservation en 30 secondes', desc: 'Processus simple et rapide' },
      { icon: Shield, title: 'Sécurité Garantie', desc: 'Chauffeurs vérifiés et assurés' },
      { icon: Award, title: 'Qualité Premium', desc: 'Flottes modernes et bien entretenues' },
      { icon: Users, title: 'Support 24/7', desc: 'Toujours à votre disposition' }
    ]
  },
  en: {
    title: 'Why Choose Rosini?',
    advantages: [
      { icon: Clock, title: 'Book in 30 seconds', desc: 'Simple and fast process' },
      { icon: Shield, title: 'Guaranteed Safety', desc: 'Verified and insured drivers' },
      { icon: Award, title: 'Premium Quality', desc: 'Modern and well-maintained fleets' },
      { icon: Users, title: '24/7 Support', desc: 'Always at your service' }
    ]
  },
  de: {
    title: 'Warum Rosini Wählen?',
    advantages: [
      { icon: Clock, title: 'Buchung in 30 Sekunden', desc: 'Einfacher und schneller Prozess' },
      { icon: Shield, title: 'Garantierte Sicherheit', desc: 'Überprüfte und versicherte Fahrer' },
      { icon: Award, title: 'Premium-Qualität', desc: 'Moderne und gut gepflegte Flotten' },
      { icon: Users, title: '24/7 Support', desc: 'Immer für Sie da' }
    ]
  }
};

export default function AdvantagesSection() {
  const { lang } = useLang();
  const t = translations[lang] || translations.pt;

  return (
    <section id="services" className="py-16 px-4 bg-black/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">{t.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.advantages.map((adv, idx) => {
            const Icon = adv.icon;
            return (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#F5C300]/30 transition-all">
                <Icon className="w-10 h-10 text-[#F5C300] mb-4" />
                <h3 className="text-white font-semibold mb-2">{adv.title}</h3>
                <p className="text-white/60 text-sm">{adv.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}