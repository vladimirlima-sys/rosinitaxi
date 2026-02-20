import React, { useState } from 'react';
import { Star, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ReviewForm({ booking, onSubmitted, onCancel }) {
  const [driverRating, setDriverRating] = useState(0);
  const [tripRating, setTripRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (driverRating === 0 || tripRating === 0) {
      toast.error('Veuillez noter le chauffeur et le trajet');
      return;
    }

    setIsSubmitting(true);
    try {
      await base44.entities.Review.create({
        booking_id: booking.id,
        client_name: booking.client_name,
        client_email: booking.client_email,
        driver_rating: driverRating,
        trip_rating: tripRating,
        comment: comment,
        journey_from: booking.departure_point,
        journey_to: booking.arrival_point,
        journey_date: booking.departure_date
      });
      toast.success('Avis envoyé avec succès!');
      onSubmitted();
    } catch (err) {
      toast.error('Erreur lors de l\'envoi de l\'avis');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, setRating, label }) => (
    <div className="space-y-2">
      <label className="text-white/60 text-sm">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className="transition-transform hover:scale-110"
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
    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-6">
      <h3 className="text-white text-lg font-medium">Partagez votre expérience</h3>

      <StarRating rating={driverRating} setRating={setDriverRating} label="Note du chauffeur" />
      <StarRating rating={tripRating} setRating={setTripRating} label="Note du trajet" />

      <div className="space-y-2">
        <label className="text-white/60 text-sm flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#C9A96E]" /> Commentaire (optionnel)
        </label>
        <Textarea
          placeholder="Partagez vos impressions sur votre trajet..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          maxLength={500}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] min-h-[100px]"
        />
        <p className="text-white/20 text-xs text-right">{comment.length}/500</p>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-white/10 text-white/60 hover:bg-white/5"
        >
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || (driverRating === 0 || tripRating === 0)}
          className="flex-1 bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] font-semibold"
        >
          {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Envoi...</> : 'Envoyer'}
        </Button>
      </div>
    </div>
  );
}