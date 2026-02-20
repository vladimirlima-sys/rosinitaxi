import React from 'react';
import { useLang } from '@/components/LanguageContext';

const languages = [
  { code: 'pt', label: '🇧🇷' },
  { code: 'fr', label: '🇫🇷' },
  { code: 'en', label: '🇬🇧' },
  { code: 'de', label: '🇩🇪' },
  { code: 'it', label: '🇮🇹' },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-1 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full px-2 py-1.5">
      {languages.map((l, i) => (
        <React.Fragment key={l.code}>
          <button
            onClick={() => setLang(l.code)}
            className={`text-xs font-medium px-2 py-0.5 rounded-full transition-all ${
              lang === l.code
                ? 'bg-[#C9A96E] text-[#0A0A0A]'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {l.label}
          </button>
          {i < languages.length - 1 && (
            <span className="text-white/10 text-xs">|</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}