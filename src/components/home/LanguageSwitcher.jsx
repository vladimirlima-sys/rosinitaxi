import React from 'react';
import { useLang } from '@/components/LanguageContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const languages = [
  { code: 'pt', label: 'Português' },
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % languages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + languages.length) % languages.length);
  };

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full px-4 py-3">
      <button
        onClick={handlePrev}
        className="text-white/40 hover:text-white/70 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 min-w-[150px]">
        {languages.map((l, index) => (
          <button
            key={l.code}
            onClick={() => {
              setLang(l.code);
              setCurrentIndex(index);
            }}
            className={`px-3 py-1.5 rounded-full transition-all text-sm font-medium whitespace-nowrap ${
              lang === l.code
                ? 'bg-[#C9A96E] text-[#0A0A0A]'
                : index === currentIndex
                ? 'bg-white/10 text-white/70'
                : 'hidden'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <button
        onClick={handleNext}
        className="text-white/40 hover:text-white/70 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}