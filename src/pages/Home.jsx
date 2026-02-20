import React, { useRef } from 'react';
import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import BookingForm from '@/components/home/BookingForm';
import FooterSection from '@/components/home/FooterSection';
import LanguageSwitcher from '@/components/home/LanguageSwitcher';
import { LanguageProvider } from '@/components/LanguageContext';

export default function Home() {
  const bookingRef = useRef(null);

  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-[#0A0A0A]">
        <LanguageSwitcher />
        <HeroSection onScrollToBooking={scrollToBooking} />
        <ServicesSection />
        <BookingForm bookingRef={bookingRef} />
        <FooterSection />
      </div>
    </LanguageProvider>
  );
}