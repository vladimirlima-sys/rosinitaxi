import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Mail, ArrowRight, CalendarDays, MapPin, Car, CreditCard, XCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import BookingFilters from '@/components/mybookings/BookingFilters';
import CancelCountdown from '@/components/mybookings/CancelCountdown';
import BookingDetails from '@/components/mybookings/BookingDetails';
import BookingActions from '@/components/mybookings/BookingActions';
import NextTripHighlight from '@/components/mybookings/NextTripHighlight';
import SupportChat from '@/components/mybookings/SupportChat';

const T = {
  fr: {
    title: 'Mes réservations',
    subtitle: 'Entrez votre email pour accéder à vos réservations',
    emailLabel: 'Adresse email',
    emailPlaceholder: 'votre@email.com',
    searchBtn: 'Voir mes réservations',
    searching: 'Recherche...',
    noBookings: 'Aucune réservation trouvée pour cet email.',
    trip: 'Trajet',
    date: 'Date & heure',
    vehicle: 'Véhicule',
    passengers: 'Passagiers',
    total: 'Montant',
    status: 'Statut',
    cancelBtn: 'Annuler',
    back: 'Retour',
    statusLabels: { pending: 'En attente', paid: 'Payé', cancelled: 'Annulé', refunded: 'Remboursé' },
    vehicleLabels: { economic: 'Standard', comfort: 'Confort' },
    confirmCancel: 'Confirmer l\'annulation',
    confirmCancelMsg: 'Êtes-vous sûr de vouloir annuler cette réservation ?',
    cancelling: 'Annulation...',
    cancelSuccess: 'Réservation annulée avec succès.',
    cancelError: 'Erreur lors de l\'annulation.',
    refundPolicy: 'Remboursement intégral si annulation plus de 24h avant le départ.',
    contact: 'Des questions ? info@rosini.online | +41 77 249 22 45',
    payment: { stripe: 'Carte bancaire', twint: 'TWINT', cash: 'Espèces' },
  },
  pt: {
    title: 'As minhas reservas',
    subtitle: 'Insira o seu email para aceder às suas reservas',
    emailLabel: 'Endereço de email',
    emailPlaceholder: 'seu@email.com',
    searchBtn: 'Ver as minhas reservas',
    searching: 'A procurar...',
    noBookings: 'Nenhuma reserva encontrada para este email.',
    trip: 'Trajeto',
    date: 'Data & hora',
    vehicle: 'Veículo',
    passengers: 'Passageiros',
    total: 'Valor',
    status: 'Estado',
    cancelBtn: 'Cancelar',
    back: 'Voltar',
    statusLabels: { pending: 'Pendente', paid: 'Pago', cancelled: 'Cancelado', refunded: 'Reembolsado' },
    vehicleLabels: { economic: 'Standard', comfort: 'Conforto' },
    confirmCancel: 'Confirmar cancelamento',
    confirmCancelMsg: 'Tem a certeza que quer cancelar esta reserva?',
    cancelling: 'A cancelar...',
    cancelSuccess: 'Reserva cancelada com sucesso.',
    cancelError: 'Erro ao cancelar.',
    refundPolicy: 'Reembolso total se cancelamento mais de 24h antes da partida.',
    contact: 'Perguntas? info@rosini.online | +41 77 249 22 45',
    payment: { stripe: 'Cartão bancário', twint: 'TWINT', cash: 'Dinheiro' },
  },
  en: {
    title: 'My Bookings',
    subtitle: 'Enter your email to access your bookings',
    emailLabel: 'Email address',
    emailPlaceholder: 'your@email.com',
    searchBtn: 'View my bookings',
    searching: 'Searching...',
    noBookings: 'No bookings found for this email.',
    trip: 'Trip',
    date: 'Date & time',
    vehicle: 'Vehicle',
    passengers: 'Passengers',
    total: 'Amount',
    status: 'Status',
    cancelBtn: 'Cancel',
    back: 'Back',
    statusLabels: { pending: 'Pending', paid: 'Paid', cancelled: 'Cancelled', refunded: 'Refunded' },
    vehicleLabels: { economic: 'Standard', comfort: 'Comfort' },
    confirmCancel: 'Confirm cancellation',
    confirmCancelMsg: 'Are you sure you want to cancel this booking?',
    cancelling: 'Cancelling...',
    cancelSuccess: 'Booking successfully cancelled.',
    cancelError: 'Error cancelling booking.',
    refundPolicy: 'Full refund if cancelled more than 24h before departure.',
    contact: 'Questions? info@rosini.online | +41 77 249 22 45',
    payment: { stripe: 'Credit card', twint: 'TWINT', cash: 'Cash' },
  },
  de: {
    title: 'Meine Buchungen',
    subtitle: 'Geben Sie Ihre E-Mail-Adresse ein, um auf Ihre Buchungen zuzugreifen',
    emailLabel: 'E-Mail-Adresse',
    emailPlaceholder: 'ihre@email.com',
    searchBtn: 'Meine Buchungen anzeigen',
    searching: 'Suche...',
    noBookings: 'Keine Buchungen für diese E-Mail gefunden.',
    trip: 'Strecke',
    date: 'Datum & Uhrzeit',
    vehicle: 'Fahrzeug',
    passengers: 'Passagiere',
    total: 'Betrag',
    status: 'Status',
    cancelBtn: 'Stornieren',
    back: 'Zurück',
    statusLabels: { pending: 'Ausstehend', paid: 'Bezahlt', cancelled: 'Storniert', refunded: 'Erstattet' },
    vehicleLabels: { economic: 'Standard', comfort: 'Komfort' },
    confirmCancel: 'Stornierung bestätigen',
    confirmCancelMsg: 'Möchten Sie diese Buchung wirklich stornieren?',
    cancelling: 'Wird storniert...',
    cancelSuccess: 'Buchung erfolgreich storniert.',
    cancelError: 'Fehler beim Stornieren.',
    refundPolicy: 'Vollständige Erstattung bei Stornierung mehr als 24h vor Abfahrt.',
    contact: 'Fragen? info@rosini.online | +41 77 249 22 45',
    payment: { stripe: 'Kreditkarte', twint: 'TWINT', cash: 'Bargeld' },
  },
  it: {
    title: 'Le mie prenotazioni',
    subtitle: 'Inserisci la tua email per accedere alle tue prenotazioni',
    emailLabel: 'Indirizzo email',
    emailPlaceholder: 'tua@email.com',
    searchBtn: 'Vedi le mie prenotazioni',
    searching: 'Ricerca...',
    noBookings: 'Nessuna prenotazione trovata per questa email.',
    trip: 'Percorso',
    date: 'Data & ora',
    vehicle: 'Veicolo',
    passengers: 'Passeggeri',
    total: 'Importo',
    status: 'Stato',
    cancelBtn: 'Annulla',
    back: 'Indietro',
    statusLabels: { pending: 'In attesa', paid: 'Pagato', cancelled: 'Annullato', refunded: 'Rimborsato' },
    vehicleLabels: { economic: 'Standard', comfort: 'Comfort' },
    confirmCancel: 'Conferma annullamento',
    confirmCancelMsg: 'Sei sicuro di voler annullare questa prenotazione?',
    cancelling: 'Annullamento...',
    cancelSuccess: 'Prenotazione annullata con successo.',
    cancelError: 'Errore durante l\'annullamento.',
    refundPolicy: 'Rimborso completo se annullamento più di 24h prima della partenza.',
    contact: 'Domande? info@rosini.online | +41 77 249 22 45',
    payment: { stripe: 'Carta di credito', twint: 'TWINT', cash: 'Contanti' },
  },
  es: {
    title: 'Mis reservas',
    subtitle: 'Ingresa tu email para acceder a tus reservas',
    emailLabel: 'Dirección de email',
    emailPlaceholder: 'tu@email.com',
    searchBtn: 'Ver mis reservas',
    searching: 'Buscando...',
    noBookings: 'No se encontraron reservas para este email.',
    trip: 'Trayecto',
    date: 'Fecha & hora',
    vehicle: 'Vehículo',
    passengers: 'Pasajeros',
    total: 'Importe',
    status: 'Estado',
    cancelBtn: 'Cancelar',
    back: 'Volver',
    statusLabels: { pending: 'Pendiente', paid: 'Pagado', cancelled: 'Cancelado', refunded: 'Reembolsado' },
    vehicleLabels: { economic: 'Standard', comfort: 'Confort' },
    confirmCancel: 'Confirmar cancelación',
    confirmCancelMsg: '¿Estás seguro de que quieres cancelar esta reserva?',
    cancelling: 'Cancelando...',
    cancelSuccess: 'Reserva cancelada con éxito.',
    cancelError: 'Error al cancelar.',
    refundPolicy: 'Reembolso completo si se cancela más de 24h antes de la salida.',
    contact: '¿Preguntas? info@rosini.online | +41 77 249 22 45',
    payment: { stripe: 'Tarjeta bancaria', twint: 'TWINT', cash: 'Efectivo' },
  },
  nl: {
    title: 'Mijn boekingen',
    subtitle: 'Voer uw e-mailadres in om uw boekingen te bekijken',
    emailLabel: 'E-mailadres',
    emailPlaceholder: 'uw@email.com',
    searchBtn: 'Mijn boekingen bekijken',
    searching: 'Zoeken...',
    noBookings: 'Geen boekingen gevonden voor dit e-mailadres.',
    trip: 'Route',
    date: 'Datum & tijd',
    vehicle: 'Voertuig',
    passengers: 'Passagiers',
    total: 'Bedrag',
    status: 'Status',
    cancelBtn: 'Annuleren',
    back: 'Terug',
    statusLabels: { pending: 'In afwachting', paid: 'Betaald', cancelled: 'Geannuleerd', refunded: 'Terugbetaald' },
    vehicleLabels: { economic: 'Standard', comfort: 'Comfort' },
    confirmCancel: 'Annulering bevestigen',
    confirmCancelMsg: 'Weet u zeker dat u deze boeking wilt annuleren?',
    cancelling: 'Annuleren...',
    cancelSuccess: 'Boeking succesvol geannuleerd.',
    cancelError: 'Fout bij het annuleren.',
    refundPolicy: 'Volledige terugbetaling bij annulering meer dan 24u voor vertrek.',
    contact: 'Vragen? info@rosini.online | +41 77 249 22 45',
    payment: { stripe: 'Creditcard', twint: 'TWINT', cash: 'Contant' },
  },
};

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-300',
  paid: 'bg-green-500/20 text-green-300',
  cancelled: 'bg-red-500/20 text-red-300',
  refunded: 'bg-blue-500/20 text-blue-300',
};

