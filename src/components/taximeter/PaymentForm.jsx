import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Banknote, Loader2, ArrowLeft } from 'lucide-react';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export default function PaymentForm({ amount, onPaymentComplete, onCancel, distance, departure, arrival, driverId }) {
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  const handleCashPayment = async () => {
    try {
      setLoading(true);
      setError('');
      await base44.functions.invoke('registerTaximeterPayment', {
        amount: amount,
        paymentMethod: 'cash',
        clientEmail: clientEmail || undefined,
        distance,
        departure,
        arrival,
        driverId
      });
      setLoading(false);
      onPaymentComplete('cash');
    } catch (err) {
      setError('Erreur lors de l\'enregistrement: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4">
      <div>
        <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Montant à payer</p>
        <p className="text-white text-4xl font-bold">CHF {amount.toFixed(2)}</p>
      </div>

      <div className="w-full h-[1px] bg-white/10" />

      <p className="text-white/40 text-sm uppercase tracking-wider">Email do cliente</p>
      <input
        type="email"
        value={clientEmail}
        onChange={(e) => setClientEmail(e.target.value)}
        placeholder="exemple@email.com"
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30"
      />

      <div className="w-full h-[1px] bg-white/10" />

      {!clientEmail && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
          <p className="text-yellow-400 text-sm">Veuillez saisir l'email du client</p>
        </div>
      )}

      <button
        onClick={handleCashPayment}
        disabled={loading || !clientEmail}
        className="w-full h-14 rounded-xl bg-[#F5C300] text-black font-semibold text-sm uppercase tracking-wider hover:bg-[#e6b800] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Traitement...</>
        ) : (
          <>Confirmer le paiement</>
        )}
      </button>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={onCancel}
        disabled={loading}
        className="w-full h-11 rounded-xl border border-white/10 text-white/40 text-sm uppercase tracking-wider hover:text-white/60 hover:bg-white/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>
    </div>
  );
}