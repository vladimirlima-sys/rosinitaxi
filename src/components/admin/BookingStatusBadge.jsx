import React from 'react';
import { CheckCircle2, Clock, AlertCircle, CreditCard } from 'lucide-react';

export default function BookingStatusBadge({ status, paymentMethod }) {
  // Stripe pending = awaiting payment confirmation (not yet confirmed)
  const isAwaitingStripe = status === 'pending' && paymentMethod === 'stripe';

  const config = {
    awaiting_stripe: { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: CreditCard, label: 'Aguardando Stripe' },
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Clock, label: 'Pendente' },
    paid: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle2, label: 'Pago' },
    cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', icon: AlertCircle, label: 'Cancelado' },
    refunded: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: AlertCircle, label: 'Reembolsado' },
  };

  const key = isAwaitingStripe ? 'awaiting_stripe' : (status || 'pending');
  const current = config[key] || config.pending;
  const Icon = current.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${current.bg}`}>
      <Icon className={`w-4 h-4 ${current.text}`} />
      <span className={`text-sm font-medium ${current.text}`}>{current.label}</span>
    </div>
  );
}