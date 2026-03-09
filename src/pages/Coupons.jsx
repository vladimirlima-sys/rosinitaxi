import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Tag, CheckCircle, XCircle, ArrowLeft, Users } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState(10);
  const [newExpiry, setNewExpiry] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadCoupons(); }, []);

  const loadCoupons = async () => {
    setLoading(true);
    const data = await base44.entities.Coupon.list('-created_date', 100);
    setCoupons(data);
    setLoading(false);
  };

  const handleCreate = async () => {
    setError('');
    if (!newCode.trim()) { setError('Insira um código.'); return; }
    const exists = coupons.find(c => c.code.toUpperCase() === newCode.trim().toUpperCase());
    if (exists) { setError('Este código já existe.'); return; }
    setCreating(true);
    await base44.entities.Coupon.create({
      code: newCode.trim().toUpperCase(),
      discount_percentage: newDiscount,
      is_active: true,
      used_by_emails: [],
      used_count: 0,
      expires_at: newExpiry || undefined,
    });
    setNewCode('');
    setNewDiscount(10);
    setNewExpiry('');
    setCreating(false);
    loadCoupons();
  };

  const toggleActive = async (coupon) => {
    await base44.entities.Coupon.update(coupon.id, { is_active: !coupon.is_active });
    loadCoupons();
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminar este cupão?')) return;
    await base44.entities.Coupon.delete(id);
    loadCoupons();
  };

  const active = coupons.filter(c => c.is_active).length;
  const inactive = coupons.filter(c => !c.is_active).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <a href={createPageUrl('AdminPanel')} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Tag className="w-6 h-6 text-yellow-500" /> Gestão de Cupões
            </h1>
            <p className="text-gray-500 text-sm">{active} ativos · {inactive} desativados · cada email pode usar 1 vez</p>
          </div>
        </div>

        {/* Create form */}
        <div className="bg-white rounded-2xl shadow-sm border p-5 space-y-4">
          <h2 className="font-semibold text-gray-700">Criar novo cupão</h2>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Código (ex: VERAO25)"
              value={newCode}
              onChange={e => setNewCode(e.target.value.toUpperCase())}
              className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[140px] uppercase font-mono"
            />
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
              <span className="text-sm text-gray-500">Desconto</span>
              <input
                type="number" min="1" max="100"
                value={newDiscount}
                onChange={e => setNewDiscount(Number(e.target.value))}
                className="w-14 text-sm text-center font-semibold outline-none"
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
            <input
              type="date"
              value={newExpiry}
              onChange={e => setNewExpiry(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm text-gray-500"
              title="Data de expiração (opcional)"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {creating ? 'A criar...' : 'Criar cupão'}
          </button>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">A carregar...</div>
          ) : coupons.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Nenhum cupão criado ainda.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Código</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Desconto</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Estado</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Utilizações</span>
                  </th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Expiração</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold text-gray-900">{c.code}</td>
                    <td className="px-4 py-3 text-yellow-600 font-semibold">{c.discount_percentage}%</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(c)}
                        className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full transition-colors ${
                          c.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {c.is_active
                          ? <><CheckCircle className="w-3 h-3" /> Ativo</>
                          : <><XCircle className="w-3 h-3" /> Inativo</>
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-700 font-semibold">{c.used_count || 0}</span>
                      <span className="text-gray-400 text-xs ml-1">
                        {(c.used_by_emails || []).length > 0 && `(${(c.used_by_emails || []).join(', ')})`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                      {c.expires_at || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(c.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}