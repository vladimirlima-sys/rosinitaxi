import React from 'react';

export default function PaymentMethodsSummary({ paymentMethods, grandTotal }) {
  const methods = [
    { key: 'stripe', label: 'Stripe (Carte)', color: '#635BFF' },
    { key: 'twint', label: 'TWINT', color: '#FF6B6B' },
    { key: 'cash', label: 'Espèces', color: '#51CF66' }
  ];

  return (
    <div className="bg-white/60 rounded-xl p-6 border border-black/10 mb-8">
      <h3 className="text-black font-bold text-sm uppercase tracking-wider mb-4">Moyens de paiement</h3>
      <div className="space-y-3">
        {methods.map(m => {
          const method = paymentMethods[m.key];
          const percentage = grandTotal > 0 ? ((method.total / grandTotal) * 100).toFixed(1) : 0;
          return (
            <div key={m.key} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-black text-sm font-medium">{m.label}</span>
                  <span className="text-black/60 text-xs">{percentage}% ({method.count} fois)</span>
                </div>
                <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all" 
                    style={{ width: `${percentage}%`, backgroundColor: m.color }}
                  />
                </div>
                <p className="text-black/50 text-xs mt-1">CHF {method.total.toFixed(2)}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-black/10">
        <p className="text-black/60 text-xs uppercase tracking-wide">Total</p>
        <p className="text-black font-bold text-lg">CHF {grandTotal.toFixed(2)}</p>
      </div>
    </div>
  );
}