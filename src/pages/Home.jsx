import React, { useRef, useState } from 'react';
import { Bookmark, Phone } from 'lucide-react';
import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import BookingForm from '@/components/home/BookingForm';
import FooterSection from '@/components/home/FooterSection';
import LanguageSwitcher from '@/components/home/LanguageSwitcher';
import GoogleMapsLoader from '@/components/GoogleMapsLoader';

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
      <GoogleMapsLoader />
      <div className="min-h-screen bg-[#0A0A0A]">
        <LanguageSwitcher />
        <HeroSection onScrollToBooking={scrollToBooking} />
        <ServicesSection />
        <BookingForm bookingRef={bookingRef} />
        <FooterSection />


        {/* Floating buttons - Call only */}
                <div className="fixed top-6 left-6 z-50">
                  <a
                    href="tel:+41796505347"
                    className="w-14 h-14 rounded-full bg-transparent border-2 border-[#C9A96E] hover:bg-[#C9A96E]/20 text-[#C9A96E] shadow-lg flex items-center justify-center transition-all hover:scale-110"
                    title="Appel d'urgence"
                  >
                    <Phone className="w-6 h-6" />
                  </a>
                </div>

        <BookingsModal isOpen={showBookingsModal} onClose={() => setShowBookingsModal(false)} />
      </div>
    </LanguageProvider>
  );
}