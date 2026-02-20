import React, { useState } from 'react';
import { X, Mail, ChevronLeft, Edit2, Trash2, Check, Clock, MapPin, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import BookingCard from './BookingCard';
import EditBookingForm from './EditBookingForm';

export default function BookingsModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isEditingMode, setIsEditingMode] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Veuillez entrer votre email');
      return;
    }

    setIsLoading(true);
    setSearchAttempted(true);
    try {
      const result = await base44.entities.Booking.filter({ client_email: email });
      setBookings(result || []);
      if (result.length === 0) {
        toast.info('Aucune réservation trouvée pour cet email');
      }
    } catch (err) {
      toast.error('Erreur lors de la récupération des réservations');
      console.error(err);
    }
    setIsLoading(false);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation?')) return;

    try {
      await base44.entities.Booking.update(bookingId, { payment_status: 'cancelled' });
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, payment_status: 'cancelled' } : b));
      toast.success('Réservation annulée');
    } catch (err) {
      toast.error('Erreur lors de l\'annulation');
      console.error(err);
    }
  };

  const handleUpdateBooking = async (bookingId, updatedData) => {
    try {
      await base44.entities.Booking.update(bookingId, updatedData);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updatedData } : b));
      setIsEditingMode(false);
      setSelectedBooking(null);
      toast.success('Réservation mise à jour');
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0A0A0A] border-b border-white/10 px-6 py-4 flex justify-between items-center">
          {isEditingMode ? (
            <button onClick={() => setIsEditingMode(false)} className="flex items-center gap-2 text-[#C9A96E] hover:text-[#B8955D]">
              <ChevronLeft className="w-4 h-4" /> Retour
            </button>
          ) : (
            <h2 className="text-xl font-light text-white">Mes réservations</h2>
          )}
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!bookings ? (
            // Email search form
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/60 text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#C9A96E]" /> Votre email
                </Label>
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A96E] h-12"
                />
                <p className="text-white/30 text-xs">Entrez l'email utilisé pour votre réservation</p>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#C9A96E] hover:bg-[#B8955D] text-[#0A0A0A] font-semibold h-12"
              >
                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Recherche...</> : 'Voir mes réservations'}
              </Button>
            </form>
          ) : isEditingMode && selectedBooking ? (
            // Edit booking form
            <EditBookingForm
              booking={selectedBooking}
              onSave={(updatedData) => handleUpdateBooking(selectedBooking.id, updatedData)}
            />
          ) : (
            // Bookings list
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/40 text-sm">Aucune réservation trouvée</p>
                  <Button
                    onClick={() => { setBookings(null); setEmail(''); setSearchAttempted(false); }}
                    variant="outline"
                    className="mt-4 border-[#C9A96E]/30 text-[#C9A96E] hover:bg-[#C9A96E]/10"
                  >
                    Nouvelle recherche
                  </Button>
                </div>
              ) : (
                <>
                  {bookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onEdit={() => {
                        setSelectedBooking(booking);
                        setIsEditingMode(true);
                      }}
                      onCancel={() => handleCancelBooking(booking.id)}
                    />
                  ))}
                  <Button
                    onClick={() => { setBookings(null); setEmail(''); setSearchAttempted(false); }}
                    variant="outline"
                    className="w-full border-[#C9A96E]/30 text-[#C9A96E] hover:bg-[#C9A96E]/10"
                  >
                    Nouvelle recherche
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}