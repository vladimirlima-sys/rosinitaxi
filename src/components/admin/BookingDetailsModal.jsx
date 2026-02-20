import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function BookingDetailsModal({ booking, onStatusChange, onClose }) {
  const [newStatus, setNewStatus] = useState(booking.payment_status);

  const handleStatusChange = (status) => {
    setNewStatus(status);
  };

  const handleSave = () => {
    if (newStatus !== booking.payment_status) {
      onStatusChange(newStatus);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-white font-medium">Editar status de pagamento</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-white/60 text-sm mb-3">Novo status:</p>
            <div className="space-y-2">
              {['pending', 'paid', 'cancelled'].map((status) => (
                <label key={status} className="flex items-center gap-3 p-3 rounded-lg border border-white/10 cursor-pointer hover:border-[#C9A96E]/50 transition-colors"
                  style={{
                    borderColor: newStatus === status ? '#C9A96E' : 'rgba(255,255,255,0.1)',
                    backgroundColor: newStatus === status ? 'rgba(201,169,110,0.1)' : 'transparent'
                  }}
                >
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={newStatus === status}
                    onChange={() => handleStatusChange(status)}
                    className="w-4 h-4 accent-[#C9A96E]"
                  />
                  <span className="text-white capitalize">
                    {status === 'pending' ? 'Pendente' : status === 'paid' ? 'Pago' : 'Cancelado'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-white/10 text-white hover:bg-white/5"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A]"
            >
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}