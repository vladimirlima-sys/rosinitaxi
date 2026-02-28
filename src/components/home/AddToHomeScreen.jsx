import React, { useState, useEffect } from 'react';
import { Share, Plus, X } from 'lucide-react';

export default function AddToHomeScreen() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    // Android/Chrome PWA install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleAndroid = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (installed) return null;

  // Android with prompt available
  if (deferredPrompt) {
    return (
      <button
        onClick={handleAndroid}
        className="flex items-center gap-2 text-black/70 text-xs hover:text-black transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Adicionar à tela inicial
      </button>
    );
  }

  // iOS
  if (isIOS) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowIOSInstructions(o => !o)}
          className="flex items-center gap-2 text-black/70 text-xs hover:text-black transition-colors"
        >
          <Share className="w-3.5 h-3.5" />
          Adicionar à tela inicial
        </button>

        {showIOSInstructions && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded-xl p-4 w-64 shadow-xl z-50">
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="absolute top-2 right-2 text-white/50 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <p className="font-semibold mb-2">Adicionar à tela inicial</p>
            <ol className="space-y-1 text-white/70 list-decimal list-inside">
              <li>Toque em <Share className="inline w-3 h-3" /> no Safari</li>
              <li>Role e toque em <strong className="text-white">"Adicionar à tela de início"</strong></li>
              <li>Toque em <strong className="text-white">"Adicionar"</strong></li>
            </ol>
          </div>
        )}
      </div>
    );
  }

  // Fallback for other browsers (show generic instructions)
  return (
    <button
      onClick={() => alert('No seu navegador, acesse o menu (⋮) e selecione "Adicionar à tela inicial".')}
      className="flex items-center gap-2 text-black/70 text-xs hover:text-black transition-colors"
    >
      <Plus className="w-3.5 h-3.5" />
      Adicionar à tela inicial
    </button>
  );
}