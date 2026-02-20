import React from 'react';
import { Phone, Zap } from 'lucide-react';

export default function LastMinuteTransferBadge() {
  return (
    <a
      href="tel:+41796505347"
      className="fixed top-6 left-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] font-semibold transition-all hover:shadow-lg hover:shadow-[#C9A96E]/30 group"
    >
      <Zap className="w-4 h-4 group-hover:animate-pulse" />
      <span className="text-sm">+41 79 650 53 47</span>
      <Phone className="w-4 h-4" />
    </a>
  );
}