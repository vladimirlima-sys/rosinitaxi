import React from 'react';
import { createPageUrl } from '@/utils';
import LanguageSwitcher from './LanguageSwitcher';
import { HelpCircle } from 'lucide-react';

export default function NavbarHeader() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-[#F5C300]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-[#F5C300] font-bold text-xl">Rosini Transfert</h1>
          <div className="hidden md:flex items-center gap-6">
            <a href="#services" className="text-white/70 hover:text-white text-sm transition-colors">Serviços</a>
            <a href="#prices" className="text-white/70 hover:text-white text-sm transition-colors">Tarifas</a>
            <a href="#contact" className="text-white/70 hover:text-white text-sm transition-colors">Contato</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <a href={createPageUrl('FAQ')} className="text-white/70 hover:text-white transition-colors">
            <HelpCircle className="w-5 h-5" />
          </a>
        </div>
      </div>
    </nav>
  );
}