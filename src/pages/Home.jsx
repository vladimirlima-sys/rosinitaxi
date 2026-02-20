import React, { useRef } from 'react';
import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import BookingForm from '@/components/home/BookingForm';
import FooterSection from '@/components/home/FooterSection';

export default function Home() {
  const bookingRef = useRef(null);

  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <HeroSection onScrollToBooking={scrollToBooking} />
      <ServicesSection />
      <BookingForm bookingRef={bookingRef} />
      <FooterSection />
    </div>
  );
}