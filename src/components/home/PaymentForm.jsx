import React, { useState } from 'react';
import { CreditCard, Lock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function PaymentForm({ totalPrice, onSubmit, isSubmitting, onBack }) {
  const [card, setCard] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: ''
  });

  const formatCardNumber = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    return cleaned;
  };

  const isValid = card.number.replace(/\s/g, '').length === 16 && card.name && card.expiry.length === 5 && card.cvc.length >= 3;

  return (
    <div className="space-y-6">
      {/* Card visual */}
      <div className="relative h-48 rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] border border-white/10 p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#C9A96E]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#C9A96E]/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-7 rounded bg-[#C9A96E]/30 border border-[#C9A96E]/50" />
            <CreditCard className="w-8 h-8 text-white/20" />
          </div>
          <div>
            <p className="text-white/80 text-lg tracking-[0.2em] font-mono mb-3">
              {card.number || '•••• •••• •••• ••••'}
            </p>
            <div className="flex justify-between">
              <p className="text-white/40 text-sm uppercase">{card.name || 'NOM DU TITULAIRE'}</p>
              <p className="text-white/40 text-sm">{card.expiry || 'MM/AA'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card inputs */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-white/60 text-sm">Numéro de carte</Label>
          <Input
            placeholder="1234 5678 9012 3456"
            value={card.number}
            onChange={e => setCard(prev => ({ ...prev, number: formatCardNumber(e.target.value) }))}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] h-12 font-mono"
            maxLength={19}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white/60 text-sm">Nom du titulaire</Label>
          <Input
            placeholder="Nom sur la carte"
            value={card.name}
            onChange={e => setCard(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] h-12 uppercase"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white/60 text-sm">Expiration</Label>
            <Input
              placeholder="MM/AA"
              value={card.expiry}
              onChange={e => setCard(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] h-12"
              maxLength={5}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white/60 text-sm">CVC</Label>
            <Input
              placeholder="123"
              type="password"
              value={card.cvc}
              onChange={e => setCard(prev => ({ ...prev, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] h-12"
              maxLength={4}
            />
          </div>
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-center gap-2 text-white/30 text-xs">
        <Lock className="w-3.5 h-3.5" />
        <span>Paiement sécurisé — Vos données sont protégées</span>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-white/10 text-white/60 hover:bg-white/5 h-12"
        >
          Retour
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!isValid || isSubmitting}
          className="bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] font-semibold px-8 h-12 min-w-[200px]"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Traitement...</>
          ) : (
            <>Payer CHF {totalPrice}</>
          )}
        </Button>
      </div>
    </div>
  );
}