import { Phone, MessageCircle, Star, Car } from 'lucide-react';

export default function DriverCard({ driver, booking }) {
  const rating = driver?.rating || 4.8;
  const reviews = driver?.reviews || 127;

  const handleWhatsApp = () => {
    const message = `Bonjour, j'attends ma course Rosini Transfert. Réservation ID: ${booking.id}`;
    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/${driver.phone}?text=${encodedMsg}`, '_blank');
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
      <p className="text-white/50 text-xs uppercase tracking-wider mb-4">Chauffeur assigné</p>

      {driver ? (
        <>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white text-lg font-semibold">{driver.name}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(rating)
                          ? 'fill-[#C9A96E] text-[#C9A96E]'
                          : 'text-white/20'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-white/60 text-sm ml-1">
                  {rating} ({reviews} avis)
                </span>
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          {driver.vehicle && (
            <div className="bg-white/5 rounded-lg p-3 mb-4 flex items-center gap-2">
              <Car className="w-4 h-4 text-[#C9A96E]" />
              <div>
                <p className="text-white/50 text-xs">Véhicule</p>
                <p className="text-white text-sm font-medium">{driver.vehicle}</p>
              </div>
            </div>
          )}

          {/* Contact Buttons */}
          <div className="flex gap-3">
            {driver.phone && (
              <>
                <a
                  href={`tel:${driver.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#C9A96E]/10 border border-[#C9A96E]/30 text-[#C9A96E] px-4 py-2 rounded-lg hover:bg-[#C9A96E]/20 transition-all font-medium text-sm"
                >
                  <Phone className="w-4 h-4" />
                  Appeler
                </a>
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/20 transition-all font-medium text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        <p className="text-white/40 text-sm">Aucun chauffeur assigné pour le moment</p>
      )}
    </div>
  );
}