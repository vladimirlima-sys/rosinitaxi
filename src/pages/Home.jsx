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
        <a
          href={createPageUrl('FAQ')} className="fixed top-5 left-5 z-50 bg-black text-[#F5C300] p-2.5 opacity-40 rounded-full flex items-center gap-1.5 hover:bg-black/80 transition-all shadow">
          <HelpCircle className="w-5 h-5" />
        </a>
        <div className="fixed top-5 right-5 z-50">
          <LanguageSwitcher />
        </div>

        <PageTracker page="Home" />
        <BookingForm bookingRef={bookingRef} />
        <div className="absolute bottom-0 right-0 p-4">
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