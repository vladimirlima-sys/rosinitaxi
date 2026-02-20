import React, { useEffect, useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReviewCard from './ReviewCard';

export default function ReviewList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await base44.entities.Review.list('-created_date', 10);
        setReviews(data);
      } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#C9A96E] animate-spin" />
      </div>
    );
  }

  const avgDriverRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.driver_rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  const avgTripRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.trip_rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-8">
      {reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/[0.03] border border-[#C9A96E]/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-5 h-5 fill-[#C9A96E] text-[#C9A96E]" />
              <span className="text-white/60 text-sm">Motorista</span>
            </div>
            <p className="text-4xl font-light text-[#C9A96E]">{avgDriverRating}</p>
            <p className="text-white/40 text-xs mt-1">baseado em {reviews.length} avaliações</p>
          </div>

          <div className="bg-white/[0.03] border border-[#C9A96E]/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-5 h-5 fill-[#C9A96E] text-[#C9A96E]" />
              <span className="text-white/60 text-sm">Viagem</span>
            </div>
            <p className="text-4xl font-light text-[#C9A96E]">{avgTripRating}</p>
            <p className="text-white/40 text-xs mt-1">baseado em {reviews.length} avaliações</p>
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-white/40">Nenhuma avaliação ainda</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}