import React, { useRef, Suspense, lazy } from 'react';
import { LanguageProvider, useLang } from '@/components/LanguageContext';
import SeoHead from '@/components/SeoHead';
import NavbarHeader from '@/components/home/NavbarHeader';
import HeroHeader from '@/components/home/HeroHeader';
import AdvantagesSection from '@/components/home/AdvantagesSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import FooterSection from '@/components/home/FooterSection';
import { createPageUrl } from '@/utils';

const BookingForm = lazy(() => import('@/components/home/BookingForm'));

function HomeContent({ bookingRef }) {
  const { lang } = useLang();

  return (
    <>
      <SeoHead lang={lang} />
      <div className="bg-black min-h-screen">
        <NavbarHeader />
        
        <div className="relative bg-gradient-to-b from-black via-black/80 to-black">
          <HeroHeader onBookClick={() => bookingRef.current?.scrollIntoView({ behavior: 'smooth' })} />
          
          <Suspense fallback={<div className="h-screen bg-black" />}>
            <div ref={bookingRef}>
              <BookingForm bookingRef={bookingRef} />
            </div>
          </Suspense>

          <AdvantagesSection />
          <TestimonialsSection />
          <FooterSection />

          <div className="fixed bottom-4 right-4 z-40">
            <a href={createPageUrl('DriverPortal')} title="Portal do Motorista" className="inline-block hover:opacity-80 transition-opacity">
              <img src="https://flagcdn.com/ch.svg" alt="Suíça" className="w-12 h-8 rounded shadow-lg cursor-pointer" loading="lazy" />
            </a>
          </div>
        </div>
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