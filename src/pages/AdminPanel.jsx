import { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { Lock, LayoutDashboard, Users, LogOut } from 'lucide-react';

const PASSWORD = 'Sophia051009@';

const pages = [
  { name: 'CompletedTrips', label: 'Viagens Finalizadas' },
  { name: 'Drivers', label: 'Motoristas' },
  { name: 'DriverPortal', label: 'Portal do Motorista' },
  { name: 'FAQ', label: 'FAQ' },
  { name: 'Finance', label: 'Financeiro' },
  { name: 'Home', label: 'Início' },
  { name: 'MyBookings', label: 'Minhas Reservas' },
  { name: 'Reservas', label: 'Reservas' },
  { name: 'Settings', label: 'Configurações' },
  { name: 'Taximeter', label: 'Taxímetro' },
];

export default function AdminPanel() {
  const [input, setInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('admin_unlocked') === 'true') {
      setUnlocked(true);
    }
    const savedPassword = localStorage.getItem('admin_password');
    if (savedPassword) {
      setInput(savedPassword);
      setRememberPassword(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === PASSWORD) {
      setUnlocked(true);
      setError(false);
      localStorage.setItem('admin_unlocked', 'true');
      if (rememberPassword) {
        localStorage.setItem('admin_password', input);
      } else {
        localStorage.removeItem('admin_password');
      }
    } else {
      setError(true);
      setInput('');
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#F5C300] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-black text-6xl font-extralight tracking-[0.3em] uppercase">ROSINI</h1>
            <p className="text-black/60 text-sm tracking-[0.2em] uppercase mt-2">PAINEL ADMINISTRATIVO</p>
          </div>
          <form onSubmit={handleSubmit} className="bg-black border border-black/40 rounded-xl p-6 space-y-4">
            <a href={createPageUrl('Home')} className="text-white/60 hover:text-white text-sm transition-colors mb-2 block">
              ← Voltar
            </a>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-white/60 text-sm text-center">Introduza a senha para aceder</p>
            <input
              type="password"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(false); }}
              placeholder="Senha"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/60"
              autoFocus
            />
            <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer hover:text-white/80">
              <input
                type="checkbox"
                checked={rememberPassword}
                onChange={(e) => setRememberPassword(e.target.checked)}
                className="w-4 h-4 rounded bg-white/10 border border-white/20 cursor-pointer"
              />
              Lembrar senha
            </label>
            {error && <p className="text-red-400 text-xs text-center">Senha incorreta</p>}
            <button
              type="submit"
              className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-white/90 transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5C300] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-black text-6xl font-extralight tracking-[0.3em] uppercase">ROSINI</h1>
          <p className="text-black/60 text-sm tracking-[0.2em] uppercase mt-2">PAINEL ADMINISTRATIVO</p>
          <div className="w-8 h-[1px] bg-black/40 mx-auto mt-3" />
          <button
            onClick={() => { setUnlocked(false); localStorage.removeItem('admin_unlocked'); setInput(''); }}
            className="flex items-center gap-2 text-black/60 hover:text-black text-sm transition-colors mt-6 mx-auto"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {mainPages.map(({ name, label, icon: Icon }) => (
            <a
              key={name}
              href={createPageUrl(name)}
              className="bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white/70 text-sm hover:bg-black hover:text-white hover:border-white/30 transition-all text-center"
            >
              {label}
            </a>
          ))}
        </div>

        <div>
          <p className="text-white/60 text-xs tracking-[0.2em] uppercase mb-4">Páginas</p>
          <div className="grid grid-cols-2 gap-3">
            {allPages.map(({ name, label }) => (
              <a
                key={name}
                href={createPageUrl(name)}
                className="bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white/70 text-sm hover:bg-black hover:text-white hover:border-white/30 transition-all text-center"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}