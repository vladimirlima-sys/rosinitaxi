import { MapPin, Clock, Sparkles } from 'lucide-react';
import { useLang } from '@/components/LanguageContext';

const translations = {
  fr: {
    title: 'Trajets courts disponibles 24h/24',
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
    <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-w-md mx-auto">
      <div className="flex items-start gap-3">
        <div className="bg-[#F5C300] rounded-full p-3 shrink-0">
          <Sparkles className="w-5 h-5 text-black" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg">{t.title}</h3>
          <p className="text-[#F5C300] text-sm font-medium mb-3">{t.subtitle}</p>
          <p className="text-white/70 text-sm mb-3">{t.description}</p>
          <div className="flex items-center gap-2 text-white/60 text-xs">
            <Clock className="w-3.5 h-3.5 text-[#F5C300]" />
            <span>{t.availability}</span>
          </div>
        </div>
      </div>
    </div>
  );
}