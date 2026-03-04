import React from 'react';
import { useLang } from '@/components/LanguageContext';
import { Mail, Phone, MapPin } from 'lucide-react';

const translations = {
  pt: {
    company: 'Rosini Transfert',
    about: 'Sua confiança em transferências de qualidade na Suíça',
    links: { services: 'Serviços', booking: 'Reservar', faq: 'Perguntas' },
    contact: { title: 'Contato', phone: '+41 (0) 24 XXX XXXX', email: 'info@rosini.ch', address: 'Suíça' },
    legal: 'Todos os direitos reservados. Política de Privacidade | Termos de Serviço'
  },
  fr: {
    company: 'Rosini Transfert',
    about: 'Votre confiance en transferts de qualité en Suisse',
    links: { services: 'Services', booking: 'Réserver', faq: 'FAQ' },
    contact: { title: 'Contact', phone: '+41 (0) 24 XXX XXXX', email: 'info@rosini.ch', address: 'Suisse' },
    legal: 'Tous droits réservés. Politique de Confidentialité | Conditions d\'Utilisation'
  },
  en: {
    company: 'Rosini Transfert',
    about: 'Your trust in quality transfers in Switzerland',
    links: { services: 'Services', booking: 'Book', faq: 'FAQ' },
    contact: { title: 'Contact', phone: '+41 (0) 24 XXX XXXX', email: 'info@rosini.ch', address: 'Switzerland' },
    legal: 'All rights reserved. Privacy Policy | Terms of Service'
  },
  de: {
    company: 'Rosini Transfert',
    about: 'Ihr Vertrauen in hochwertige Transfers in der Schweiz',
    links: { services: 'Dienstleistungen', booking: 'Buchen', faq: 'Häufig Gestellte Fragen' },
    contact: { title: 'Kontakt', phone: '+41 (0) 24 XXX XXXX', email: 'info@rosini.ch', address: 'Schweiz' },
    legal: 'Alle Rechte vorbehalten. Datenschutzerklärung | Nutzungsbedingungen'
  }
};

export default function FooterSection() {
  const { lang } = useLang();
  const t = translations[lang] || translations.pt;

  return (
    <footer id="contact" className="bg-black border-t border-white/10 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* About */}
          <div>
            <h3 className="text-[#F5C300] font-bold text-lg mb-4">{t.company}</h3>
            <p className="text-white/60 text-sm">{t.about}</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Menu</h4>
            <ul className="space-y-2">
              {Object.entries(t.links).map(([key, label]) => (
                <li key={key}>
                  <a href="#" className="text-white/60 hover:text-[#F5C300] text-sm transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t.contact.title}</h4>
            <div className="space-y-3">
              <a href="tel:+41" className="flex items-center gap-3 text-white/60 hover:text-[#F5C300] text-sm transition-colors">
                <Phone className="w-4 h-4" /> {t.contact.phone}
              </a>
              <a href="mailto:info@rosini.ch" className="flex items-center gap-3 text-white/60 hover:text-[#F5C300] text-sm transition-colors">
                <Mail className="w-4 h-4" /> {t.contact.email}
              </a>
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <MapPin className="w-4 h-4" /> {t.contact.address}
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              {lang === 'pt' ? 'Newsletter' : lang === 'fr' ? 'Infolettre' : lang === 'de' ? 'Newsletter' : 'Newsletter'}
            </h4>
            <div className="flex">
              <input 
                type="email" 
                placeholder={lang === 'pt' ? 'Seu email' : lang === 'fr' ? 'Votre email' : lang === 'de' ? 'Ihre E-Mail' : 'Your email'}
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-l text-white text-sm placeholder:text-white/40"
              />
              <button className="px-4 py-2 bg-[#F5C300] hover:bg-[#E6B800] text-black font-semibold rounded-r text-sm transition-all">
                {lang === 'pt' ? 'Inscrever' : lang === 'fr' ? 'S\'inscrire' : lang === 'de' ? 'Anmelden' : 'Subscribe'}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-white/40 text-sm">
          <p>{t.legal}</p>
        </div>
      </div>
    </footer>
  );
}