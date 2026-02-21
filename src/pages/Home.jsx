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
            className="w-14 h-14 rounded-full bg-white border-2 border-gray-900 hover:bg-gray-100 text-gray-900 shadow-lg flex items-center justify-center transition-all hover:scale-110"
            title="Appel d'urgence"
          >
            <Phone className="w-6 h-6" />
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