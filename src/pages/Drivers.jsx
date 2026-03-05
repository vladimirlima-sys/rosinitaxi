import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, Phone, Mail, Car, User, CheckCircle, XCircle, ExternalLink, ArrowLeft, Copy, Check, Search, Eye, EyeOff, Lock } from 'lucide-react';
import DriverForm from '@/components/drivers/DriverForm';
import DeleteDriverModal from '@/components/drivers/DeleteDriverModal';
import CredentialManager from '@/components/drivers/CredentialManager';
import { createPageUrl } from '@/utils';

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRevenue, setShowRevenue] = useState(false);
  const [selectedDriverForCredential, setSelectedDriverForCredential] = useState(null);
  const [geoEnabled, setGeoEnabled] = useState(false);

  // Request geolocation once; auto-activate if previously granted
  useEffect(() => {
    const autoGeo = () => {
      navigator.geolocation.getCurrentPosition(
        () => { setGeoEnabled(true); localStorage.setItem('drivers_geo_granted', '1'); },
        () => setGeoEnabled(false),
        { enableHighAccuracy: true }
      );
    };
    if (!navigator.geolocation) return;
    if (localStorage.getItem('drivers_geo_granted') === '1') {
      autoGeo();
    } else if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        if (result.state === 'granted') { autoGeo(); }
      });
    }
  }, []);

  const requestGeolocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      () => { setGeoEnabled(true); localStorage.setItem('drivers_geo_granted', '1'); },
      () => setGeoEnabled(false),
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    fetchDrivers();
    const unsubscribe = base44.entities.Booking.subscribe(() => {
      fetchMonthlyRevenue();
    });
    return unsubscribe;
  }, []);

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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await base44.entities.Driver.delete(deleteTarget.id);
    setDeleteTarget(null);
    fetchDrivers();
  };

  const copyDriverId = (driver) => {
    navigator.clipboard.writeText(driver.id);
    setCopiedId(driver.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredDrivers = drivers.filter(d =>
    !searchQuery ||
    d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.phone?.includes(searchQuery) ||
    d.vehicle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const active = drivers.filter(d => d.status === 'active').length;
  const inactive = drivers.filter(d => d.status === 'inactive').length;

  return (
    <div className="min-h-screen bg-[#F5C300] py-6 md:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <a
          href={createPageUrl('AdminPanel')}
          className="flex items-center gap-1 text-black/40 hover:text-black/70 transition-colors mb-6 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
        </a>
        <div className="text-center mb-6 md:mb-10">
          <h1 className="text-black text-4xl md:text-6xl font-extralight tracking-[0.3em] uppercase">ROSINI</h1>
          <p className="text-black/60 text-xs md:text-sm tracking-[0.2em] uppercase mt-2">CHAUFFEURS</p>
          <div className="w-8 h-[1px] bg-black/40 mx-auto mt-3 mb-6 md:mb-8" />
          <button
            onClick={() => { setEditingDriver(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-black text-white px-3 md:px-4 py-2 md:py-2.5 rounded-lg font-semibold text-xs md:text-sm hover:bg-black/80 transition-all mx-auto mb-3 md:mb-4"
          >
            <Plus className="w-4 h-4" />
            Nouveau chauffeur
          </button>
          <p className="text-black/60 text-xs md:text-sm">{active} actifs · {inactive} inactifs</p>
        </div>

        {/* Search bar */}
        {drivers.length > 0 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher un chauffeur..."
              className="w-full bg-black/10 border border-black/20 rounded-xl pl-9 pr-4 py-2.5 text-black text-sm placeholder:text-black/40 outline-none focus:border-black/40"
            />
          </div>
        )}

        {loading ? (
          <div className="text-black/30 text-center py-20">Chargement...</div>
        ) : filteredDrivers.length === 0 ? (
          <div className="text-center py-20">
            <User className="w-10 h-10 text-black/20 mx-auto mb-3" />
            <p className="text-black/30">{searchQuery ? 'Aucun résultat.' : 'Aucun chauffeur enregistré.'}</p>
          </div>
        ) : (
          <>
            {/* Revenue toggle */}
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowRevenue(v => !v)}
                className="flex items-center gap-1.5 text-xs text-black/50 hover:text-black/70 transition-colors"
              >
                {showRevenue ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showRevenue ? 'Masquer revenus' : 'Afficher revenus'}
              </button>
            </div>

            <div className="grid gap-2 md:gap-3">
              {filteredDrivers.map(driver => (
                <div key={driver.id} className="bg-black border border-black/40 rounded-lg md:rounded-xl p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <span className="text-white font-semibold text-base md:text-lg">{driver.name.charAt(0).toUpperCase()}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 md:gap-2 mb-1 flex-wrap">
                      <p className="text-white font-medium text-sm md:text-base truncate">{driver.name}</p>
                      {driver.status === 'active' ? (
                        <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full shrink-0">
                          <CheckCircle className="w-3 h-3" /> Actif
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded-full shrink-0">
                          <XCircle className="w-3 h-3" /> Inactif
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 md:gap-x-4 md:gap-y-1 text-xs md:text-sm">
                      {driver.phone && (
                        <span className="flex items-center gap-1 text-white/40">
                          <Phone className="w-3 h-3 shrink-0" /><span className="truncate">{driver.phone}</span>
                        </span>
                      )}
                      {driver.email && (
                        <span className="flex items-center gap-1 text-white/40">
                          <Mail className="w-3 h-3 shrink-0" /><span className="truncate">{driver.email}</span>
                        </span>
                      )}
                      {driver.vehicle && (
                        <span className="flex items-center gap-1 text-white/40">
                          <Car className="w-3 h-3 shrink-0" /><span className="truncate">{driver.vehicle}</span>
                        </span>
                      )}
                    </div>
                    {driver.notes && <p className="text-white/30 text-xs mt-0.5 md:mt-1 truncate">{driver.notes}</p>}
                  </div>

                  {/* Monthly revenue */}
                  <div className="flex items-center justify-between md:block md:text-right shrink-0 md:mr-2 border-t md:border-t-0 border-white/10 pt-2 md:pt-0">
                    <p className="text-white/60 text-xs uppercase tracking-wider">Ce mois</p>
                    <p className={`text-sm font-bold transition-all duration-300 ${monthlyRevenue[driver.id] ? 'text-white' : 'text-white/40'} ${!showRevenue && monthlyRevenue[driver.id] ? 'blur-sm select-none' : ''}`}>
                      {monthlyRevenue[driver.id] ? `CHF ${monthlyRevenue[driver.id].toFixed(2)}` : '—'}
                    </p>
                  </div>

                  <div className="flex gap-1 md:gap-2 shrink-0">
                   <button
                     onClick={() => copyDriverId(driver)}
                     title="Copier l'ID du chauffeur"
                     className="w-8 h-8 md:w-9 md:h-9 rounded-lg border border-white/20 flex items-center justify-center text-white/40 hover:text-[#F5C300] hover:border-[#F5C300]/40 transition-all"
                   >
                     {copiedId === driver.id ? <Check className="w-3 h-3 md:w-4 md:h-4 text-green-400" /> : <Copy className="w-3 h-3 md:w-4 md:h-4" />}
                   </button>
                   <button
                     onClick={() => setSelectedDriverForCredential(driver)}
                     title="Gérer accès sécurisé"
                     className="w-8 h-8 md:w-9 md:h-9 rounded-lg border border-white/20 flex items-center justify-center text-white/40 hover:text-blue-400 hover:border-blue-400/40 transition-all"
                   >
                     <Lock className="w-3 h-3 md:w-4 md:h-4" />
                   </button>
                   <button
                     onClick={() => handleEdit(driver)}
                     className="w-8 h-8 md:w-9 md:h-9 rounded-lg border border-white/20 flex items-center justify-center text-white/40 hover:text-white hover:border-white/40 transition-all"
                   >
                     <Pencil className="w-3 h-3 md:w-4 md:h-4" />
                   </button>
                   <button
                     onClick={() => setDeleteTarget(driver)}
                     className="w-8 h-8 md:w-9 md:h-9 rounded-lg border border-white/20 flex items-center justify-center text-white/40 hover:text-red-400 hover:border-red-400/40 transition-all"
                   >
                     <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                   </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showForm && (
        <DriverForm
          driver={editingDriver}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingDriver(null); }}
        />
      )}

      {deleteTarget && (
        <DeleteDriverModal
          driver={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {selectedDriverForCredential && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-black flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Accès Sécurisé
              </h2>
              <button
                onClick={() => setSelectedDriverForCredential(null)}
                className="text-black/40 hover:text-black/60 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-black/60 mb-4">{selectedDriverForCredential.name}</p>
            <CredentialManager driver={selectedDriverForCredential} />
          </div>
        </div>
      )}
    </div>
  );
}