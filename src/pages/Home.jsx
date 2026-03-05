import React, { useRef } from 'react';
import HomeLayout from '@/components/home/HomeLayout';
import LanguageSwitcher from '@/components/home/LanguageSwitcher';
import SeoHead from '@/components/SeoHead';
import { LanguageProvider, useLang } from '@/components/LanguageContext';
import { createPageUrl } from '@/utils';
import { HelpCircle } from 'lucide-react';

function HomeContent({ bookingRef }) {
  const { lang } = useLang();
  return (
    <>
      <SeoHead lang={lang} />
      <div className="relative w-full h-screen">
        <HomeLayout bookingRef={bookingRef} />
        
        {/* Fixed Header Controls */}
        <a
          href={createPageUrl('FAQ')} 
          className="fixed top-5 left-5 z-50 bg-black text-[#F5C300] p-2.5 rounded-full flex items-center gap-1.5 hover:bg-black/80 transition-all shadow"
        >
          <HelpCircle className="w-5 h-5" />
        </a>
        
        <div className="fixed top-5 right-5 z-50">
          <LanguageSwitcher />
        </div>

        <div className="fixed bottom-6 right-6 z-40">
          <a href={createPageUrl('DriverPortal')} title="Portal do Motorista">
            <img src="https://flagcdn.com/ch.svg" alt="Suíça" className="w-12 h-8 rounded shadow-lg cursor-pointer hover:opacity-80 transition-opacity" />
          </a>
        </div>
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