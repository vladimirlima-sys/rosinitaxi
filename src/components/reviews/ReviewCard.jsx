import React from 'react';
import { Star } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ReviewCard({ review }) {
  const StarDisplay = ({ rating }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'fill-[#C9A96E] text-[#C9A96E]' : 'text-white/20'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white font-medium">{review.client_name}</p>
          <p className="text-white/40 text-sm">
            {review.journey_date && format(new Date(review.journey_date), 'dd MMM yyyy', { locale: ptBR })}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-sm">Motorista</span>
          <StarDisplay rating={review.driver_rating} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-sm">Viagem</span>
          <StarDisplay rating={review.trip_rating} />
        </div>
      </div>

      {review.journey_from && review.journey_to && (
        <p className="text-white/40 text-sm">
          {review.journey_from} → {review.journey_to}
        </p>
      )}

      {review.comment && (
        <p className="text-white text-sm leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
}