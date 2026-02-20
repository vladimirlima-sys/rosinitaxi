import React from 'react';
import { Phone, Mail, Clock } from 'lucide-react';

export default function FooterSection() {
  return (
    <footer className="py-16 px-6 bg-[#080808] border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-white text-2xl font-light tracking-tight mb-2">ROSINI</h3>
            <p className="text-white/30 text-sm tracking-[0.2em] uppercase mb-4">Transfert</p>
            <p className="text-white/40 text-sm leading-relaxed">
              Service de transfert privé premium. Confort, ponctualité et élégance pour tous vos trajets.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white/60 text-sm tracking-[0.2em] uppercase mb-6">Contact</h4>
            <div className="space-y-4">
              <a href="mailto:taxirosini@gmail.com" className="flex items-center gap-3 text-white/40 hover:text-[#C9A96E] transition-colors text-sm">
                <Mail className="w-4 h-4" />
                taxirosini@gmail.com
              </a>
              <div className="flex items-center gap-3 text-white/40 text-sm">
                <Phone className="w-4 h-4" />
                Contactez-nous par email
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-white/60 text-sm tracking-[0.2em] uppercase mb-6">Horaires</h4>
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#C9A96E] mt-0.5" />
              <div>
                <p className="text-white/60 text-sm font-medium">24 heures / 24</p>
                <p className="text-white/40 text-sm">7 jours / 7</p>
                <p className="text-white/30 text-xs mt-2">Disponible les jours fériés</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-white/5 mb-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/20 text-sm">
            © {new Date().getFullYear()} Rosini Transfert. Tous droits réservés.
          </p>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-white/30 text-xs">Disponible maintenant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}