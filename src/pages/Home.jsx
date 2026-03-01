import React, { useRef } from 'react';
import BookingForm from '@/components/home/BookingForm';
import LanguageSwitcher from '@/components/home/LanguageSwitcher';
import SeoHead from '@/components/SeoHead';
import { LanguageProvider, useLang } from '@/components/LanguageContext';
import { createPageUrl } from '@/utils';
import { HelpCircle } from 'lucide-react';

function HomeContent({ bookingRef }) {
  const { lang } = useLang();
  return (
    <>
      <SeoHead lang={lang} />
      <div className="min-h-screen bg-[#F5C300]">
        <div className="fixed top-5 right-5 z-50 flex flex-row items-center gap-2">
          <a
            href={createPageUrl('FAQ')} className="bg-black text-[#F5C300] px-4 py-2 text-sm font-semibold opacity-40 rounded-full flex items-center gap-1.5 hover:bg-black/80 transition-all shadow">


            <HelpCircle className="w-4 h-4" />
            FAQ
          </a>
          <LanguageSwitcher />
        </div>
        <BookingForm bookingRef={bookingRef} />
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