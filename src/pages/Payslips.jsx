import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { FileText, Plus, Download, Trash2, ArrowLeft, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const MONTH_LABELS = {
  '01': 'Janvier', '02': 'Février', '03': 'Mars', '04': 'Avril',
  '05': 'Mai', '06': 'Juin', '07': 'Juillet', '08': 'Août',
  '09': 'Septembre', '10': 'Octobre', '11': 'Novembre', '12': 'Décembre',
};

export default function Payslips() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Payslip.list('-created_date', 100);
    setPayslips(data);
    setLoading(false);
  };

  const handleDownload = async (p) => {
    setDownloading(p.id);
    const res = await base44.functions.invoke('generatePayslipPDF', { payslip_id: p.id });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fiche-salaire-${p.month_label?.replace(/ /g, '-')}-${p.driver_name}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloading(null);
  };

  const handleDelete = async (p) => {
    if (!confirm(`Supprimer la fiche de ${p.driver_name} — ${p.month_label} ?`)) return;
    setDeleting(p.id);
    await base44.entities.Payslip.delete(p.id);
    setPayslips(prev => prev.filter(x => x.id !== p.id));
    setDeleting(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href={createPageUrl('CreatePayslip')} className="text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div>
            <h1 className="text-lg font-bold tracking-wide">FICHES DE SALAIRE</h1>
            <p className="text-white/50 text-xs">Rosini Transports et locations SArl</p>
          </div>
        </div>
        <a
          href={createPageUrl('CreatePayslip')}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle fiche
        </a>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Chargement...</div>
        ) : payslips.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune fiche de salaire</p>
            <a href={createPageUrl('CreatePayslip')} className="mt-4 inline-block bg-black text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-800">
              Créer la première fiche
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {payslips.map(p => (
              <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{p.driver_name}</p>
                    <p className="text-sm text-gray-500">{p.month_label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Salaire brut</p>
                    <p className="font-semibold text-gray-800">CHF {p.salary_brut?.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Salaire net</p>
                    <p className="font-bold text-black">CHF {p.salary_net?.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(p)}
                      disabled={!!downloading}
                      className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                      title="Télécharger PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      disabled={!!deleting}
                      className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}