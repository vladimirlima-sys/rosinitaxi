import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useLang } from '@/components/LanguageContext';

const testimonials = {
  pt: [
    { name: 'Marie Dupont', city: 'Genebra', rating: 5, text: 'Excelente serviço, motorista profissional e pontual. Voltarei com certeza!' },
    { name: 'João Silva', city: 'Lausana', rating: 5, text: 'Muito bom! Processo rápido e confortável. Recomendo a todos.' },
    { name: 'Anna Rossi', city: 'Berna', rating: 5, text: 'Perfeito para meus transferes de trabalho. Confiável e seguro.' }
  ],
  fr: [
    { name: 'Marie Dupont', city: 'Genève', rating: 5, text: 'Excellent service, chauffeur professionnel et ponctuel. Je reviendrai.' },
    { name: 'Jean Martin', city: 'Lausanne', rating: 5, text: 'Très bien! Processus rapide et confortable. Je recommande!' },
    { name: 'Anna Rossi', city: 'Berne', rating: 5, text: 'Parfait pour mes transferts professionnels. Fiable et sûr.' }
  ],
  en: [
    { name: 'Marie Dupont', city: 'Geneva', rating: 5, text: 'Excellent service, professional and punctual driver. Will return for sure!' },
    { name: 'John Smith', city: 'Lausanne', rating: 5, text: 'Very good! Fast and comfortable process. Highly recommend!' },
    { name: 'Anna Rossi', city: 'Bern', rating: 5, text: 'Perfect for my business transfers. Reliable and safe.' }
  ],
  de: [
    { name: 'Marie Dupont', city: 'Genf', rating: 5, text: 'Ausgezeichneter Service, professioneller und pünktlicher Fahrer. Werde zurückkommen!' },
    { name: 'Johannes Schmidt', city: 'Lausanne', rating: 5, text: 'Sehr gut! Schneller und angenehmer Prozess. Empfehle ich!' },
    { name: 'Anna Rossi', city: 'Bern', rating: 5, text: 'Perfekt für meine Geschäftsreisen. Zuverlässig und sicher.' }
  ]
};

export default function TestimonialsSection() {
  const { lang } = useLang();
  const [current, setCurrent] = useState(0);
  const items = testimonials[lang] || testimonials.pt;

  const next = () => setCurrent((current + 1) % items.length);
  const prev = () => setCurrent((current - 1 + items.length) % items.length);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [current]);

  const t = items[current];

  return (
    <section className="py-16 px-4 bg-gradient-to-r from-[#F5C300]/10 to-transparent">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          {lang === 'pt' ? 'O Que Dizem Nossos Clientes' : lang === 'fr' ? 'Ce Que Disent Nos Clients' : lang === 'de' ? 'Das Sagen Unsere Kunden' : 'What Our Clients Say'}
        </h2>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 relative">
          <div className="flex gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-[#F5C300] text-[#F5C300]" />
            ))}
          </div>
          
          <p className="text-white text-xl md:text-2xl mb-8 italic">"{t.text}"</p>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">{t.name}</p>
              <p className="text-white/60 text-sm">{t.city}</p>
            </div>
            
            <div className="flex gap-3">
              <button onClick={prev} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button onClick={next} className="p-2 rounded-full bg-[#F5C300] hover:bg-[#E6B800] transition-all">
                <ChevronRight className="w-5 h-5 text-black" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 justify-center mt-6">
            {items.map((_, idx) => (
              <div key={idx} className={`h-2 rounded-full transition-all ${idx === current ? 'bg-[#F5C300] w-8' : 'bg-white/20 w-2'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}