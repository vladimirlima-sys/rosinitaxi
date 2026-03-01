import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, Phone, Mail, Car, User, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import DriverForm from '@/components/drivers/DriverForm';
import { createPageUrl } from '@/utils';

export default function Drivers() {
  const [isAdmin, setIsAdmin] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState({}); // { driverId: totalCHF }

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

  useEffect(() => {
    if (isAdmin) fetchDrivers();
  }, [isAdmin]);

  const fetchDrivers = async () => {
    setLoading(true);
    const data = await base44.entities.Driver.list('-created_date');
    setDrivers(data);
    setLoading(false);
    fetchMonthlyRevenue();
  };

  const fetchMonthlyRevenue = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const startDate = `${year}-${month}-01`;
    const endDate = `${year}-${month}-31`;
    const bookings = await base44.entities.Booking.list('-departure_date', 500);
    const revenue = {};
    bookings.forEach(b => {
      if (!b.driver_id) return;
      if (b.payment_status !== 'paid') return;
      if (!b.departure_date || b.departure_date < startDate || b.departure_date > endDate) return;
      revenue[b.driver_id] = (revenue[b.driver_id] || 0) + (b.total_price || 0);
    });
    setMonthlyRevenue(revenue);
  };

  const handleSave = async (form) => {
    if (editingDriver) {
      await base44.entities.Driver.update(editingDriver.id, form);
    } else {
      await base44.entities.Driver.create(form);
    }
    setShowForm(false);
    setEditingDriver(null);
    fetchDrivers();
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja remover este motorista?')) return;
    await base44.entities.Driver.delete(id);
    fetchDrivers();
  };

  if (isAdmin === null) {
    return <div className="min-h-screen bg-[#F5C300] flex items-center justify-center text-black">Carregando...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F5C300] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light mb-2 text-black">Acesso Restrito</h1>
          <p className="text-black/60">Apenas administradores podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  const active = drivers.filter(d => d.status === 'active').length;
  const inactive = drivers.filter(d => d.status === 'inactive').length;

  return (
    <div className="min-h-screen bg-[#F5C300] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-black text-6xl font-extralight tracking-[0.3em] uppercase">ROSINI</h1>
          <p className="text-black/60 text-sm tracking-[0.2em] uppercase mt-2">MOTORISTAS</p>
          <div className="w-8 h-[1px] bg-black/40 mx-auto mt-3 mb-8" />
          <button
            onClick={() => { setEditingDriver(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-black/80 transition-all mx-auto mb-4"
          >
            <Plus className="w-4 h-4" />
            Novo Motorista
          </button>
          <p className="text-black/60 text-sm">{active} ativos · {inactive} inativos</p>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-black/30 text-center py-20">Carregando...</div>
        ) : drivers.length === 0 ? (
          <div className="text-center py-20">
            <User className="w-10 h-10 text-black/20 mx-auto mb-3" />
            <p className="text-black/30">Nenhum motorista cadastrado ainda.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {drivers.map(driver => (
              <div key={driver.id} className="bg-black border border-black/40 rounded-xl p-4 flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <span className="text-white font-semibold text-lg">{driver.name.charAt(0).toUpperCase()}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-medium truncate">{driver.name}</p>
                    {driver.status === 'active' ? (
                      <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full shrink-0">
                        <CheckCircle className="w-3 h-3" /> Ativo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full shrink-0">
                        <XCircle className="w-3 h-3" /> Inativo
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {driver.phone && (
                      <span className="flex items-center gap-1 text-white/40 text-xs">
                        <Phone className="w-3 h-3" />{driver.phone}
                      </span>
                    )}
                    {driver.email && (
                      <span className="flex items-center gap-1 text-white/40 text-xs">
                        <Mail className="w-3 h-3" />{driver.email}
                      </span>
                    )}
                    {driver.vehicle && (
                      <span className="flex items-center gap-1 text-white/40 text-xs">
                        <Car className="w-3 h-3" />{driver.vehicle}
                      </span>
                    )}
                    {driver.license_number && (
                      <span className="text-white/40 text-xs">CNH: {driver.license_number}</span>
                    )}
                  </div>
                  {driver.notes && <p className="text-white/30 text-xs mt-1 truncate">{driver.notes}</p>}
                </div>

                {/* Monthly revenue */}
                <div className="text-right shrink-0 mr-2">
                  <p className="text-white/60 text-xs uppercase tracking-wider">Este mês</p>
                  <p className={`text-sm font-bold mt-0.5 ${monthlyRevenue[driver.id] ? 'text-white' : 'text-white/40'}`}>
                    {monthlyRevenue[driver.id] ? `CHF ${monthlyRevenue[driver.id].toFixed(2)}` : '—'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <a
                    href={createPageUrl('DriverPortal')}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Abrir portal do motorista"
                    className="w-9 h-9 rounded-lg border border-white/20 flex items-center justify-center text-white/40 hover:text-white hover:border-white/40 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleEdit(driver)}
                    className="w-9 h-9 rounded-lg border border-white/20 flex items-center justify-center text-white/40 hover:text-white hover:border-white/40 transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(driver.id)}
                    className="w-9 h-9 rounded-lg border border-white/20 flex items-center justify-center text-white/40 hover:text-red-400 hover:border-red-400/40 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <DriverForm
          driver={editingDriver}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingDriver(null); }}
        />
      )}
    </div>
  );
}