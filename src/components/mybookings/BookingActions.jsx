import { Download, Share2, Star, MapPin, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useState } from 'react';

export default function BookingActions({ booking, t }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadReceipt = async () => {
    try {
      setDownloading(true);
      const response = await base44.functions.invoke('generateBookingReceipt', {
        bookingId: booking.id
      });

      if (response.data.success && response.data.pdf) {
        // Decode base64 and create blob
        const binaryString = atob(response.data.pdf);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });

        // Download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ROSINI_Recibo_${booking.id.substring(0, 8)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro ao descarregar recibo:', error);
      alert('Erro ao descarregar o recibo');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const text = `Minha viagem ROSINI: ${booking.departure_point} → ${booking.arrival_point} em ${booking.departure_date}`;
    if (navigator.share) {
      navigator.share({ title: 'ROSINI Reserva', text });
    } else {
      navigator.clipboard.writeText(`${text}\n\nDetalhes: info@rosini.online`);
      alert('Link copiado!');
    }
  };

  const handleReview = () => {
    // TODO: Abrir modal de review ou navegar para página de review
    console.log('Abrir formulário de avaliação para:', booking.id);
  };

  const handleLocatePickup = () => {
    // Abrir Google Maps com a localização de pickup
    window.open(`https://maps.google.com/?q=${encodeURIComponent(booking.departure_point)}`, '_blank');
  };

  return (
    <div className="flex gap-2 flex-wrap pt-3 border-t border-white/10">
      <button
        onClick={handleDownloadReceipt}
        className="flex-1 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Recibo</span>
      </button>

      <button
        onClick={handleLocatePickup}
        className="flex-1 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
      >
        <MapPin className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Mapa</span>
      </button>

      {['paid', 'refunded'].includes(booking.payment_status) && (
        <button
          onClick={handleReview}
          className="flex-1 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <Star className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Avaliar</span>
        </button>
      )}

      <button
        onClick={handleShare}
        className="flex-1 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
      >
        <Share2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Partilhar</span>
      </button>
    </div>
  );
}