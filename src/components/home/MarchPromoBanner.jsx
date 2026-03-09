import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useLang } from '@/components/LanguageContext';

const t = {
  fr: { month: '🎁 Mars', discount: '-10% sur votre trajet !', use: 'Utilisez le code', valid: '(valide jusqu\'au 31 Mar)' },
  pt: { month: '🎁 Março', discount: '-10% na sua reserva!', use: 'Use o código', valid: '(válido até 31 Mar)' },
  en: { month: '🎁 March', discount: '-10% on your ride!', use: 'Use code', valid: '(valid until Mar 31)' },
  de: { month: '🎁 März', discount: '-10% auf Ihre Fahrt!', use: 'Code verwenden', valid: '(gültig bis 31. Mär)' },
  it: { month: '🎁 Marzo', discount: '-10% sulla tua corsa!', use: 'Usa il codice', valid: '(valido fino al 31 Mar)' },
  es: { month: '🎁 Marzo', discount: '-10% en tu viaje!', use: 'Usa el código', valid: '(válido hasta el 31 Mar)' },
  nl: { month: '🎁 Maart', discount: '-10% op uw rit!', use: 'Gebruik code', valid: '(geldig tot 31 Mar)' },
};

export default function MarchPromoBanner() {
  const [visible, setVisible] = useState(true);
  const { lang } = useLang();
  const tx = t[lang] || t.fr;

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-black text-[#F5C300] shadow-lg">
      <div className="relative flex items-center justify-center gap-3 px-6 py-3 text-center">
        <Sparkles className="w-5 h-5 text-[#F5C300] shrink-0 hidden sm:block" />

        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
          <span className="text-sm sm:text-base font-extrabold uppercase tracking-widest">
            {tx.month}
          </span>
          <span className="text-sm sm:text-base font-light text-white">·</span>
          <span className="text-sm sm:text-base font-semibold text-white">
            {tx.discount}
          </span>
          <span className="hidden sm:inline text-sm sm:text-base font-light text-white">·</span>
          <span className="text-sm sm:text-base text-white/70">
            {tx.use}
          </span>
          <span className="bg-[#F5C300] text-black font-black text-sm sm:text-base px-3 py-0.5 rounded-md tracking-widest font-mono shadow">
            ROSINI10
          </span>
          <span className="text-white/50 text-xs sm:text-sm">
            {tx.valid}
          </span>
        </div>

        <Sparkles className="w-5 h-5 text-[#F5C300] shrink-0 hidden sm:block" />

        <button
          onClick={() => setVisible(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}