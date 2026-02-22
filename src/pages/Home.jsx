import React, { useRef, useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import HeroSection from '@/components/home/HeroSection';
import BookingForm from '@/components/home/BookingForm';
import FooterSection from '@/components/home/FooterSection';
import LanguageSwitcher from '@/components/home/LanguageSwitcher';
import SeoHead from '@/components/SeoHead';
import { LanguageProvider, useLang } from '@/components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

function HomeContent({ bookingRef, scrollToBooking }) {
  const { lang } = useLang();

  const [form, setForm] = useState({
    departure_point: '',
    arrival_point: '',
    departure_date: '',
    departure_time: '',
    flight_number: '',
    vehicle_type: 'economic',
    passengers: 1,
    client_name: '',
    client_email: '',
    client_phone: '',
    notes: '',
    driver_preference: '',
    distance_km: 0
  });
  const [estimatedDistance, setEstimatedDistance] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [priceSettings, setPriceSettings] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await base44.entities.PriceSettings.list();
        if (settings && settings.length > 0) setPriceSettings(settings[0]);
      } catch (err) {
        console.error('Error fetching price settings:', err);
      }
    };
    fetchSettings();
    locateUser();
  }, []);

  const locateUser = async () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await base44.functions.invoke('hereReverseGeocoding', { lat: latitude, lng: longitude });
          if (response.data?.address) update('departure_point', response.data.address);
        } catch (err) {
          console.error('Reverse geocoding error:', err);
        }
        setIsLocating(false);
      },
      () => setIsLocating(false)
    );
  };

  const handleRouteReady = (routeData) => {
    setEstimatedDistance(routeData.distance_km);
    setEstimatedTime(routeData.estimated_time_minutes);
    setCurrentRoute(routeData.route);
    update('distance_km', routeData.distance_km);
  };

  const handleContinue = () => {
    scrollToBooking();
  };

  return (
    <React.Fragment>
      <SeoHead lang={lang} />
      <div className="min-h-screen bg-white">
        <LanguageSwitcher />
        <HeroSection
          onScrollToBooking={handleContinue}
          onRouteReady={handleRouteReady}
          form={form}
          update={update}
          estimatedDistance={estimatedDistance}
          estimatedTime={estimatedTime}
          currentRoute={currentRoute}
          isLocating={isLocating}
          locateUser={locateUser}
          priceSettings={priceSettings}
        />
        <BookingForm
          bookingRef={bookingRef}
          sharedForm={form}
          sharedUpdate={update}
          sharedEstimatedDistance={estimatedDistance}
          sharedEstimatedTime={estimatedTime}
          sharedPriceSettings={priceSettings}
        />
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