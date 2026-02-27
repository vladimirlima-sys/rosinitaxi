import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Car } from 'lucide-react';

export default function RideCounter() {
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
    <div className="flex items-center gap-2 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
      <Car className="w-4 h-4 text-[#F5C300]" />
      <span className="text-[#F5C300] text-base font-bold">{count.toLocaleString()}</span>
      <span className="text-white/80 text-xs">corridas realizadas</span>
    </div>
  );
}