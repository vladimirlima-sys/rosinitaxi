import React, { useRef, lazy, Suspense } from 'react';
import BookingForm from '@/components/home/BookingForm';
import LanguageSwitcher from '@/components/home/LanguageSwitcher';
import SeoHead from '@/components/SeoHead';
import { LanguageProvider, useLang } from '@/components/LanguageContext';
import { createPageUrl } from '@/utils';
import { HelpCircle, Phone, Award, Zap, MapPin } from 'lucide-react';

const HeroSection = lazy(() => import('@/components/home/HeroSection'));
const FeaturesSection = lazy(() => import('@/components/home/FeaturesSection'));

function HomeContent({ bookingRef }) {
  const { lang } = useLang();
  return (
    <>
      <SeoHead lang={lang} />
      <div className="min-h-screen bg-[#F5C300]">
        {/* Header Navigation */}
        <header className="fixed top-0 left-0 right-0 z-40 bg-[#F5C300] border-b border-black/10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="font-bold text-lg text-black tracking-wide">ROSINI</div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#booking" className="text-black/70 text-sm hover:text-black transition-colors">Réserver</a>
              <a href={createPageUrl('FAQ')} className="text-black/70 text-sm hover:text-black transition-colors">FAQ</a>
              <a href="tel:+41772492245" className="text-black/70 text-sm hover:text-black transition-colors flex items-center gap-1">
                <Phone className="w-4 h-4" /> Appeler
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <a 
                href={createPageUrl('DriverPortal')} 
                title="Portal do Motorista"
                className="p-1.5 hover:opacity-70 transition-opacity"
              >
                <img src="https://flagcdn.com/ch.svg" alt="Suíça" className="w-6 h-4 rounded" loading="lazy" />
              </a>
              <a href={createPageUrl('FAQ')} className="md:hidden bg-black text-[#F5C300] p-2 rounded-full hover:bg-black/80 transition-all">
                <HelpCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <Suspense fallback={null}>
          <HeroSection />
        </Suspense>

        {/* Booking Form - Main Section */}
        <section id="booking" className="relative pt-24 pb-16">
          <BookingForm bookingRef={bookingRef} />
        </section>

        {/* Features Section */}
        <Suspense fallback={null}>
          <FeaturesSection />
        </Suspense>

        {/* Footer */}
        <footer className="bg-black text-white py-8 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-2">ROSINI</h3>
                <p className="text-white/60 text-sm">Transports de personnes professionnel en Suisse</p>
              </div>
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider mb-3">Contact</p>
                <div className="space-y-2">
                  <a href="tel:+41772492245" className="text-white text-sm hover:text-[#F5C300] transition-colors block">+41 77 249 22 45</a>
                  <a href="mailto:info@rosini.online" className="text-white text-sm hover:text-[#F5C300] transition-colors block">info@rosini.online</a>
                  <p className="text-white/60 text-xs pt-1">La Tour-de-Peilz, Suisse</p>
                </div>
              </div>
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider mb-3">Liens</p>
                <div className="space-y-2">
                  <a href={createPageUrl('FAQ')} className="text-white text-sm hover:text-[#F5C300] transition-colors block">FAQ</a>
                  <a href={createPageUrl('DriverPortal')} className="text-white text-sm hover:text-[#F5C300] transition-colors block">Portal do Motorista</a>
                  <a href="https://wa.me/41772492245" target="_blank" rel="noopener noreferrer" className="text-white text-sm hover:text-[#F5C300] transition-colors block">WhatsApp</a>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 pt-6 text-center text-white/40 text-xs">
              <p>© 2026 Rosini Transports et Locations Sàrl. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </div>
    </>);

}

export default function Home() {
  const bookingRef = useRef(null);
  return (
    <LanguageProvider>
      <HomeContent bookingRef={bookingRef} />
    </LanguageProvider>);

}