import { useState } from 'react';
import { X, Tag, Sparkles } from 'lucide-react';

export default function MarchPromoBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-black text-[#F5C300] shadow-lg">
      <div className="relative flex items-center justify-center gap-3 px-6 py-3 text-center">
        {/* Left sparkle */}
        <Sparkles className="w-5 h-5 text-[#F5C300] shrink-0 hidden sm:block" />

        {/* Main content */}
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
          <span className="text-sm sm:text-base font-extrabold uppercase tracking-widest">
            🎁 Março
          </span>
          <span className="text-sm sm:text-base font-light text-white">·</span>
          <span className="text-sm sm:text-base font-semibold text-white">
            -10% na sua reserva!
          </span>
          <span className="hidden sm:inline text-sm sm:text-base font-light text-white">·</span>
          <span className="text-sm sm:text-base text-white/70">
            Use o código
          </span>
          <span className="bg-[#F5C300] text-black font-black text-sm sm:text-base px-3 py-0.5 rounded-md tracking-widest font-mono shadow">
            MARCO10
          </span>
          <span className="text-white/50 text-xs sm:text-sm">
            (válido até 31 Mar)
          </span>
        </div>

        {/* Right sparkle */}
        <Sparkles className="w-5 h-5 text-[#F5C300] shrink-0 hidden sm:block" />

        {/* Close button */}
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