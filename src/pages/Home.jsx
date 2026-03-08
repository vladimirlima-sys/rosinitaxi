import React, { useRef } from 'react';
import BookingForm from '@/components/home/BookingForm';
import LanguageSwitcher from '@/components/home/LanguageSwitcher';
import RivieraCard from '@/components/home/RivieraCard';
import SeoHead from '@/components/SeoHead';
import { LanguageProvider, useLang } from '@/components/LanguageContext';
import { createPageUrl } from '@/utils';
import { HelpCircle } from 'lucide-react';
import PageTracker from '@/components/home/PageTracker';

function HomeContent({ bookingRef }) {
  const { lang } = useLang();
  return (
    <>
      <SeoHead lang={lang} />
      <div className="min-h-screen bg-[#F5C300] relative">
        <RivieraCard />
        <div className="fixed top-14 right-5 z-50">
          <LanguageSwitcher />
        </div>

        <PageTracker page="Home" />
        <BookingForm bookingRef={bookingRef} />
        <div className="absolute bottom-0 right-0 p-4 flex items-center gap-3">
          <a href={createPageUrl('FAQ')} title="FAQ" className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-white/70 hover:text-[#F5C300] hover:border-[#F5C300]/40 transition-all duration-200 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </a>
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