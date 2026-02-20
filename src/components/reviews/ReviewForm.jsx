import React, { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ReviewForm({ onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [driverRating, setDriverRating] = useState(5);
  const [tripRating, setTripRating] = useState(5);
  const [form, setForm] = useState({
    client_name: '',
    client_email: '',
    journey_from: '',
    journey_to: '',
    journey_date: '',
    comment: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.client_name || !form.client_email || !form.journey_from || !form.journey_to) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    try {
      await base44.entities.Review.create({
        ...form,
        driver_rating: driverRating,
        trip_rating: tripRating,
        booking_id: '', // Se integrado com reserva, adicione o ID
      });
      toast.success('Avaliação enviada com sucesso!');
      setForm({ client_name: '', client_email: '', journey_from: '', journey_to: '', journey_date: '', comment: '' });
      setDriverRating(5);
      setTripRating(5);
      onSuccess?.();
    } catch (error) {
      toast.error('Erro ao enviar avaliação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRate, label }) => (
    <div className="space-y-2">
      <label className="text-white/60 text-sm">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star)}
            className="transition-colors"
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating
                  ? 'fill-[#C9A96E] text-[#C9A96E]'
                  : 'text-white/20'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
      <h3 className="text-white font-medium mb-6">Deixe sua avaliação</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-white/60 text-sm mb-2 block">Nome *</label>
          <Input
            placeholder="Seu nome"
            value={form.client_name}
            onChange={(e) => setForm({ ...form, client_name: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-10"
          />
        </div>
        <div>
          <label className="text-white/60 text-sm mb-2 block">Email *</label>
          <Input
            type="email"
            placeholder="seu@email.com"
            value={form.client_email}
            onChange={(e) => setForm({ ...form, client_email: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-white/60 text-sm mb-2 block">De (Saída) *</label>
          <Input
            placeholder="Ex: Aeroporto"
            value={form.journey_from}
            onChange={(e) => setForm({ ...form, journey_from: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-10"
          />
        </div>
        <div>
          <label className="text-white/60 text-sm mb-2 block">Para (Chegada) *</label>
          <Input
            placeholder="Ex: Hotel"
            value={form.journey_to}
            onChange={(e) => setForm({ ...form, journey_to: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-10"
          />
        </div>
      </div>

      <div>
        <label className="text-white/60 text-sm mb-2 block">Data da viagem</label>
        <Input
          type="date"
          value={form.journey_date}
          onChange={(e) => setForm({ ...form, journey_date: e.target.value })}
          className="bg-white/5 border-white/10 text-white h-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StarRating rating={driverRating} onRate={setDriverRating} label="Avaliação do motorista" />
        <StarRating rating={tripRating} onRate={setTripRating} label="Avaliação da viagem" />
      </div>

      <div>
        <label className="text-white/60 text-sm mb-2 block">Comentário</label>
        <Textarea
          placeholder="Compartilhe sua experiência..."
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/20 min-h-24"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] font-semibold h-11"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Enviando...
          </>
        ) : (
          'Enviar Avaliação'
        )}
      </Button>
    </form>
  );
}