export default function MyBookings() {
  const params = new URLSearchParams(window.location.search);
  const langParam = params.get('lang') || 'fr';
  const emailParam = params.get('email') || '';

  const t = T[langParam] || T.fr;

  const [email, setEmail] = useState(emailParam);
  const [bookings, setBookings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelResult, setCancelResult] = useState({});
  const [filters, setFilters] = useState({ status: 'all', sort: 'date-desc' });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setBookings(null);
    setCancelResult({});
    try {
      const results = await base44.entities.Booking.filter({ client_email: email.trim().toLowerCase() });
      // Sort by departure_date descending
      results.sort((a, b) => new Date(b.departure_date) - new Date(a.departure_date));
      setBookings(results);
    } catch (err) {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    setCancellingId(bookingId);
    setCancelTarget(null);
    try {
      const res = await base44.functions.invoke('cancelBooking', { booking_id: bookingId });
      if (res.data?.success) {
        setCancelResult(prev => ({ ...prev, [bookingId]: 'success' }));
        // Update local state
        setBookings(prev => prev.map(b =>
          b.id === bookingId
            ? { ...b, payment_status: res.data.refund_issued ? 'refunded' : 'cancelled' }
            : b
        ));
      } else {
        setCancelResult(prev => ({ ...prev, [bookingId]: 'error' }));
      }
    } catch {
      setCancelResult(prev => ({ ...prev, [bookingId]: 'error' }));
    } finally {
      setCancellingId(null);
    }
  };

  const canCancel = (b) =>
    b.payment_status !== 'cancelled' && b.payment_status !== 'refunded';

  const filteredAndSorted = useMemo(() => {
    if (!bookings) return [];
    
    let result = bookings;
    
    // Filtrar por status
    if (filters.status !== 'all') {
      result = result.filter(b => b.payment_status === filters.status);
    }
    
    // Ordenar
    if (filters.sort === 'date-desc') {
      result.sort((a, b) => new Date(b.departure_date) - new Date(a.departure_date));
    } else if (filters.sort === 'date-asc') {
      result.sort((a, b) => new Date(a.departure_date) - new Date(b.departure_date));
    } else if (filters.sort === 'price-desc') {
      result.sort((a, b) => b.total_price - a.total_price);
    } else if (filters.sort === 'price-asc') {
      result.sort((a, b) => a.total_price - b.total_price);
    }
    
    return result;
  }, [bookings, filters]);

  const nextTrip = useMemo(() => {
    if (!bookings) return null;
    const now = new Date();
    const upcoming = bookings
      .filter(b => b.payment_status !== 'cancelled' && b.payment_status !== 'refunded')
      .filter(b => new Date(`${b.departure_date}T${b.departure_time}`) > now)
      .sort((a, b) => new Date(a.departure_date) - new Date(b.departure_date));
    return upcoming[0] || null;
  }, [bookings]);

  return (
    <div className="min-h-screen bg-[#F5C300] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-black text-5xl font-extralight tracking-[0.3em] uppercase">ROSINI</h1>
          <p className="text-black/60 text-xs tracking-[0.2em] uppercase mt-1">TRANSPORTS DE PERSONNES</p>
        </div>

        {/* Email form */}
        <div className="bg-black rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">{t.title}</h2>
          <p className="text-white/50 text-sm mb-5">{t.subtitle}</p>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#F5C300]/50"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="h-12 px-5 bg-[#F5C300] hover:bg-[#e6b800] text-black font-bold text-sm rounded-xl flex items-center gap-2 transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span className="hidden sm:inline">{loading ? t.searching : t.searchBtn}</span>
            </button>
          </form>
        </div>

        {/* Results */}
        {bookings !== null && (
          <>
            {bookings.length === 0 ? (
              <div className="bg-black rounded-2xl p-6 text-center">
                <p className="text-white/60 text-sm">{t.noBookings}</p>
              </div>
            ) : (
              <>
                {nextTrip && <NextTripHighlight booking={nextTrip} t={t} />}
                <BookingFilters filters={filters} setFilters={setFilters} t={t} />
                <div className="space-y-4">
                  {filteredAndSorted.map(b => (
                  <div key={b.id} className="bg-black rounded-2xl p-5 space-y-4">
                    {/* Trip */}
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-[#F5C300] mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{b.departure_point}</p>
                        <p className="text-white/40 text-xs">→</p>
                        <p className="text-white text-sm font-medium truncate">{b.arrival_point}</p>
                      </div>
                    </div>

                    {/* Details row */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2 text-white/60">
                        <CalendarDays className="w-3.5 h-3.5 text-[#F5C300]/60" />
                        <span>{b.departure_date} {b.departure_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/60">
                        <Car className="w-3.5 h-3.5 text-[#F5C300]/60" />
                        <span>{t.vehicleLabels[b.vehicle_type] || b.vehicle_type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/60">
                        <CreditCard className="w-3.5 h-3.5 text-[#F5C300]/60" />
                        <span>{t.payment[b.payment_method] || b.payment_method}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[b.payment_status] || 'bg-white/10 text-white/60'}`}>
                          {t.statusLabels[b.payment_status] || b.payment_status}
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="text-white/50 text-xs">{t.total}</span>
                      <span className="text-[#F5C300] font-bold text-lg">CHF {b.total_price}</span>
                    </div>

                    {/* Cancel result feedback */}
                    {cancelResult[b.id] === 'success' && (
                      <div className="flex items-center gap-2 text-green-400 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>{t.cancelSuccess}</span>
                      </div>
                    )}
                    {cancelResult[b.id] === 'error' && (
                      <div className="flex items-center gap-2 text-red-400 text-sm">
                        <XCircle className="w-4 h-4" />
                        <span>{t.cancelError}</span>
                      </div>
                    )}

                    {/* Countdown */}
                    {canCancel(b) && !cancelResult[b.id] && <CancelCountdown departureDate={b.departure_date} departureTime={b.departure_time} />}

                    {/* Details */}
                    <BookingDetails booking={b} t={t} />

                    {/* Actions */}
                    <BookingActions booking={b} t={t} />

                    {/* Cancel button */}
                    {canCancel(b) && !cancelResult[b.id] && (
                      cancelTarget === b.id ? (
                        <div className="bg-white/5 rounded-xl p-4 space-y-3 mt-3">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-white text-sm">{t.confirmCancelMsg}</p>
                              <p className="text-white/40 text-xs mt-1">{t.refundPolicy}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setCancelTarget(null)}
                              className="flex-1 h-9 rounded-lg border border-white/20 text-white/60 text-sm hover:bg-white/5 transition-colors"
                            >
                              {t.back}
                            </button>
                            <button
                              onClick={() => handleCancel(b.id)}
                              disabled={cancellingId === b.id}
                              className="flex-1 h-9 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                            >
                              {cancellingId === b.id
                                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />{t.cancelling}</>
                                : t.confirmCancel}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setCancelTarget(b.id)}
                          className="w-full h-9 rounded-xl border border-red-500/40 text-red-400 text-sm hover:bg-red-500/10 transition-colors"
                        >
                          {t.cancelBtn}
                        </button>
                      )
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="text-center mt-8 space-y-1">
          <p className="text-black/60 text-xs">{t.contact}</p>
        </div>
      </div>
    </div>
  );
}