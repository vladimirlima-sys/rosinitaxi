import React, { useRef } from 'react';
import { Phone } from 'lucide-react';
import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
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
        <ServicesSection />
        <BookingForm bookingRef={bookingRef} />
        <FooterSection />
        <div className="fixed top-6 left-6 z-50">
          <a
            href="tel:+41796505347"
            className="group w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm border border-[#F5C300]/30 shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-black/60 hover:shadow-[0_0_20px_rgba(245,195,0,0.4)]"
            title="Appel d'urgence"
          >
            <Phone className="w-6 h-6 text-[#F5C300] group-hover:animate-pulse" />
          </a>
        </div>
      </div>
    </React.Fragment>
  );
}

export default function Home() {
  const bookingRef = useRef(null);
  const scrollToBooking = () => bookingRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <LanguageProvider>
      <HomeContent bookingRef={bookingRef} scrollToBooking={scrollToBooking} />
    </LanguageProvider>
  );
}