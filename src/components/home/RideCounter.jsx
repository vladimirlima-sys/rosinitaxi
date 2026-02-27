import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Car } from 'lucide-react';
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
    <div className="bg-black/80 text-white px-3 py-2 text-sm font-semibold opacity-30 rounded-full flex items-center gap-2 shadow-lg">
      <Car className="w-4 h-4 text-[#F5C300]" />
      <span className="text-[#F5C300] font-bold">{count.toLocaleString()}</span>
      <span className="text-white/80 text-xs">{t.ridesCompleted}</span>
    </div>);

}