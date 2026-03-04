import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

export default function CancelCountdown({ departureDate, departureTime }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculate = () => {
      const tripTime = new Date(`${departureDate}T${departureTime}`);
      const now = new Date();
      const cancelDeadline = new Date(tripTime.getTime() - 24 * 60 * 60 * 1000);
      const diff = cancelDeadline - now;

      if (diff <= 0) {
        setTimeLeft('Prazo expirado');
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setTimeLeft(`${days}d ${hours}h para refund`);
      }
    };
    calculate();
    const timer = setInterval(calculate, 60000);
    return () => clearInterval(timer);
  }, [departureDate, departureTime]);

  return (
    <div className="flex items-center gap-2 text-[#F5C300] text-xs">
      <Clock className="w-3.5 h-3.5" />
      <span>{timeLeft}</span>
    </div>
  );
}