import React, { useRef, useState } from 'react';
import { Bookmark } from 'lucide-react';
import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import BookingForm from '@/components/home/BookingForm';
import FooterSection from '@/components/home/FooterSection';
import LanguageSwitcher from '@/components/home/LanguageSwitcher';
import BookingsModal from '@/components/bookings/BookingsModal';
import FloatingActions from '@/components/home/FloatingActions';
import { LanguageProvider } from '@/components/LanguageContext';

export default function Home() {
  const bookingRef = useRef(null);
  const [showBookingsModal, setShowBookingsModal] = useState(false);

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
        
        <FloatingActions onOpenBookingsModal={() => setShowBookingsModal(true)} />
        <BookingsModal isOpen={showBookingsModal} onClose={() => setShowBookingsModal(false)} />
      </div>
    </LanguageProvider>
  );
}