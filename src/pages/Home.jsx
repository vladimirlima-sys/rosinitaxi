import React, { useRef } from 'react';
import BookingForm from '@/components/home/BookingForm';
import LanguageSwitcher from '@/components/home/LanguageSwitcher';
import SeoHead from '@/components/SeoHead';
import { LanguageProvider, useLang } from '@/components/LanguageContext';
import { createPageUrl } from '@/utils';
import { HelpCircle } from 'lucide-react';

function HomeContent({ bookingRef }) {
  const { lang } = useLang();
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    console.log('HomeContent mounted, lang:', lang);
    const handleError = (event) => {
      console.error('App error:', event.error);
      setError(event.error?.message || 'Erro ao carregar a página');
    };
    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      setError(event.reason?.message || 'Erro: ' + String(event.reason));
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5C300] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-black text-lg font-bold mb-2">Erro ao carregar</p>
          <p className="text-black/60 text-sm mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-black text-white px-4 py-2 rounded-lg">Recarregar</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SeoHead lang={lang} />
      <div className="min-h-screen bg-[#F5C300]">
        <a
          href={createPageUrl('FAQ')} className="fixed top-5 left-5 z-50 bg-black text-[#F5C300] p-2.5 opacity-40 rounded-full flex items-center gap-1.5 hover:bg-black/80 transition-all shadow">
          <HelpCircle className="w-5 h-5" />
        </a>
        <div className="fixed top-5 right-5 z-50">
          <LanguageSwitcher />
        </div>
        <BookingForm bookingRef={bookingRef} />
      </div>
    </>);

}

export default function Home() {
  const bookingRef = useRef(null);
  return (
    <LanguageProvider>
      <HomeContent bookingRef={bookingRef} />
    </LanguageProvider>);

}