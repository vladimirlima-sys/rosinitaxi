import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, Phone, Mail, Car, X, Check } from 'lucide-react';

const emptyForm = { name: '', phone: '', email: '', vehicle: '', license_plate: '', license_number: '', status: 'active', notes: '' };

export default function Drivers() {
  const [isAdmin, setIsAdmin] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

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
    const data = await base44.entities.Driver.list();
    setDrivers(data);
    setLoading(false);
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (d) => { setEditing(d); setForm({ ...d }); setShowForm(true); };

  const handleSave = async () => {
    if (editing) {
      await base44.entities.Driver.update(editing.id, form);
    } else {
      await base44.entities.Driver.create(form);
    }
    setShowForm(false);
    fetchDrivers();
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja remover este motorista?')) return;
    await base44.entities.Driver.delete(id);
    fetchDrivers();
  };

  if (isAdmin === null) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">Carregando...</div>;

  if (!isAdmin) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
      <div className="text-center">
        <h1 className="text-2xl font-light mb-2">Acesso Restrito</h1>
        <p className="text-white/50">Apenas administradores podem acessar esta página.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-light text-white mb-1">Motoristas</h1>
            <p className="text-white/50">Gerencie os motoristas da plataforma</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#F5C300] text-black font-bold px-5 py-2.5 rounded-xl hover:bg-[#e6b800] transition-all"
          >
            <Plus className="w-4 h-4" /> Novo Motorista
          </button>
        </div>

        {loading ? (
          <div className="text-white/40 text-center py-20">Carregando...</div>
        ) : drivers.length === 0 ? (
          <div className="text-white/40 text-center py-20">Nenhum motorista cadastrado.</div>
        ) : (
          <div className="grid gap-4">
            {drivers.map((d) => (
              <div key={d.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#F5C300]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#F5C300] font-bold text-sm">{d.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-medium">{d.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${d.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {d.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1">
                      {d.phone && <span className="text-white/50 text-sm flex items-center gap-1"><Phone className="w-3 h-3" />{d.phone}</span>}
                      {d.email && <span className="text-white/50 text-sm flex items-center gap-1"><Mail className="w-3 h-3" />{d.email}</span>}
                      {d.vehicle && <span className="text-white/50 text-sm flex items-center gap-1"><Car className="w-3 h-3" />{d.vehicle}{d.license_plate ? ` · ${d.license_plate}` : ''}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(d)} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(d.id)} className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-semibold">{editing ? 'Editar Motorista' : 'Novo Motorista'}</h2>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Nome *', field: 'name', type: 'text', placeholder: 'Nome completo' },
                { label: 'Telefone *', field: 'phone', type: 'tel', placeholder: '+41 XX XXX XX XX' },
                { label: 'Email', field: 'email', type: 'email', placeholder: 'email@exemplo.com' },
                { label: 'Veículo', field: 'vehicle', type: 'text', placeholder: 'Ex: Mercedes Classe E' },
                { label: 'Placa', field: 'license_plate', type: 'text', placeholder: 'Ex: VD 123 456' },
                { label: 'Nº Licença', field: 'license_number', type: 'text', placeholder: 'Número da CNH' },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label className="text-white/60 text-xs uppercase tracking-wider mb-1 block">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={form[field]}
                    onChange={(e) => setForm(p => ({ ...p, [field]: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg text-white text-sm p-3 outline-none placeholder:text-white/30 focus:border-white/50"
                  />
                </div>
              ))}
              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider mb-1 block">Status</label>
                <div className="flex gap-2">
                  {['active', 'inactive'].map(s => (
                    <button key={s} onClick={() => setForm(p => ({ ...p, status: s }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${form.status === s ? 'bg-[#F5C300] text-black' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                      {s === 'active' ? 'Ativo' : 'Inativo'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider mb-1 block">Notas</label>
                <textarea
                  placeholder="Observações..."
                  value={form.notes}
                  onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-lg text-white text-sm p-3 outline-none placeholder:text-white/30 focus:border-white/50 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 h-11 rounded-xl border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all text-sm">Cancelar</button>
              <button onClick={handleSave} disabled={!form.name || !form.phone}
                className="flex-[2] h-11 rounded-xl bg-[#F5C300] text-black font-bold text-sm hover:bg-[#e6b800] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}