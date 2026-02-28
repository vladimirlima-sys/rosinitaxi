import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';

const texts = {
  fr: {
    title: 'Annulation de réservation',
    loading: 'Chargement...',
    notFound: 'Réservation introuvable.',
    alreadyCancelled: 'Cette réservation est déjà annulée.',
    confirmTitle: 'Êtes-vous sûr(e) de vouloir annuler ?',
    trip: 'Trajet',
    date: 'Date',
    vehicle: 'Véhicule',
    total: 'Montant',
    cancelBtn: 'Confirmer l\'annulation',
    cancelling: 'Annulation...',
    successTitle: 'Réservation annulée',
    successMsg: 'Votre réservation a bien été annulée. Aucun remboursement n\'est prévu (moins de 24h avant le départ).',
    successMsgRefund: 'Votre réservation a été annulée et un remboursement complet a été initié. Il apparaîtra sur votre compte dans 5 à 10 jours ouvrables.',
    contact: 'Nous contacter',
    errorTitle: 'Erreur',
    standard: 'Standard',
    comfort: 'Confort',
    refundPolicy: 'Remboursement intégral si annulation > 24h avant le départ.',
  },
  pt: {
    title: 'Cancelamento de reserva',
    loading: 'A carregar...',
    notFound: 'Reserva não encontrada.',
    alreadyCancelled: 'Esta reserva já foi cancelada.',
    confirmTitle: 'Tem a certeza que quer cancelar?',
    trip: 'Trajeto',
    date: 'Data',
    vehicle: 'Veículo',
    total: 'Valor',
    cancelBtn: 'Confirmar cancelamento',
    cancelling: 'A cancelar...',
    successTitle: 'Reserva cancelada',
    successMsg: 'A sua reserva foi cancelada. Sem reembolso (menos de 24h antes da partida).',
    successMsgRefund: 'A sua reserva foi cancelada e um reembolso total foi iniciado. Aparecerá na sua conta em 5 a 10 dias úteis.',
    contact: 'Contactar',
    errorTitle: 'Erro',
    standard: 'Standard',
    comfort: 'Conforto',
    refundPolicy: 'Reembolso total se cancelamento > 24h antes da partida.',
  },
  en: {
    title: 'Booking Cancellation',
    loading: 'Loading...',
    notFound: 'Booking not found.',
    alreadyCancelled: 'This booking has already been cancelled.',
    confirmTitle: 'Are you sure you want to cancel?',
    trip: 'Trip',
    date: 'Date',
    vehicle: 'Vehicle',
    total: 'Amount',
    cancelBtn: 'Confirm cancellation',
    cancelling: 'Cancelling...',
    successTitle: 'Booking cancelled',
    successMsg: 'Your booking has been cancelled. No refund applies (less than 24h before departure).',
    successMsgRefund: 'Your booking has been cancelled and a full refund has been initiated. It will appear on your account within 5 to 10 business days.',
    contact: 'Contact us',
    errorTitle: 'Error',
    standard: 'Standard',
    comfort: 'Comfort',
    refundPolicy: 'Full refund if cancelled more than 24h before departure.',
  },
  de: {
    title: 'Buchung stornieren',
    loading: 'Laden...',
    notFound: 'Buchung nicht gefunden.',
    alreadyCancelled: 'Diese Buchung wurde bereits storniert.',
    confirmTitle: 'Möchten Sie wirklich stornieren?',
    trip: 'Strecke',
    date: 'Datum',
    vehicle: 'Fahrzeug',
    total: 'Betrag',
    cancelBtn: 'Stornierung bestätigen',
    cancelling: 'Wird storniert...',
    successTitle: 'Buchung storniert',
    successMsg: 'Ihre Buchung wurde storniert. Keine Erstattung (weniger als 24h vor Abfahrt).',
    successMsgRefund: 'Ihre Buchung wurde storniert und eine vollständige Erstattung wurde eingeleitet. Sie erscheint innerhalb von 5 bis 10 Werktagen auf Ihrem Konto.',
    contact: 'Kontakt',
    errorTitle: 'Fehler',
    standard: 'Standard',
    comfort: 'Komfort',
    refundPolicy: 'Vollständige Erstattung bei Stornierung mehr als 24h vor Abfahrt.',
  },
  it: {
    title: 'Cancellazione prenotazione',
    loading: 'Caricamento...',
    notFound: 'Prenotazione non trovata.',
    alreadyCancelled: 'Questa prenotazione è già stata cancellata.',
    confirmTitle: 'Sei sicuro di voler cancellare?',
    trip: 'Percorso',
    date: 'Data',
    vehicle: 'Veicolo',
    total: 'Importo',
    cancelBtn: 'Conferma cancellazione',
    cancelling: 'Cancellazione...',
    successTitle: 'Prenotazione cancellata',
    successMsg: 'La prenotazione è stata cancellata. Nessun rimborso (meno di 24h prima della partenza).',
    successMsgRefund: 'La prenotazione è stata cancellata e un rimborso completo è stato avviato. Apparirà sul vostro conto entro 5-10 giorni lavorativi.',
    contact: 'Contattaci',
    errorTitle: 'Errore',
    standard: 'Standard',
    comfort: 'Comfort',
    refundPolicy: 'Rimborso completo se cancellazione > 24h prima della partenza.',
  },
};

