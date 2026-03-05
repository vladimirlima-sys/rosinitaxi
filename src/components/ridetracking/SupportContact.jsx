import { MessageCircle, Phone, Mail, AlertCircle } from 'lucide-react';

const COMPANY_PHONE = '+41772492245';
const COMPANY_PHONE_DISPLAY = '+41 77 249 22 45';
const COMPANY_EMAIL = 'contact@rosini.online';

export default function SupportContact({ t }) {
  const handleWhatsAppSupport = () => {
    const message = t?.whatsAppSupport || "I need help with my booking";
    window.open(
      `https://wa.me/${COMPANY_PHONE.replace('+', '')}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  return (
    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
        <div>
          <p className="text-white font-semibold text-sm mb-1">{t?.needHelp || "Need help?"}</p>
          <p className="text-white/60 text-sm">{t?.support24h || "Contact our support 24/7"}</p>
        </div>
      </div>

      <div className="space-y-2">
        <a
          href={`tel:${COMPANY_PHONE}`}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
        >
          <Phone className="w-4 h-4" />
          {t?.emergencyCall || "Emergency call"} : {COMPANY_PHONE_DISPLAY}
        </a>
        <button
          onClick={handleWhatsAppSupport}
          className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors text-sm font-medium"
        >
          <MessageCircle className="w-4 h-4" />
          {t?.contactWhatsApp || "Contact via WhatsApp"}
        </button>
        <a
          href={`mailto:${COMPANY_EMAIL}`}
          className="flex items-center gap-2 text-white/60 hover:text-white/80 transition-colors text-sm font-medium"
        >
          <Mail className="w-4 h-4" />
          {COMPANY_EMAIL}
        </a>
      </div>
    </div>
  );
}