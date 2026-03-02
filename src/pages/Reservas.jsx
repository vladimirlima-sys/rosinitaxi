import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
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
        <h1 className="text-4xl font-light text-white mb-2">Reservas</h1>
        <p className="text-white/50 mb-8">Gerencie reservas e configurações da plataforma</p>

        <BookingsTable />
      </div>
    </div>
  );
}