export default function CancelBooking() {
  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get('id');
  const lang = params.get('lang') || 'fr';
  const t = texts[lang] || texts['fr'];

  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | confirm | cancelling | success | error | not_found | already_cancelled
  const [errorMsg, setErrorMsg] = useState('');
  const [refundIssued, setRefundIssued] = useState(false);

  useEffect(() => {
    if (!bookingId) { setStatus('not_found'); return; }
    const load = async () => {
      try {
        const results = await base44.entities.Booking.filter({ id: bookingId });
        if (!results || results.length === 0) { setStatus('not_found'); return; }
        const b = results[0];
        setBooking(b);
        if (b.payment_status === 'cancelled' || b.payment_status === 'refunded') { setStatus('already_cancelled'); return; }
        setStatus('confirm');
      } catch (e) {
        setStatus('error');
        setErrorMsg(e.message);
      }
    };
    load();
  }, [bookingId]);

  const handleCancel = async () => {
    setStatus('cancelling');
    try {
      const res = await base44.functions.invoke('cancelBooking', { booking_id: bookingId });
      if (res.data?.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(res.data?.error || 'Unknown error');
      }
    } catch (e) {
      setStatus('error');
      setErrorMsg(e.message);
    }
  };

  const vehicleLabel = booking?.vehicle_type === 'comfort' ? t.comfort : t.standard;

  return (
    <div className="min-h-screen bg-[#F5C300] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-black text-5xl font-extralight tracking-[0.3em] uppercase">ROSINI</h1>
          <p className="text-black/60 text-xs tracking-[0.2em] uppercase mt-1">TRANSPORTS DE PERSONNES</p>
        </div>

        <div className="bg-black rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider">{t.title}</h2>

          {/* Loading */}
          {status === 'loading' && (
            <div className="flex items-center gap-2 text-white/60">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t.loading}</span>
            </div>
          )}

          {/* Not found */}
          {status === 'not_found' && (
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <p className="text-white/70 text-sm">{t.notFound}</p>
            </div>
          )}

          {/* Already cancelled */}
          {status === 'already_cancelled' && (
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <p className="text-white/70 text-sm">{t.alreadyCancelled}</p>
            </div>
          )}

          {/* Confirm */}
          {(status === 'confirm' || status === 'cancelling') && booking && (
            <div className="space-y-4">
              <p className="text-white/70 text-sm">{t.confirmTitle}</p>
              <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-white/50">{t.trip}</span><span className="text-white text-right max-w-[60%] truncate">{booking.departure_point} → {booking.arrival_point}</span></div>
                <div className="flex justify-between"><span className="text-white/50">{t.date}</span><span className="text-white">{booking.departure_date} {booking.departure_time}</span></div>
                <div className="flex justify-between"><span className="text-white/50">{t.vehicle}</span><span className="text-white">{vehicleLabel}</span></div>
                <div className="flex justify-between"><span className="text-white/50">{t.total}</span><span className="text-[#F5C300] font-bold">CHF {booking.total_price}</span></div>
              </div>
              <button
                onClick={handleCancel}
                disabled={status === 'cancelling'}
                className="w-full h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {status === 'cancelling' ? <><Loader2 className="w-4 h-4 animate-spin" />{t.cancelling}</> : t.cancelBtn}
              </button>
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div className="text-center space-y-3 py-4">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
              <p className="text-white font-semibold">{t.successTitle}</p>
              <p className="text-white/60 text-sm">{t.successMsg}</p>
              <a href="mailto:info@rosini.online" className="inline-block mt-2 text-[#F5C300] text-sm hover:underline">{t.contact}</a>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <p className="text-white text-sm font-semibold">{t.errorTitle}</p>
                <p className="text-white/60 text-xs mt-1">{errorMsg}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-black/70 text-xs">info@rosini.online</p>
          <p className="text-black/50 text-xs">+41 77 249 22 45</p>
        </div>
      </div>
    </div>
  );
}