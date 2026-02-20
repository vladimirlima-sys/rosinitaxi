import React, { useRef, useState } from 'react';
import { Bookmark } from 'lucide-react';
import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import BookingForm from '@/components/home/BookingForm';
import ReviewsSection from '@/components/home/ReviewsSection';
import FooterSection from '@/components/home/FooterSection';
import LanguageSwitcher from '@/components/home/LanguageSwitcher';
import ChatSupport from '@/components/home/ChatSupport';
import BookingsModal from '@/components/bookings/BookingsModal';
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
        <ReviewsSection />
        <FooterSection />
        <ChatSupport />

        {/* Floating button for bookings */}
        <button
          onClick={() => setShowBookingsModal(true)}
          className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] shadow-lg flex items-center justify-center transition-all hover:scale-110"
          title="Mes réservations"
        >
          <Bookmark className="w-6 h-6" />
        </button>

        <BookingsModal isOpen={showBookingsModal} onClose={() => setShowBookingsModal(false)} />
      </div>
    </LanguageProvider>
  );
}