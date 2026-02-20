import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PriceSettingsForm from '@/components/admin/PriceSettingsForm';

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(null);

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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-light text-white mb-2">Painel Admin</h1>
        <p className="text-white/50 mb-12">Gerencie as configurações da plataforma</p>

        <PriceSettingsForm />
      </div>
    </div>
  );
}