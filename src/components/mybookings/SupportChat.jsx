import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export default function SupportChat({ t }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    // TODO: Enviar mensagem via WhatsApp ou email
    const email = 'info@rosini.online';
    const phone = '+41772492245';
    const text = encodeURIComponent(`Olá, tenho uma pergunta sobre minhas reservas:\n\n${message}`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${text}`, '_blank');
    setMessage('');
    setOpen(false);
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] bg-black border border-[#F5C300]/40 rounded-2xl shadow-2xl">
          <div className="bg-gradient-to-r from-[#F5C300]/10 to-transparent p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white font-bold text-sm">Suporte</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-white/50 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            <div className="text-white/60 text-xs space-y-1">
              <p className="font-medium text-white">✉️ Email</p>
              <a href="mailto:info@rosini.online" className="text-[#F5C300] hover:underline">info@rosini.online</a>
            </div>

            <div className="text-white/60 text-xs space-y-1">
              <p className="font-medium text-white">📞 Telefone</p>
              <a href="tel:+41772492245" className="text-[#F5C300] hover:underline">+41 77 249 22 45</a>
            </div>

            <div className="pt-3 border-t border-white/10">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Sua pergunta..."
                className="w-full h-20 bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs placeholder-white/30 focus:outline-none focus:border-[#F5C300]/50 resize-none"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="mt-2 w-full h-9 bg-[#F5C300] hover:bg-[#e6b800] text-black font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                Enviar via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#F5C300] hover:bg-[#e6b800] text-black rounded-full flex items-center justify-center shadow-lg transition-all"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </>
  );
}