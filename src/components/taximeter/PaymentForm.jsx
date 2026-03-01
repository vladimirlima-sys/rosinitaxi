import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CreditCard, Banknote, Smartphone, Loader2, ArrowLeft } from 'lucide-react';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export default function PaymentForm({ amount, onPaymentComplete, onCancel, distance, departure, arrival }) {
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  const handleCardPayment = async () => {
    if (window.self !== window.top) {
      setError('Le paiement par carte fonctionne uniquement depuis l\'app publiée');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Register payment
      await base44.functions.invoke('registerTaximeterPayment', {
        amount: amount,
        paymentMethod: 'card',
        clientEmail,
        distance,
        departure,
        arrival
      });
      
      // Redirect to Stripe
      const response = await base44.functions.invoke('createCheckout', {
        amount: Math.round(amount * 100),
        currency: 'chf',
        paymentMethod: 'card'
      });
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      setError('Erreur lors du paiement: ' + err.message);
      setLoading(false);
    }
  };

  const handleCashPayment = async () => {
    try {
      setLoading(true);
      setError('');
      await base44.functions.invoke('registerTaximeterPayment', {
        amount: amount,
        paymentMethod: 'cash',
        clientEmail,
        distance,
        departure,
        arrival
      });
      onPaymentComplete('cash');
    } catch (err) {
      setError('Erreur lors de l\'enregistrement: ' + err.message);
      setLoading(false);
    }
  };

  const handleTwintPayment = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Register payment
      await base44.functions.invoke('registerTaximeterPayment', {
        amount: amount,
        paymentMethod: 'twint',
        clientEmail,
        distance,
        departure,
        arrival
      });
      
      // Redirect to payment (or just complete if TWINT doesn't need redirect)
      const response = await base44.functions.invoke('createCheckout', {
        amount: Math.round(amount * 100),
        currency: 'chf',
        paymentMethod: 'twint'
      });
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        onPaymentComplete('twint');
      }
    } catch (err) {
      setError('Erreur lors do paiement: ' + err.message);
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

      <p className="text-white/40 text-sm uppercase tracking-wider">Mode de paiement</p>

      <div className="space-y-3">
        <button
          onClick={handleCardPayment}
          disabled={loading}
          className="w-full h-14 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 text-white font-semibold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Traitement...</>
          ) : (
            <><CreditCard className="w-5 h-5" /> Carte Bancaire</>
          )}
        </button>

        <button
          onClick={handleTwintPayment}
          disabled={loading}
          className="w-full h-14 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 text-white font-semibold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Traitement...</>
          ) : (
            <><Smartphone className="w-5 h-5" /> TWINT</>
          )}
        </button>

        <button
          onClick={handleCashPayment}
          disabled={loading}
          className="w-full h-14 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 text-white font-semibold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Banknote className="w-5 h-5" /> Espèces
        </button>
      </div>

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