import React, { useState, useRef, useEffect } from 'react';
import { Phone, MessageCircle, X, Send, Loader2, Bookmark, Zap, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/components/LanguageContext';

const chatLabels = {
  fr: { title: 'Support', subtitle: 'Répondons à vos questions', placeholder: 'Posez votre question...', send: 'Envoyer', welcome: 'Bonjour ! 👋 Comment puis-je vous aider aujourd\'hui ? Je peux vous renseigner sur nos services, tarifs ou vous aider avec votre réservation.', minimize: 'Réduire' },
  en: { title: 'Support', subtitle: 'We answer your questions', placeholder: 'Ask your question...', send: 'Send', welcome: 'Hello! 👋 How can I help you today? I can tell you about our services, pricing, or help with your booking.', minimize: 'Minimize' },
  de: { title: 'Support', subtitle: 'Wir beantworten Ihre Fragen', placeholder: 'Stellen Sie Ihre Frage...', send: 'Senden', welcome: 'Hallo! 👋 Wie kann ich Ihnen heute helfen? Ich kann Ihnen über unsere Dienste, Preise oder Ihre Buchung informieren.', minimize: 'Minimieren' },
  it: { title: 'Supporto', subtitle: 'Rispondiamo alle vostre domande', placeholder: 'Fate la vostra domanda...', send: 'Invia', welcome: 'Ciao! 👋 Come posso aiutarvi oggi? Posso informarvi sui nostri servizi, prezzi o aiutarvi con la prenotazione.', minimize: 'Minimizza' },
  pt: { title: 'Suporte', subtitle: 'Respondemos às suas perguntas', placeholder: 'Faça sua pergunta...', send: 'Enviar', welcome: 'Olá! 👋 Como posso ajudá-lo hoje? Posso informar sobre nossos serviços, preços ou ajudar com sua reserva.', minimize: 'Minimizar' },
};

const SYSTEM_CONTEXT = `You are a friendly and professional customer support agent for Rosini Transfert, a premium private transfer service operating in Switzerland and Europe.

About Rosini Transfert:
- Available 24/7, every day including public holidays
- Services: Airport transfers, business travel, long distance, group transport
- Coverage: Switzerland and all of Europe
- Vehicles: Economy (sedan, 1-3 passengers, CHF 2.35/km) and Comfort (premium vehicle, leather seats, water & refreshments, USB chargers, 1-4 passengers, CHF 2.95/km)
- Both vehicles include: air conditioning, free Wi-Fi, luggage
- Contact email: taxirosini@gmail.com
- Booking: done directly on the website
- Payment: secure Stripe payment

Be concise, warm, and professional. Answer in the same language as the user's message. If asked about a specific price, calculate it based on CHF 2.35/km (economy) or CHF 2.95/km (comfort) and typical Swiss distances. For bookings, guide users to use the booking form on the website.`;

export default function FloatingActions({ onOpenBookingsModal }) {
  const { lang } = useLang();
  const labels = chatLabels[lang] || chatLabels.fr;

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: labels.welcome }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isChatOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
      setHasUnread(false);
    }
  }, [isChatOpen, messages]);

  useEffect(() => {
    if (!isChatOpen) {
      const t = setTimeout(() => setHasUnread(true), 8000);
      return () => clearTimeout(t);
    }
  }, [isChatOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    const updatedMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const conversationHistory = updatedMessages
        .slice(-8)
        .map(m => `${m.role === 'user' ? 'Customer' : 'Agent'}: ${m.content}`)
        .join('\n');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_CONTEXT}\n\nConversation history:\n${conversationHistory}\n\nRespond only as the Agent, in a helpful and concise way (max 3 sentences).`,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '😔 Désolé, une erreur est survenue. Veuillez nous contacter à taxirosini@gmail.com' }]);
    }
    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      {/* Chat Window */}
      {isChatOpen && (
        <div className="w-[360px] max-w-[calc(100vw-2rem)] bg-[#111111] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ height: '480px' }}>
          <div className="flex items-center justify-between px-4 py-3 bg-[#0A0A0A] border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-[#C9A96E]/10 flex items-center justify-center">
                  <span className="text-[#C9A96E] text-sm font-bold">R</span>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#0A0A0A]" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">{labels.title}</p>
                <p className="text-white/30 text-xs">{labels.subtitle}</p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-white/30 hover:text-white/60 transition-colors p-1">
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#C9A96E] text-[#0A0A0A] rounded-tr-sm'
                    : 'bg-white/[0.06] text-white/80 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-white/10 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={labels.placeholder}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#C9A96E]/50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-[#C9A96E] hover:bg-[#B8955D] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
            >
              {isLoading ? <Loader2 className="w-4 h-4 text-[#0A0A0A] animate-spin" /> : <Send className="w-4 h-4 text-[#0A0A0A]" />}
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col items-start gap-3">
        {/* Phone Badge */}
        <a
          href="tel:+41796505347"
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] font-semibold transition-all hover:shadow-lg hover:shadow-[#C9A96E]/30 h-14 w-14 md:w-auto justify-center md:justify-start"
          title="Call for last minute transfer"
        >
          <Zap className="w-5 h-5 flex-shrink-0" />
          <span className="hidden md:inline text-sm">+41 79 650 53 47</span>
        </a>

        {/* Chat Button */}
        <button
          onClick={() => setIsChatOpen(prev => !prev)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] font-semibold transition-all hover:shadow-lg hover:shadow-[#C9A96E]/30 h-14 w-14 md:w-auto justify-center md:justify-start relative"
        >
          {isChatOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <>
              <MessageCircle className="w-5 h-5 flex-shrink-0" />
              <span className="hidden md:inline text-sm">Support</span>
              {hasUnread && (
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-[#C9A96E]" />
              )}
            </>
          )}
        </button>

        {/* Bookings Button */}
        <button
          onClick={onOpenBookingsModal}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] font-semibold transition-all hover:shadow-lg hover:shadow-[#C9A96E]/30 h-14 w-14 md:w-auto justify-center md:justify-start"
          title="My bookings"
        >
          <Bookmark className="w-5 h-5 flex-shrink-0" />
          <span className="hidden md:inline text-sm">My Bookings</span>
        </button>
      </div>
    </div>
  );
}