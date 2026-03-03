import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Save, Eye, Calculator } from 'lucide-react';

const FormInput = ({ label, value, onChange, type = 'text', placeholder = '' }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
    />
  </div>
);

const MONTHS = [
  { value: '01', label: 'Janvier' }, { value: '02', label: 'Février' },
  { value: '03', label: 'Mars' }, { value: '04', label: 'Avril' },
  { value: '05', label: 'Mai' }, { value: '06', label: 'Juin' },
  { value: '07', label: 'Juillet' }, { value: '08', label: 'Août' },
  { value: '09', label: 'Septembre' }, { value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' }, { value: '12', label: 'Décembre' },
];

const now = new Date();

export default function CreatePayslip() {
  const [taxSettings, setTaxSettings] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [savedId, setSavedId] = useState(null);

  const [form, setForm] = useState({
    driver_name: '',
    driver_address: '',
    driver_avs: '',
    month: String(now.getMonth() + 1).padStart(2, '0'),
    year: String(now.getFullYear()),
    salary_brut: '',
    heures_travaillees: '',
    taux_horaire: '',
    notes: '',
  });

  useEffect(() => {
    base44.entities.TaxSettings.list().then(d => { if (d[0]) setTaxSettings(d[0]); });
    base44.entities.Driver.filter({ status: 'active' }).then(setDrivers);
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const salaire_brut = parseFloat(form.salary_brut) || 0;
  const tx = taxSettings || {};

  // Taux fixes pour la fiche de salaire (part employé)
  const RATES = {
    avs: 4.35,
    ai: 0.70,
    apg: 0.25,
    ac: 1.10,
    pc: 0.09,
  };

  const calc = (pct) => salaire_brut * (parseFloat(pct) || 0) / 100;

  const avs_amount = salaire_brut * RATES.avs / 100;
  const ai_amount = salaire_brut * RATES.ai / 100;
  const apg_amount = salaire_brut * RATES.apg / 100;
  const ac_amount = salaire_brut * RATES.ac / 100;
  const pc_amount = salaire_brut * RATES.pc / 100;
  const impot_source_amount = calc(tx.impot_source_percentage);
  const other_deductions_amount = calc(tx.other_deductions_percentage);
  const total_deductions = avs_amount + ai_amount + apg_amount + ac_amount + pc_amount + impot_source_amount + other_deductions_amount;
  const salary_net = salaire_brut - total_deductions;

  const monthLabel = `${MONTHS.find(m => m.value === form.month)?.label || ''} ${form.year}`;
  const monthKey = `${form.year}-${form.month}`;

  const buildPayslip = () => ({
    driver_name: form.driver_name,
    driver_address: form.driver_address,
    driver_avs: form.driver_avs,
    month: monthKey,
    month_label: monthLabel,
    salary_brut: salaire_brut,
    heures_travaillees: parseFloat(form.heures_travaillees) || null,
    taux_horaire: parseFloat(form.taux_horaire) || null,
    avs_percentage: RATES.avs,
    avs_amount,
    ai_percentage: RATES.ai,
    ai_amount,
    apg_percentage: RATES.apg,
    apg_amount,
    ac_percentage: RATES.ac,
    ac_amount,
    af_percentage: 0,
    af_amount: 0,
    pc_percentage: RATES.pc,
    pc_amount,
    cont_frais_admin_percentage: parseFloat(tx.cont_frais_admin_percentage) || 0,
    cont_frais_admin_amount,
    impot_source_percentage: parseFloat(tx.impot_source_percentage) || 0,
    impot_source_amount,
    other_deductions_percentage: parseFloat(tx.other_deductions_percentage) || 0,
    other_deductions_amount,
    total_deductions,
    salary_net,
    notes: form.notes,
  });

  const handleSave = async () => {
    if (!form.driver_name || !salaire_brut) return alert('Nom et salaire brut requis.');
    setSaving(true);
    let id = savedId;
    if (!id) {
      const created = await base44.entities.Payslip.create(buildPayslip());
      id = created.id;
      setSavedId(id);
    } else {
      await base44.entities.Payslip.update(id, buildPayslip());
    }
    setSaving(false);
    return id;
  };

  const handleDownload = async () => {
    if (!form.driver_name || !salaire_brut) return alert('Nom et salaire brut requis.');
    setDownloading(true);
    let id = savedId;
    if (!id) {
      id = await handleSave();
    }
    const res = await base44.functions.invoke('generatePayslipPDF', { payslip_id: id });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fiche-salaire-${monthLabel.replace(/ /g, '-')}-${form.driver_name}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloading(false);
  };



  const DeductRow = ({ label, pct, amount }) => {
    if (!pct && !amount) return null;
    return (
      <div className="flex justify-between items-center py-1.5 border-b border-gray-100 text-sm">
        <span className="text-gray-600">{label} <span className="text-gray-400">({pct}%)</span></span>
        <span className="font-medium text-red-600">- CHF {amount.toFixed(2)}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href={createPageUrl('Payslips')} className="text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div>
            <h1 className="text-lg font-bold tracking-wide">NOUVELLE FICHE DE SALAIRE</h1>
            <p className="text-white/50 text-xs">Rosini Transports et locations SArl</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading || saving}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            {downloading ? 'Génération...' : 'Télécharger PDF'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: Form */}
        <div className="space-y-5">

          {/* Période */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Période</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Mois</label>
                <select
                  value={form.month}
                  onChange={e => set('month', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Année</label>
                <input
                  type="number"
                  value={form.year}
                  onChange={e => set('year', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>

          {/* Employé */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Informations Employé</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nom (ou choisir)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.driver_name}
                    onChange={e => set('driver_name', e.target.value)}
                    placeholder="Nom complet"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  {drivers.length > 0 && (
                    <select
                      onChange={e => { const d = drivers.find(x => x.id === e.target.value); if (d) set('driver_name', d.name); }}
                      className="border border-gray-200 rounded-lg px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">Choisir</option>
                      {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  )}
                </div>
              </div>
              <FormInput label="Adresse" value={form.driver_address} onChange={v => set('driver_address', v)} placeholder="Rue, NPA Ville" />
              <FormInput label="N° AVS" value={form.driver_avs} onChange={v => set('driver_avs', v)} placeholder="756.XXXX.XXXX.XX" />
            </div>
          </div>

          {/* Salaire */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Salaire</h2>
            <div className="space-y-3">
              <FormInput label="Salaire brut (CHF)" value={form.salary_brut} onChange={v => set('salary_brut', v)} type="number" placeholder="0.00" />
              <div className="grid grid-cols-2 gap-3">
                <FormInput label="Heures travaillées" value={form.heures_travaillees} onChange={v => set('heures_travaillees', v)} type="number" placeholder="0" />
                <FormInput label="Taux horaire (CHF)" value={form.taux_horaire} onChange={v => set('taux_horaire', v)} type="number" placeholder="0.00" />
              </div>
              <FormInput label="Notes" value={form.notes} onChange={v => set('notes', v)} placeholder="Remarques éventuelles..." />
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-4 h-4 text-gray-500" />
              <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Calcul automatique des charges</h2>
            </div>

            {!taxSettings && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-3 mb-4">
                ⚠️ Paramètres de charges non configurés. Allez dans <strong>Paramètres → Taxes</strong>.
              </p>
            )}

            {/* Brut */}
            <div className="flex justify-between items-center py-2 border-b-2 border-black mb-2">
              <span className="font-bold text-gray-900">Salaire brut</span>
              <span className="font-bold text-gray-900">CHF {salaire_brut.toFixed(2)}</span>
            </div>

            <div className="mb-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Déductions (part employé)</p>
              <DeductRow label="AVS" pct={tx.avs_percentage} amount={avs_amount} />
              <DeductRow label="AI" pct={tx.ai_percentage} amount={ai_amount} />
              <DeductRow label="APG" pct={tx.apg_percentage} amount={apg_amount} />
              <DeductRow label="AC" pct={tx.ac_percentage} amount={ac_amount} />
              <DeductRow label="AF" pct={tx.af_percentage} amount={af_amount} />
              <DeductRow label="PC" pct={tx.pc_percentage} amount={pc_amount} />
              <DeductRow label="Impôt à la source" pct={tx.impot_source_percentage} amount={impot_source_amount} />
              {tx.other_deductions_percentage > 0 && (
                <DeductRow label="Autres" pct={tx.other_deductions_percentage} amount={other_deductions_amount} />
              )}
            </div>

            <div className="flex justify-between items-center py-2 border-t border-gray-200 text-sm">
              <span className="text-gray-600 font-medium">Total déductions</span>
              <span className="font-semibold text-red-600">- CHF {total_deductions.toFixed(2)}</span>
            </div>

            <div className="mt-3 bg-black rounded-xl px-4 py-4 flex justify-between items-center">
              <span className="text-white font-bold">SALAIRE NET</span>
              <span className="text-white text-xl font-bold">CHF {salary_net.toFixed(2)}</span>
            </div>

            {salaire_brut > 0 && (
              <div className="mt-3 bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 text-center">
                  Charges employé: <strong>{((total_deductions / salaire_brut) * 100).toFixed(1)}%</strong> du salaire brut
                </p>
              </div>
            )}
          </div>

          {savedId && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 text-center font-medium">
              ✓ Fiche enregistrée — <a href={createPageUrl('Payslips')} className="underline">Voir toutes les fiches</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}