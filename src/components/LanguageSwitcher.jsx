import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLang } from '@/components/LanguageContext';

const languages = [
  { code: 'pt', label: 'Português' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'es', label: 'Español' },
  { code: 'nl', label: 'Nederlands' },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const currentLang = languages.find(l => l.code === lang);
  const otherLanguages = languages.filter(l => l.code !== lang);

  return (
    <div className="fixed top-6 left-6 z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-black/20 rounded-lg shadow-sm hover:shadow-md transition-shadow text-sm font-medium text-black"
      >
        {currentLang?.label}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-12 left-0 bg-white border border-black/20 rounded-lg shadow-lg p-1 w-40">
          {otherLanguages.map((lang_option) => (
            <button
              key={lang_option.code}
              onClick={() => {
                setLang(lang_option.code);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-black hover:bg-black/5 rounded transition-colors"
            >
              {lang_option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}