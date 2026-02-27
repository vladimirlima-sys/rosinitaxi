import React, { useRef } from 'react';
import BookingForm from '@/components/home/BookingForm';
import LanguageSwitcher from '@/components/home/LanguageSwitcher';
import SeoHead from '@/components/SeoHead';
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