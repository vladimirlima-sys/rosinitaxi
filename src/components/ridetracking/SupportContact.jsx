import { MessageCircle, Phone, Mail, AlertCircle } from 'lucide-react';

export default function SupportContact() {
  const handleEmergency = () => {
    window.open('tel:+41791234567');
  };

  const handleWhatsAppSupport = () => {
    const message = 'Preciso de ajuda com minha reserva';
    window.open(
      `https://wa.me/41791234567?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  return (
    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
        <div>
          <p className="text-white font-semibold text-sm mb-1">Precisa de Ajuda?</p>
          <p className="text-white/60 text-sm">Contacte nosso suporte 24/7</p>
        </div>
      </div>

      <div className="space-y-2">
        <a
          href="tel:+41791234567"
          className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
        >
          <Phone className="w-4 h-4" />
          Chamada de Emergência: +41 79 123 4567
        </a>
        <button
          onClick={handleWhatsAppSupport}
          className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors text-sm font-medium"
        >
          <MessageCircle className="w-4 h-4" />
          Contactar via WhatsApp
        </button>
        <a
          href="mailto:support@rosini.online"
          className="flex items-center gap-2 text-white/60 hover:text-white/80 transition-colors text-sm font-medium"
        >
          <Mail className="w-4 h-4" />
          support@rosini.online
        </a>
      </div>
    </div>
  );
}