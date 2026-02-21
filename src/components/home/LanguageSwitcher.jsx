import React from 'react';
import { useLang } from '@/components/LanguageContext';

const languages = [
{ code: 'pt', label: 'PT' },
{ code: 'fr', label: 'FR' },
{ code: 'en', label: 'EN' },
{ code: 'de', label: 'DE' },
{ code: 'it', label: 'IT' }];


export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div className="bg-black/40 text-slate-950 px-3 py-2 opacity-50 rounded-full fixed top-5 right-5 z-50 flex items-center gap-1 backdrop-blur-sm border border-[#F5C300]/20 shadow-lg">
      {languages.map((l, i) =>
      <div key={l.code} className="flex items-center gap-1">
          <button
          onClick={() => setLang(l.code)}
          className={`text-xs font-bold px-2.5 py-1 rounded-full transition-all duration-200 ${
          lang === l.code ?
          'bg-[#F5C300] text-black shadow-md' :
          'text-white/50 hover:text-[#F5C300]'}`
          }>

            {l.label}
          </button>
          {i < languages.length - 1 &&
        <span className="text-[#F5C300]/20 text-xs">|</span>
        }
        </div>
      )}
    </div>);

}