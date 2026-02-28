import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function BookingStatusBadge({ status }) {
  const config = {
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Clock, label: 'Pendente' },
    paid: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle2, label: 'Pago' },
    cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', icon: AlertCircle, label: 'Cancelado' },
    refunded: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: AlertCircle, label: 'Reembolsado' },
  };

  const current = config[status] || config.pending;
  const Icon = current.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${current.bg}`}>
      <Icon className={`w-4 h-4 ${current.text}`} />
      <span className={`text-sm font-medium ${current.text}`}>{current.label}</span>
    </div>
  );
}