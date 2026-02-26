import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import BookingsTable from '@/components/admin/BookingsTable';

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState('bookings');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        setIsAdmin(user?.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
    };
    checkAuth();
  }, []);

  if (isAdmin === null) {
    return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">Carregando...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-light mb-2">Acesso Restrito</h1>
          <p className="text-white/50">Apenas administradores podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-light text-white mb-2">Painel Admin</h1>
        <p className="text-white/50 mb-8">Gerencie reservas e configurações da plataforma</p>

        <div className="flex gap-2 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'bookings'
                ? 'border-[#C9A96E] text-[#C9A96E]'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Reservas
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'settings'
                ? 'border-[#C9A96E] text-[#C9A96E]'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            Configurações
          </button>
        </div>

        {activeTab === 'bookings' && <BookingsTable />}
        {activeTab === 'settings' && <PriceSettingsForm />}
      </div>
    </div>
  );
}