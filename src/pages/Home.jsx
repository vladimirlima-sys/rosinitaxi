import React, { useRef } from 'react';
import { Phone } from 'lucide-react';
import HeroSection from '@/components/home/HeroSection';
import BookingForm from '@/components/home/BookingForm';
import FooterSection from '@/components/home/FooterSection';
import LanguageSwitcher from '@/components/home/LanguageSwitcher';
import GoogleMapsLoader from '@/components/GoogleMapsLoader';
import SeoHead from '@/components/SeoHead';
import { LanguageProvider, useLang } from '@/components/LanguageContext';

function HomeContent({ bookingRef, scrollToBooking }) {
  const { lang } = useLang();
  return (
    <React.Fragment>
      <SeoHead lang={lang} />
      <GoogleMapsLoader />
      <div className="min-h-screen bg-white">
        <LanguageSwitcher />
        <HeroSection onScrollToBooking={scrollToBooking} />
        <BookingForm bookingRef={bookingRef} />
        <FooterSection />
        <div className="fixed bottom-6 right-6 z-50">
          <a
            href="tel:+41796505347"
            className="group w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-black/50"
            title="Appel d'urgence"
          >
            <Phone className="w-5 h-5 text-white/80 group-hover:text-white" strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </React.Fragment>);

}

export default function Home() {
  const bookingRef = useRef(null);
  const scrollToBooking = () => bookingRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <LanguageProvider>
      <HomeContent bookingRef={bookingRef} scrollToBooking={scrollToBooking} />
    </LanguageProvider>);

}