import React, { useRef } from 'react';
import BookingForm from '@/components/home/BookingForm';
import LanguageSwitcher from '@/components/home/LanguageSwitcher';
import SeoHead from '@/components/SeoHead';
import RideCounter from '@/components/home/RideCounter';
import { LanguageProvider, useLang } from '@/components/LanguageContext';

function HomeContent({ bookingRef }) {
  const { lang } = useLang();
  return (
    <>
      <SeoHead lang={lang} />
      <div className="min-h-screen bg-[#F5C300]">
        <div className="fixed top-4 right-4 z-50">
          <LanguageSwitcher />
        </div>
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <RideCounter />
        </div>
        <BookingForm bookingRef={bookingRef} />
      </div>
    </>
  );
}

export default function Home() {
  const bookingRef = useRef(null);
  return (
    <LanguageProvider>
      <HomeContent bookingRef={bookingRef} />
    </LanguageProvider>
  );
}