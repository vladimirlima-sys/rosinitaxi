import React from 'react';
import { Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ReviewCard({ review }) {
  const StarDisplay = ({ rating }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= rating
              ? 'fill-[#C9A96E] text-[#C9A96E]'
              : 'text-white/20'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-white font-medium text-sm">{review.client_name}</p>
          <p className="text-white/40 text-xs">
            {formatDistanceToNow(new Date(review.created_date), { addSuffix: true, locale: fr })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-white/60 text-xs mb-1">Trajet</p>
          <StarDisplay rating={review.trip_rating} />
        </div>
      </div>

      {/* Journey info */}
      <div className="flex items-center gap-2 text-xs text-white/40">
        <span className="truncate">{review.journey_from}</span>
        <span className="text-[#C9A96E]">→</span>
        <span className="truncate">{review.journey_to}</span>
      </div>

      {/* Ratings */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
        <div>
          <p className="text-white/40 text-xs mb-1">Chauffeur</p>
          <StarDisplay rating={review.driver_rating} />
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-white/70 text-sm leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
}