import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, MessageSquare, AlertCircle, Save, Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewCard from '@/components/reviews/ReviewCard';
import { base44 } from '@/api/base44Client';

export default function EditBookingForm({ booking, onSave }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [bookingReview, setBookingReview] = useState(null);
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const [form, setForm] = useState({
    departure_date: booking.departure_date,
    departure_time: booking.departure_time,
    client_phone: booking.client_phone,
    notes: booking.notes || '',
    driver_preference: booking.driver_preference || '',
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      onSave(form);
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
      console.error(err);
    }
    setIsSubmitting(false);
  };

  const isUpcoming = new Date(booking.departure_date) > new Date();
  const canEditDate = isUpcoming;
  const canEditPhone = true;
  const isCompleted = new Date(booking.departure_date) < new Date() && booking.payment_status === 'paid';

  React.useEffect(() => {
    if (isCompleted) {
      loadReview();
    }
  }, [isCompleted]);

  const loadReview = async () => {
    setIsLoadingReview(true);
    try {
      const reviews = await base44.entities.Review.filter({ booking_id: booking.id });
      if (reviews.length > 0) {
        setBookingReview(reviews[0]);
      }
    } catch (err) {
      console.error('Error loading review:', err);
    } finally {
      setIsLoadingReview(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Info message */}
      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex gap-3">
        <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-blue-300/80 text-sm">Vous pouvez modifier les informations de votre réservation jusqu'à 24h avant le départ.</p>
      </div>

      {/* Non-editable info */}
      <div className="p-4 rounded-lg bg-white/[0.03] border border-white/10">
        <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Détails du trajet (non modifiables)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/60 mb-1">Départ</p>
            <p className="text-white">{booking.departure_point}</p>
          </div>
          <div>
            <p className="text-white/60 mb-1">Arrivée</p>
            <p className="text-white">{booking.arrival_point}</p>
          </div>
          <div>
            <p className="text-white/60 mb-1">Véhicule</p>
            <p className="text-white">{booking.vehicle_type === 'economic' ? 'Économique' : 'Confort'}</p>
          </div>
          <div>
            <p className="text-white/60 mb-1">Passagers</p>
            <p className="text-white">{booking.passengers}</p>
          </div>
        </div>
      </div>

      {/* Editable fields */}
      <div className="space-y-4">
        <h3 className="text-white font-medium mb-4">Informations modifiables</h3>

        {canEditDate && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/60 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C9A96E]" /> Date de départ
              </Label>
              <Input
                type="date"
                value={form.departure_date}
                onChange={e => update('departure_date', e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C9A96E]" /> Heure de départ
              </Label>
              <Input
                type="time"
                value={form.departure_time}
                onChange={e => update('departure_time', e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:border-[#C9A96E] h-12"
              />
            </div>
          </div>
        )}

        {!canEditDate && (
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <p className="text-white/40 text-sm">Les détails du trajet ne peuvent plus être modifiés (départ prévu dans moins de 24h)</p>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-white/60 text-sm flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#C9A96E]" /> Téléphone
          </Label>
          <Input
            type="tel"
            placeholder="+41 XX XXX XX XX"
            value={form.client_phone}
            onChange={e => update('client_phone', e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] h-12"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white/60 text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#C9A96E]" /> Notes
          </Label>
          <Textarea
            placeholder="Informations complémentaires (bagages, sièges enfant, etc.)"
            value={form.notes}
            onChange={e => update('notes', e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white/60 text-sm flex items-center gap-2">
            <Star className="w-4 h-4 text-[#C9A96E]" /> Préférence chauffeur
          </Label>
          <Input
            placeholder="Ex: chauffeur anglophone, véhicule Mercedes, etc."
            value={form.driver_preference}
            onChange={e => update('driver_preference', e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] h-12"
          />
          <p className="text-white/20 text-xs">Nous ferons notre possible pour honorer votre préférence.</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] font-semibold h-12"
        >
          {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement...</> : <><Save className="w-4 h-4 mr-2" /> Enregistrer les modifications</>}
        </Button>
      </div>
    </form>

    {/* Review section for completed trips */}
    {isCompleted && (
      <div className="mt-8 pt-8 border-t border-white/10">
        {isLoadingReview ? (
          <div className="text-center py-4">
            <Loader2 className="w-4 h-4 text-[#C9A96E] animate-spin mx-auto" />
          </div>
        ) : bookingReview ? (
          <>
            <h3 className="text-white font-medium mb-4">Votre avis</h3>
            <ReviewCard review={bookingReview} />
          </>
        ) : showReviewForm ? (
          <ReviewForm
            booking={booking}
            onSubmitted={() => {
              setShowReviewForm(false);
              loadReview();
            }}
            onCancel={() => setShowReviewForm(false)}
          />
        ) : (
          <Button
            onClick={() => setShowReviewForm(true)}
            className="w-full bg-[#C9A96E]/10 border border-[#C9A96E]/30 text-[#C9A96E] hover:bg-[#C9A96E]/20"
          >
            <Star className="w-4 h-4 mr-2" /> Laisser un avis
          </Button>
        )}
      </div>
    )}
  );
}