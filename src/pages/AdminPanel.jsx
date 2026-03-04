import { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import AdminKPIs from '@/components/admin/AdminKPIs';
import {
  Lock, LogOut, LayoutDashboard, List,
  CalendarDays, Car, Users, Settings, BarChart2,
  FileText, Map, Smartphone, HelpCircle, ChevronRight, Eye, EyeOff,
  Receipt, BookOpen, Star
} from 'lucide-react';

const navPages = [
  { name: 'Reservas', label: 'Réservations', icon: List },
  { name: 'Calendar', label: 'Calendrier', icon: CalendarDays },
  { name: 'Drivers', label: 'Chauffeurs', icon: Car },
  { name: 'Clients', label: 'Clients', icon: Users },
  { name: 'Finance', label: 'Finances', icon: BarChart2 },
  { name: 'FinancialReports', label: 'Rapports financiers', icon: FileText },
  { name: 'Payslips', label: 'Fiches de paie', icon: Receipt },
  { name: 'CreatePayslip', label: 'Créer fiche de paie', icon: Receipt },
  { name: 'MyBookings', label: 'Mes réservations (client)', icon: BookOpen },
  { name: 'Settings', label: 'Paramètres', icon: Settings },
  { name: 'Taximeter', label: 'Taximètre', icon: Smartphone },
  { name: 'DriverPortal', label: 'Portail Chauffeur', icon: Map },
  { name: 'FAQ', label: 'FAQ', icon: HelpCircle },
  { name: 'Home', label: 'Site public', icon: LayoutDashboard },
];

export default function AdminPanel() {
  const [password, setPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('dashboard');
  const [showPassword, setShowPassword] = useState(false);

  const ADMIN_PASSWORD = 'Sophia051009@';

  useEffect(() => {
    if (localStorage.getItem('admin_unlocked') === 'true') setUnlocked(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setUnlocked(true);
      setError('');
      localStorage.setItem('admin_unlocked', 'true');
    } else {
      setError('Senha incorreta.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setUnlocked(false);
    localStorage.removeItem('admin_unlocked');
    setPassword('');
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#F5C300] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-black text-6xl font-extralight tracking-[0.3em] uppercase">ROSINI</h1>
            <p className="text-black/60 text-sm tracking-[0.2em] uppercase mt-2">PANNEAU ADMINISTRATIF</p>
          </div>
          <form onSubmit={handleSubmit} className="bg-black border border-black/40 rounded-xl p-6 space-y-4">
            <a href={createPageUrl('Home')} className="text-white/60 hover:text-white text-sm transition-colors mb-2 block">← Voltar</a>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-white/60 text-sm text-center">Entrez le mot de passe pour accéder</p>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Mot de passe"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pr-11 text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/60"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <button type="submit" className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-white/90 transition-colors">
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5C300] px-4 py-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-black text-4xl font-extralight tracking-[0.3em] uppercase">ROSINI</h1>
            <p className="text-black/50 text-xs tracking-[0.2em] uppercase mt-1">PAINEL ADMINISTRATIVO</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-black/10 hover:bg-black/20 text-black text-sm rounded-xl px-4 py-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'dashboard' ? 'bg-black text-white' : 'bg-black/10 text-black hover:bg-black/20'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          <button
            onClick={() => setTab('pages')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'pages' ? 'bg-black text-white' : 'bg-black/10 text-black hover:bg-black/20'}`}
          >
            <List className="w-4 h-4" /> Toutes les pages
          </button>
        </div>

        {/* Dashboard Tab */}
        {tab === 'dashboard' && <AdminKPIs />}

        {/* Pages Tab */}
        {tab === 'pages' && (
          <div className="space-y-2">
            {navPages.map(({ name, label, icon: Icon }) => (
              <a
                key={name}
                href={createPageUrl(name)}
                className="flex items-center justify-between bg-black/10 hover:bg-black/20 rounded-xl px-4 py-3.5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-black/60" />
                  <span className="text-black font-medium text-sm">{label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-black/40 group-hover:text-black/70 transition-colors" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}