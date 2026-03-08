import { MapPin, Clock, Sparkles } from 'lucide-react';
import { useLang } from '@/components/LanguageContext';

const translations = {
  fr: {
    title: 'Votre partenaire pour les transferts longue distance et les trajets locaux dans la Riviera.',
    subtitle: 'Région de la Riviera',
    description: 'Nous acceptons les trajets courts dans la région de Vevey, La Tour-de-Peilz, Montreux et environs.',
    availability: 'Disponible 24 heures sur 24',
  },
  pt: {
    title: 'Trajetos curtos disponíveis 24h/24',
    subtitle: 'Região da Riviera',
    description: 'Aceitamos trajetos curtos na região de Vevey, La Tour-de-Peilz, Montreux e arredores.',
    availability: 'Disponível 24 horas por dia',
  },
  en: {
    title: 'Short trips available 24/7',
    subtitle: 'Riviera region',
    description: 'We accept short trips in the Vevey, La Tour-de-Peilz, Montreux and surrounding areas.',
    availability: 'Available 24/7',
  },
  de: {
    title: 'Kurze Fahrten 24/7 verfügbar',
    subtitle: 'Riviera-Region',
    description: 'Wir akzeptieren kurze Fahrten in der Region Vevey, La Tour-de-Peilz, Montreux und Umgebung.',
    availability: 'Rund um die Uhr verfügbar',
  },
  it: {
    title: 'Brevi tragitti disponibili 24/7',
    subtitle: 'Regione della Riviera',
    description: 'Accettiamo brevi tragitti nella regione di Vevey, La Tour-de-Peilz, Montreux e dintorni.',
    availability: 'Disponibile 24/7',
  },
  es: {
    title: 'Trayectos cortos disponibles 24/7',
    subtitle: 'Región de la Riviera',
    description: 'Aceptamos trayectos cortos en la región de Vevey, La Tour-de-Peilz, Montreux y alrededores.',
    availability: 'Disponible 24/7',
  },
  nl: {
    title: 'Korte ritten beschikbaar 24/7',
    subtitle: 'Riviëra-regio',
    description: 'We accepteren korte ritten in de regio Vevey, La Tour-de-Peilz, Montreux en omgeving.',
    availability: 'Beschikbaar 24/7',
  },
};

export default function RivieraCard() {
  const { lang } = useLang();
  const t = translations[lang] || translations.fr;

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.6; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.3; }
        }
        .floating-letter {
          animation: float 4s ease-in-out infinite;
          position: absolute;
          font-size: 2rem;
          font-weight: bold;
          color: rgba(245, 195, 0, 0.5);
          pointer-events: none;
          z-index: 0;
        }
      `}</style>
      <div className="bg-black/50 backdrop-blur-sm border-b border-white/10 px-6 py-3 relative z-10 overflow-hidden">
      {['R', 'I', 'V', 'I', 'A'].map((letter, i) => (
        <div
          key={i}
          className="floating-letter"
          style={{
            left: `${(i + 1) * 15}%`,
            top: `${Math.sin(i) * 10}px`,
            animationDelay: `${i * 0.2}s`,
          }}
        >
          {letter}
        </div>
      ))}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-[#F5C300] rounded-full p-2 shrink-0">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">{t.title}</p>
            <p className="text-white/60 text-xs">{t.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-white/60 text-xs md:shrink-0 md:whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-[#F5C300]" />
          <span>{t.availability}</span>
        </div>
      </div>
      </div>
    </>
  );
}