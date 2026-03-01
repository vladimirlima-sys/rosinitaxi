import React, { useState } from 'react';
import { Search, X, Edit2, AlertTriangle, CheckCircle, Loader2, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/components/LanguageContext';

const labels = {
  fr: {
    title: 'Consulter ma réservation',
    emailPlaceholder: 'Votre adresse e-mail de réservation',
    search: 'Rechercher',
    noBooking: 'Aucune réservation trouvée pour cet e-mail.',
    from: 'De',
    to: 'À',
    date: 'Date',
    time: 'Heure',
    vehicle: 'Véhicule',
    price: 'Prix',
    status: 'Statut',
    cancelBtn: 'Annuler la réservation',
    editBtn: 'Modifier les notes',
    cancelWarning24: '⚠️ Cette réservation part dans moins de 24h. En cas d\'annulation, aucun remboursement ne sera effectué si le paiement a été réalisé par carte via Stripe.',
    cancelWarningFree: 'L\'annulation est gratuite (plus de 24h avant le départ).',
    confirmCancel: 'Confirmer l\'annulation',
    cancelledSuccess: 'Réservation annulée.',
    saveNotes: 'Enregistrer',
    notesLabel: 'Notes / modifications souhaitées',
    notesSaved: 'Notes mises à jour.',
    statuses: { pending: 'En attente', paid: 'Payé', cancelled: 'Annulé', refunded: 'Remboursé' },
    loading: 'Chargement...',
    close: 'Fermer',
    editNotesInfo: 'Décrivez vos modifications (horaire, adresse, etc.) et nous vous contacterons.',
  },
  en: {
    title: 'Check my booking',
    emailPlaceholder: 'Your booking email address',
    search: 'Search',
    noBooking: 'No booking found for this email.',
    from: 'From', to: 'To', date: 'Date', time: 'Time', vehicle: 'Vehicle', price: 'Price', status: 'Status',
    cancelBtn: 'Cancel booking',
    editBtn: 'Request changes',
    cancelWarning24: '⚠️ This booking departs in less than 24h. If cancelled, no refund will be issued for card payments via Stripe.',
    cancelWarningFree: 'Cancellation is free (more than 24h before departure).',
    confirmCancel: 'Confirm cancellation',
    cancelledSuccess: 'Booking cancelled.',
    saveNotes: 'Save',
    notesLabel: 'Notes / requested changes',
    notesSaved: 'Notes updated.',
    statuses: { pending: 'Pending', paid: 'Paid', cancelled: 'Cancelled', refunded: 'Refunded' },
    loading: 'Loading...',
    close: 'Close',
    editNotesInfo: 'Describe your changes (time, address, etc.) and we will contact you.',
  },
  pt: {
    title: 'Consultar a minha reserva',
    emailPlaceholder: 'O seu e-mail de reserva',
    search: 'Pesquisar',
    noBooking: 'Nenhuma reserva encontrada para este e-mail.',
    from: 'De', to: 'Para', date: 'Data', time: 'Hora', vehicle: 'Veículo', price: 'Preço', status: 'Estado',
    cancelBtn: 'Cancelar reserva',
    editBtn: 'Pedir alterações',
    cancelWarning24: '⚠️ Esta reserva parte em menos de 24h. Em caso de cancelamento, não haverá reembolso para pagamentos por cartão via Stripe.',
    cancelWarningFree: 'O cancelamento é gratuito (mais de 24h antes da partida).',
    confirmCancel: 'Confirmar cancelamento',
    cancelledSuccess: 'Reserva cancelada.',
    saveNotes: 'Guardar',
    notesLabel: 'Notas / alterações pretendidas',
    notesSaved: 'Notas atualizadas.',
    statuses: { pending: 'Pendente', paid: 'Pago', cancelled: 'Cancelado', refunded: 'Reembolsado' },
    loading: 'A carregar...',
    close: 'Fechar',
    editNotesInfo: 'Descreva as suas alterações (hora, morada, etc.) e entraremos em contacto.',
  },
  de: {
    title: 'Meine Buchung einsehen',
    emailPlaceholder: 'Ihre Buchungs-E-Mail-Adresse',
    search: 'Suchen',
    noBooking: 'Keine Buchung für diese E-Mail gefunden.',
    from: 'Von', to: 'Nach', date: 'Datum', time: 'Uhrzeit', vehicle: 'Fahrzeug', price: 'Preis', status: 'Status',
    cancelBtn: 'Buchung stornieren',
    editBtn: 'Änderung anfragen',
    cancelWarning24: '⚠️ Diese Buchung beginnt in weniger als 24h. Bei Stornierung erfolgt keine Rückerstattung für Kartenzahlungen via Stripe.',
    cancelWarningFree: 'Die Stornierung ist kostenlos (mehr als 24h vor Abfahrt).',
    confirmCancel: 'Stornierung bestätigen',
    cancelledSuccess: 'Buchung storniert.',
    saveNotes: 'Speichern',
    notesLabel: 'Notizen / gewünschte Änderungen',
    notesSaved: 'Notizen aktualisiert.',
    statuses: { pending: 'Ausstehend', paid: 'Bezahlt', cancelled: 'Storniert', refunded: 'Erstattet' },
    loading: 'Laden...',
    close: 'Schließen',
    editNotesInfo: 'Beschreiben Sie Ihre Änderungen und wir melden uns.',
  },
  it: {
    title: 'Consulta la mia prenotazione',
    emailPlaceholder: 'Il tuo indirizzo e-mail di prenotazione',
    search: 'Cerca',
    noBooking: 'Nessuna prenotazione trovata per questa email.',
    from: 'Da', to: 'A', date: 'Data', time: 'Ora', vehicle: 'Veicolo', price: 'Prezzo', status: 'Stato',
    cancelBtn: 'Cancella prenotazione',
    editBtn: 'Richiedi modifiche',
    cancelWarning24: '⚠️ Questa prenotazione parte tra meno di 24h. In caso di cancellazione, nessun rimborso per pagamenti con carta via Stripe.',
    cancelWarningFree: 'La cancellazione è gratuita (più di 24h prima della partenza).',
    confirmCancel: 'Conferma cancellazione',
    cancelledSuccess: 'Prenotazione cancellata.',
    saveNotes: 'Salva',
    notesLabel: 'Note / modifiche richieste',
    notesSaved: 'Note aggiornate.',
    statuses: { pending: 'In attesa', paid: 'Pagato', cancelled: 'Cancellato', refunded: 'Rimborsato' },
    loading: 'Caricamento...',
    close: 'Chiudi',
    editNotesInfo: 'Descrivi le modifiche e ti contatteremo.',
  },
};

function isLessThan24h(departure_date, departure_time) {
  if (!departure_date || !departure_time) return false;
  const [y, m, d] = departure_date.split('-').map(Number);
  const [h, min] = departure_time.split(':').map(Number);
  const departure = new Date(y, m - 1, d, h, min);
  const diffMs = departure.getTime() - Date.now();
  return diffMs > 0 && diffMs < 24 * 60 * 60 * 1000;
}

export default function MyBookingCard() {
  const { lang } = useLang();
  const t = labels[lang] || labels['fr'];

  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [mode, setMode] = useState(null); // null | 'cancel' | 'edit'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSearch = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setNotFound(false);
    setBookings(null);
    setSuccessMsg('');
    setMode(null);
    setSelectedBooking(null);
    const results = await base44.entities.Booking.filter({ client_email: email.trim().toLowerCase() }, '-departure_date', 10);
    const active = results.filter(b => b.payment_status !== 'cancelled');
    setLoading(false);
    if (!active.length) { setNotFound(true); return; }
    setBookings(active);
  };

  const handleCancel = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    await base44.entities.Booking.update(selectedBooking.id, { payment_status: 'cancelled' });
    setBookings(prev => prev.filter(b => b.id !== selectedBooking.id));
    setMode(null);
    setSelectedBooking(null);
    setSuccessMsg(t.cancelledSuccess);
    setActionLoading(false);
  };

  const handleSaveNotes = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    await base44.entities.Booking.update(selectedBooking.id, { notes });
    setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, notes } : b));
    setMode(null);
    setSelectedBooking(null);
    setSuccessMsg(t.notesSaved);
    setActionLoading(false);
  };

  const openCancel = (booking) => { setSelectedBooking(booking); setMode('cancel'); setSuccessMsg(''); };
  const openEdit = (booking) => { setSelectedBooking(booking); setNotes(booking.notes || ''); setMode('edit'); setSuccessMsg(''); };
  const closeAction = () => { setMode(null); setSelectedBooking(null); };

  const statusColor = { pending: 'text-yellow-400', paid: 'text-green-400', cancelled: 'text-red-400', refunded: 'text-blue-400' };

  return (
    <div className="bg-black border border-black/40 rounded-xl p-4 space-y-3 mt-4">
      <div className="flex items-center gap-2 mb-1">
        <Mail className="w-4 h-4 text-[#F5C300]" />
        <h3 className="text-white font-semibold text-sm uppercase tracking-wider">{t.title}</h3>
      </div>

      {/* Email search */}
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder={t.emailPlaceholder}
          className="flex-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm p-3 outline-none placeholder:text-white/40 focus:border-white/60"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-[#F5C300] text-black font-bold text-sm rounded-lg hover:bg-[#e6b800] transition-all flex items-center gap-1 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {t.search}
        </button>
      </div>

      {/* Not found */}
      {notFound && <p className="text-white/50 text-sm text-center py-2">{t.noBooking}</p>}

      {/* Success message */}
      {successMsg && (
        <div className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 rounded-lg p-3">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Booking list */}
      {bookings && bookings.map(booking => (
        <div key={booking.id} className="border border-white/10 rounded-xl p-3 space-y-2 bg-white/5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div><span className="text-white/40">{t.from}</span> <span className="text-white">{booking.departure_point}</span></div>
            <div><span className="text-white/40">{t.to}</span> <span className="text-white">{booking.arrival_point}</span></div>
            <div><span className="text-white/40">{t.date}</span> <span className="text-white">{booking.departure_date}</span></div>
            <div><span className="text-white/40">{t.time}</span> <span className="text-white">{booking.departure_time}</span></div>
            <div><span className="text-white/40">{t.vehicle}</span> <span className="text-white uppercase">{booking.vehicle_type}</span></div>
            <div><span className="text-white/40">{t.price}</span> <span className="text-[#F5C300] font-bold">CHF {booking.total_price}</span></div>
            <div><span className="text-white/40">{t.status}</span> <span className={`font-semibold ${statusColor[booking.payment_status] || 'text-white'}`}>{t.statuses[booking.payment_status] || booking.payment_status}</span></div>
          </div>

          {/* Cancel / Edit modal inline */}
          {mode === 'cancel' && selectedBooking?.id === booking.id && (
            <div className="mt-2 space-y-2 border-t border-white/10 pt-3">
              {isLessThan24h(booking.departure_date, booking.departure_time) ? (
                <div className="flex gap-2 items-start bg-red-900/30 border border-red-500/40 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-300 text-xs leading-relaxed">{t.cancelWarning24}</p>
                </div>
              ) : (
                <div className="flex gap-2 items-start bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <p className="text-green-300 text-xs">{t.cancelWarningFree}</p>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={closeAction} className="flex-1 h-9 rounded-lg border border-white/20 text-white/60 text-xs hover:bg-white/10 transition-all">{t.close}</button>
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="flex-[2] h-9 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-all flex items-center justify-center gap-1 disabled:opacity-60"
                >
                  {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  {t.confirmCancel}
                </button>
              </div>
            </div>
          )}

          {mode === 'edit' && selectedBooking?.id === booking.id && (
            <div className="mt-2 space-y-2 border-t border-white/10 pt-3">
              <p className="text-white/50 text-xs">{t.editNotesInfo}</p>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder={t.notesLabel}
                className="w-full bg-white/10 border border-white/20 rounded-lg text-white text-sm p-3 outline-none placeholder:text-white/40 focus:border-white/60 resize-none"
              />
              <div className="flex gap-2">
                <button onClick={closeAction} className="flex-1 h-9 rounded-lg border border-white/20 text-white/60 text-xs hover:bg-white/10 transition-all">{t.close}</button>
                <button
                  onClick={handleSaveNotes}
                  disabled={actionLoading}
                  className="flex-[2] h-9 rounded-lg bg-[#F5C300] text-black font-bold text-xs hover:bg-[#e6b800] transition-all flex items-center justify-center gap-1 disabled:opacity-60"
                >
                  {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  {t.saveNotes}
                </button>
              </div>
            </div>
          )}

          {/* Action buttons (only if not showing inline modal for this booking) */}
          {!(mode && selectedBooking?.id === booking.id) && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => openEdit(booking)}
                className="flex-1 h-8 rounded-lg border border-white/20 text-white/70 text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-1"
              >
                <Edit2 className="w-3 h-3" /> {t.editBtn}
              </button>
              <button
                onClick={() => openCancel(booking)}
                className="flex-1 h-8 rounded-lg border border-red-500/40 text-red-400 text-xs hover:bg-red-900/20 transition-all flex items-center justify-center gap-1"
              >
                <X className="w-3 h-3" /> {t.cancelBtn}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}