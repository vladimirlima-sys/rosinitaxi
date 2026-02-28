import React, { useState, useEffect } from 'react';
import { Share, Plus, X } from 'lucide-react';
import { useLang } from '@/components/LanguageContext';

const texts = {
  pt: {
    btn: 'Adicionar à tela inicial',
    title: 'Adicionar à tela inicial',
    step1: 'Toque em', step1b: 'no Safari',
    step2: 'Role e toque em', step2b: '"Adicionar à tela de início"',
    step3: 'Toque em', step3b: '"Adicionar"',
    fallback: 'No seu navegador, acesse o menu (⋮) e selecione "Adicionar à tela inicial".',
  },
  fr: {
    btn: "Ajouter à l'écran d'accueil",
    title: "Ajouter à l'écran d'accueil",
    step1: 'Appuyez sur', step1b: 'dans Safari',
    step2: 'Faites défiler et appuyez sur', step2b: '"Sur l\'écran d\'accueil"',
    step3: 'Appuyez sur', step3b: '"Ajouter"',
    fallback: "Dans votre navigateur, ouvrez le menu (⋮) et sélectionnez \"Ajouter à l'écran d'accueil\".",
  },
  en: {
    btn: 'Add to Home Screen',
    title: 'Add to Home Screen',
    step1: 'Tap', step1b: 'in Safari',
    step2: 'Scroll and tap', step2b: '"Add to Home Screen"',
    step3: 'Tap', step3b: '"Add"',
    fallback: 'In your browser, open the menu (⋮) and select "Add to Home Screen".',
  },
  de: {
    btn: 'Zum Startbildschirm hinzufügen',
    title: 'Zum Startbildschirm hinzufügen',
    step1: 'Tippe auf', step1b: 'in Safari',
    step2: 'Scrolle und tippe auf', step2b: '"Zum Home-Bildschirm"',
    step3: 'Tippe auf', step3b: '"Hinzufügen"',
    fallback: 'Öffnen Sie im Browser das Menü (⋮) und wählen Sie "Zum Startbildschirm hinzufügen".',
  },
  it: {
    btn: 'Aggiungi alla schermata iniziale',
    title: 'Aggiungi alla schermata iniziale',
    step1: 'Tocca', step1b: 'in Safari',
    step2: 'Scorri e tocca', step2b: '"Aggiungi a Home"',
    step3: 'Tocca', step3b: '"Aggiungi"',
    fallback: 'Nel browser, apri il menu (⋮) e seleziona "Aggiungi alla schermata iniziale".',
  },
  es: {
    btn: 'Añadir a la pantalla de inicio',
    title: 'Añadir a la pantalla de inicio',
    step1: 'Toca', step1b: 'en Safari',
    step2: 'Desplázate y toca', step2b: '"En pantalla de inicio"',
    step3: 'Toca', step3b: '"Añadir"',
    fallback: 'En tu navegador, abre el menú (⋮) y selecciona "Añadir a la pantalla de inicio".',
  },
  nl: {
    btn: 'Toevoegen aan beginscherm',
    title: 'Toevoegen aan beginscherm',
    step1: 'Tik op', step1b: 'in Safari',
    step2: 'Scroll en tik op', step2b: '"Zet op beginscherm"',
    step3: 'Tik op', step3b: '"Voeg toe"',
    fallback: 'Open in uw browser het menu (⋮) en selecteer "Toevoegen aan beginscherm".',
  },
};

export default function AddToHomeScreen() {
  const { lang } = useLang();
  const t = texts[lang] || texts['fr'];

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
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

  if (deferredPrompt) {
    return (
      <button onClick={handleAndroid} className="flex items-center gap-2 text-black/70 text-xs hover:text-black transition-colors">
        <Plus className="w-3.5 h-3.5" />
        {t.btn}
      </button>
    );
  }

  if (isIOS) {
    return (
      <div className="relative">
        <button onClick={() => setShowIOSInstructions(o => !o)} className="flex items-center gap-2 text-black/70 text-xs hover:text-black transition-colors">
          <Share className="w-3.5 h-3.5" />
          {t.btn}
        </button>
        {showIOSInstructions && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded-xl p-4 w-64 shadow-xl z-50">
            <button onClick={() => setShowIOSInstructions(false)} className="absolute top-2 right-2 text-white/50 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
            <p className="font-semibold mb-2">{t.title}</p>
            <ol className="space-y-1 text-white/70 list-decimal list-inside">
              <li>{t.step1} <Share className="inline w-3 h-3" /> {t.step1b}</li>
              <li>{t.step2} <strong className="text-white">{t.step2b}</strong></li>
              <li>{t.step3} <strong className="text-white">{t.step3b}</strong></li>
            </ol>
          </div>
        )}
      </div>
    );
  }

  return (
    <button onClick={() => alert(t.fallback)} className="flex items-center gap-2 text-black/70 text-xs hover:text-black transition-colors">
      <Plus className="w-3.5 h-3.5" />
      {t.btn}
    </button>
  );
}