import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import ReviewCard from './ReviewCard';
import { Loader2, Star } from 'lucide-react';

export default function ReviewList() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ avgDriver: 0, avgTrip: 0, total: 0 });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.Review.list('-created_date', 100);
      setReviews(data);

      if (data.length > 0) {
        const avgDriver = (data.reduce((sum, r) => sum + r.driver_rating, 0) / data.length).toFixed(1);
        const avgTrip = (data.reduce((sum, r) => sum + r.trip_rating, 0) / data.length).toFixed(1);
        setStats({ avgDriver, avgTrip, total: data.length });
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const StarDisplay = ({ rating }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`w-3 h-3 ${
            star <= rating
              ? 'fill-[#C9A96E] text-[#C9A96E]'
              : 'text-white/20'
          }`}
        />
      ))}
    </div>
  );

  return (
    <section className="py-16 px-6 bg-[#0A0A0A]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[#C9A96E] text-sm tracking-[0.3em] uppercase mb-4">Avis</p>
          <h2 className="text-3xl md:text-4xl font-light text-white mb-4">Ce que nos clients disent</h2>
          <div className="w-12 h-[1px] bg-[#C9A96E] mx-auto mb-6" />
        </div>

        {/* Stats */}
        {stats.total > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <p className="text-white/60 text-sm mb-2">Total d'avis</p>
              <p className="text-[#C9A96E] text-3xl font-light">{stats.total}</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <p className="text-white/60 text-sm mb-3">Note chauffeur</p>
              <div className="flex items-center gap-3">
                <p className="text-[#C9A96E] text-2xl font-light">{stats.avgDriver}</p>
                <StarDisplay rating={Math.round(stats.avgDriver)} />
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <p className="text-white/60 text-sm mb-3">Note trajet</p>
              <div className="flex items-center gap-3">
                <p className="text-[#C9A96E] text-2xl font-light">{stats.avgTrip}</p>
                <StarDisplay rating={Math.round(stats.avgTrip)} />
              </div>
            </div>
          </div>
        )}

        {/* Reviews */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-[#C9A96E] animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/40">Aucun avis pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}