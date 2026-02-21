import React, { useState, useRef, useEffect } from 'react';
import { useLang } from '@/components/LanguageContext';

const languages = [
  { code: 'pt', label: 'PT' },
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
  { code: 'it', label: 'IT' }
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = languages.find(l => l.code === lang);
  const others = languages.filter(l => l.code !== lang);

  return (
    <div ref={ref} className="fixed top-5 right-5 z-50 flex flex-col items-center gap-1">
      {/* Dropdown options */}
      {open && (
        <div className="flex flex-col items-center gap-1 mb-1">
          {others.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-white/70 text-xs font-bold hover:text-[#F5C300] hover:border-[#F5C300]/40 transition-all duration-200"
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
      {/* Current language button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-[#F5C300]/40 shadow-lg text-[#F5C300] text-xs font-bold transition-all duration-200 hover:scale-110"
      >
        {current?.label}
      </button>
    </div>
  );
}