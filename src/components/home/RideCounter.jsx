import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Route } from 'lucide-react';
import { useLang } from '@/components/LanguageContext';
import { translations } from '@/components/translations';

export default function RideCounter() {
  const { lang } = useLang();
  const t = translations[lang];
  const [count, setCount] = useState(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const bookings = await base44.entities.Booking.filter({ payment_status: 'paid' });
        setCount(1000 + (bookings?.length || 0));
      } catch {
        setCount(1000);
      }
    };
    fetchCount();
  }, []);

  if (count === null) return null;

  return (
    <div className="w-full max-w-md mt-2 mb-4">
      <div className="bg-black rounded-xl px-5 py-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#F5C300]/10 flex items-center justify-center flex-shrink-0">
          <Route className="w-5 h-5 text-[#F5C300]" />
        </div>
        <div>
          <p className="text-[#F5C300] text-2xl font-bold leading-none">{count.toLocaleString()}+</p>
          <p className="text-white/50 text-xs mt-1 uppercase tracking-wider">{t.ridesCompleted}</p>
        </div>
      </div>
    </div>
  );
}