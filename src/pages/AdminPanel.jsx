import { useState } from 'react';
import { createPageUrl } from '@/utils';
import { Lock, LayoutDashboard, Users, CreditCard, Calendar, Settings, Car, Star, FileText, LogOut } from 'lucide-react';

const PASSWORD = 'Sophia051009@';

const pages = [
  { name: 'Reservas', label: 'Reservas', icon: Calendar, desc: 'Gerir todas as reservas' },
  { name: 'Drivers', label: 'Motoristas', icon: Car, desc: 'Gerir motoristas' },
  { name: 'Finance', label: 'Finanças', icon: CreditCard, desc: 'Relatórios financeiros' },
  { name: 'Settings', label: 'Definições', icon: Settings, desc: 'Configurações e preços' },
  { name: 'Taximeter', label: 'Taxímetro', icon: LayoutDashboard, desc: 'Contador de km ao vivo' },
  { name: 'Home', label: 'Site público', icon: FileText, desc: 'Página de reservas do cliente' },
  { name: 'FAQ', label: 'FAQ', icon: FileText, desc: 'Perguntas frequentes' },
];

export default function AdminPanel() {
  const [input, setInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === PASSWORD) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setInput('');
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-[#F5C300] text-2xl font-light tracking-widest uppercase">Rosini</h1>
            <p className="text-white/40 text-xs tracking-widest mt-1">PAINEL ADMINISTRATIVO</p>
          </div>
          <form onSubmit={handleSubmit} className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 space-y-4">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-[#F5C300]/10 border border-[#F5C300]/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#F5C300]" />
              </div>
            </div>
            <p className="text-white/60 text-sm text-center">Introduza a senha para aceder</p>
            <input
              type="password"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(false); }}
              placeholder="Senha"
              className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#F5C300]/50"
              autoFocus
            />
            {error && <p className="text-red-400 text-xs text-center">Senha incorreta</p>}
            <button
              type="submit"
              className="w-full bg-[#F5C300] hover:bg-[#e6b800] text-black font-bold py-3 rounded-xl transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-[#F5C300] text-2xl font-light tracking-widest uppercase">Rosini</h1>
            <p className="text-white/40 text-xs tracking-widest mt-1">PAINEL ADMINISTRATIVO</p>
          </div>
          <button
            onClick={() => setUnlocked(false)}
            className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pages.map(({ name, label, icon: Icon, desc }) => (
            <a
              key={name}
              href={createPageUrl(name)}
              className="group flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-[#F5C300]/30 rounded-2xl px-5 py-4 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F5C300]/10 border border-[#F5C300]/20 flex items-center justify-center shrink-0 group-hover:bg-[#F5C300]/20 transition-colors">
                <Icon className="w-5 h-5 text-[#F5C300]" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">{label}</p>
                <p className="text-white/40 text-xs">{desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}