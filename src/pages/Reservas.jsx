import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { createPageUrl } from '@/utils';
import BookingsTable from '@/components/admin/BookingsTable';

export default function Reservas() {
  useEffect(() => {
    if (localStorage.getItem('admin_unlocked') !== 'true') {
      window.location.href = createPageUrl('AdminPanel');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <a
            href={createPageUrl('AdminPanel')}
            className="flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </a>
          <h1 className="text-4xl font-light text-white">Reservas</h1>
        </div>
        <p className="text-white/50 mb-8">Gerencie reservas e configurações da plataforma</p>

        <BookingsTable />
      </div>
    </div>
  );
}