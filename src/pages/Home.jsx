import React, { useRef } from 'react';
import BookingForm from '@/components/home/BookingForm';
import LanguageSwitcher from '@/components/home/LanguageSwitcher';
import RivieraCard from '@/components/home/RivieraCard';
import FooterSection from '@/components/home/FooterSection';
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
        <div className="absolute bottom-0 right-0 p-4">
          <a href={createPageUrl('DriverPortal')} title="Portal do Motorista">
            <img src="https://flagcdn.com/ch.svg" alt="Suíça" className="w-12 h-8 rounded shadow-lg cursor-pointer hover:opacity-80 transition-opacity" />
          </a>
        </div>
      </div>
      <FooterSection />
    </>);

}

export default function Home() {
  const bookingRef = useRef(null);
  return (
    <LanguageProvider>
      <HomeContent bookingRef={bookingRef} />
    </LanguageProvider>);

}