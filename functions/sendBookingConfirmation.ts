import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const {
      client_name, client_email, client_phone,
      departure_point, arrival_point,
      departure_date, departure_time,
      flight_number, vehicle_type,
      distance_km, total_price,
      passengers, notes,
      payment_method, language = 'fr',
      skip_client_email = false, booking_id
    } = body;

    const vehicleLabel = vehicle_type === 'economic' ? 'Standard' : 'Comfort';

    // ─── Translations ──────────────────────────────────────────────────────────
    const T = {
      fr: {
        subject: 'VOTRE RÉSERVATION',
        confirmed: 'Réservation confirmée',
        dear: (n) => `Bonjour ${n},`,
        intro: 'Votre transfert est confirmé. Voici le récapitulatif de votre réservation :',
        sectionTrip: 'DÉTAILS DU TRAJET',
        sectionClient: 'VOS COORDONNÉES',
        sectionPayment: 'PAIEMENT',
        labelFrom: 'Départ',
        labelTo: 'Arrivée',
        labelDate: 'Date',
        labelTime: 'Heure',
        labelVehicle: 'Véhicule',
        labelPassengers: 'Passagers',
        labelDistance: 'Distance',
        labelFlight: 'N° de vol',
        labelNotes: 'Notes',
        labelName: 'Nom',
        labelEmail: 'Email',
        labelPhone: 'Téléphone',
        labelPayMethod: 'Méthode',
        labelTotal: payment_method === 'stripe' ? 'Total payé' : 'Total à payer sur place',
        cancelTitle: 'Annuler ma réservation',
        cancelText: 'Vous souhaitez annuler ? Cliquez sur le bouton ci-dessous.',
        cancelBtn: 'Annuler ma réservation',
        questions: 'Des questions ?',
        contactUs: 'Contactez-nous :',
        copyright: (y) => `© ${y} Rosini Transports et Locations Sàrl — Tous droits réservés`,
        payStripe: 'Carte bancaire (Stripe)',
        payTwint: 'TWINT',
        payCash: 'Espèces',
        // Company email
        companySubject: (n) => `Nouvelle réservation — ${n} | ${departure_point} → ${arrival_point} | ${departure_date}`,
        companyIntro: 'Une nouvelle réservation a été enregistrée.',
        // PDF
        receiptTitle: 'REÇU',
        paid: 'PAYÉ',
        toPay: 'À ENCAISSER',
      },
      pt: {
        subject: 'A SUA RESERVA',
        confirmed: 'Reserva confirmada',
        dear: (n) => `Olá ${n},`,
        intro: 'O seu transfer está confirmado. Aqui está o resumo da sua reserva:',
        sectionTrip: 'DETALHES DA VIAGEM',
        sectionClient: 'OS SEUS DADOS',
        sectionPayment: 'PAGAMENTO',
        labelFrom: 'Partida',
        labelTo: 'Chegada',
        labelDate: 'Data',
        labelTime: 'Hora',
        labelVehicle: 'Veículo',
        labelPassengers: 'Passageiros',
        labelDistance: 'Distância',
        labelFlight: 'Nº do voo',
        labelNotes: 'Observações',
        labelName: 'Nome',
        labelEmail: 'Email',
        labelPhone: 'Telefone',
        labelPayMethod: 'Método',
        labelTotal: payment_method === 'stripe' ? 'Total pago' : 'Total a pagar no local',
        cancelTitle: 'Cancelar reserva',
        cancelText: 'Deseja cancelar? Clique no botão abaixo.',
        cancelBtn: 'Cancelar minha reserva',
        questions: 'Perguntas?',
        contactUs: 'Contacte-nos:',
        copyright: (y) => `© ${y} Rosini Transports et Locations Sàrl — Todos os direitos reservados`,
        payStripe: 'Cartão bancário (Stripe)',
        payTwint: 'TWINT',
        payCash: 'Dinheiro',
        companySubject: (n) => `Nova reserva — ${n} | ${departure_point} → ${arrival_point} | ${departure_date}`,
        companyIntro: 'Uma nova reserva foi registada.',
        receiptTitle: 'RECIBO',
        paid: 'PAGO',
        toPay: 'A COBRAR',
      },
      en: {
        subject: 'YOUR BOOKING',
        confirmed: 'Booking confirmed',
        dear: (n) => `Hello ${n},`,
        intro: 'Your transfer is confirmed. Here is your booking summary:',
        sectionTrip: 'TRIP DETAILS',
        sectionClient: 'YOUR DETAILS',
        sectionPayment: 'PAYMENT',
        labelFrom: 'Departure',
        labelTo: 'Arrival',
        labelDate: 'Date',
        labelTime: 'Time',
        labelVehicle: 'Vehicle',
        labelPassengers: 'Passengers',
        labelDistance: 'Distance',
        labelFlight: 'Flight number',
        labelNotes: 'Notes',
        labelName: 'Name',
        labelEmail: 'Email',
        labelPhone: 'Phone',
        labelPayMethod: 'Method',
        labelTotal: payment_method === 'stripe' ? 'Total paid' : 'Total to pay on site',
        cancelTitle: 'Cancel booking',
        cancelText: 'Do you wish to cancel? Click the button below.',
        cancelBtn: 'Cancel my booking',
        questions: 'Questions?',
        contactUs: 'Contact us:',
        copyright: (y) => `© ${y} Rosini Transports et Locations Sàrl — All rights reserved`,
        payStripe: 'Credit card (Stripe)',
        payTwint: 'TWINT',
        payCash: 'Cash',
        companySubject: (n) => `New booking — ${n} | ${departure_point} → ${arrival_point} | ${departure_date}`,
        companyIntro: 'A new booking has been registered.',
        receiptTitle: 'RECEIPT',
        paid: 'PAID',
        toPay: 'TO COLLECT',
      },
      de: {
        subject: 'IHRE BUCHUNG',
        confirmed: 'Buchung bestätigt',
        dear: (n) => `Hallo ${n},`,
        intro: 'Ihr Transfer ist bestätigt. Hier ist Ihre Buchungsübersicht:',
        sectionTrip: 'REISEDETAILS',
        sectionClient: 'IHRE DATEN',
        sectionPayment: 'ZAHLUNG',
        labelFrom: 'Abfahrt',
        labelTo: 'Ankunft',
        labelDate: 'Datum',
        labelTime: 'Uhrzeit',
        labelVehicle: 'Fahrzeug',
        labelPassengers: 'Passagiere',
        labelDistance: 'Entfernung',
        labelFlight: 'Flugnummer',
        labelNotes: 'Notizen',
        labelName: 'Name',
        labelEmail: 'Email',
        labelPhone: 'Telefon',
        labelPayMethod: 'Methode',
        labelTotal: payment_method === 'stripe' ? 'Bezahlter Betrag' : 'Vor Ort zu zahlen',
        cancelTitle: 'Buchung stornieren',
        cancelText: 'Möchten Sie stornieren? Klicken Sie auf die Schaltfläche unten.',
        cancelBtn: 'Buchung stornieren',
        questions: 'Fragen?',
        contactUs: 'Kontaktieren Sie uns:',
        copyright: (y) => `© ${y} Rosini Transports et Locations Sàrl — Alle Rechte vorbehalten`,
        payStripe: 'Kreditkarte (Stripe)',
        payTwint: 'TWINT',
        payCash: 'Bargeld',
        companySubject: (n) => `Neue Buchung — ${n} | ${departure_point} → ${arrival_point} | ${departure_date}`,
        companyIntro: 'Eine neue Buchung wurde registriert.',
        receiptTitle: 'QUITTUNG',
        paid: 'BEZAHLT',
        toPay: 'EINZUZIEHEN',
      },
      it: {
        subject: 'LA SUA PRENOTAZIONE',
        confirmed: 'Prenotazione confermata',
        dear: (n) => `Salve ${n},`,
        intro: 'Il suo trasferimento è confermato. Ecco il riepilogo della sua prenotazione:',
        sectionTrip: 'DETTAGLI DEL PERCORSO',
        sectionClient: 'I SUOI DATI',
        sectionPayment: 'PAGAMENTO',
        labelFrom: 'Partenza',
        labelTo: 'Arrivo',
        labelDate: 'Data',
        labelTime: 'Orario',
        labelVehicle: 'Veicolo',
        labelPassengers: 'Passeggeri',
        labelDistance: 'Distanza',
        labelFlight: 'N° volo',
        labelNotes: 'Note',
        labelName: 'Nome',
        labelEmail: 'Email',
        labelPhone: 'Telefono',
        labelPayMethod: 'Metodo',
        labelTotal: payment_method === 'stripe' ? 'Totale pagato' : 'Totale da pagare in loco',
        cancelTitle: 'Annullare prenotazione',
        cancelText: 'Desidera annullare? Clicchi sul pulsante qui sotto.',
        cancelBtn: 'Annulla la mia prenotazione',
        questions: 'Domande?',
        contactUs: 'Contattateci:',
        copyright: (y) => `© ${y} Rosini Transports et Locations Sàrl — Tutti i diritti riservati`,
        payStripe: 'Carta di credito (Stripe)',
        payTwint: 'TWINT',
        payCash: 'Contanti',
        companySubject: (n) => `Nuova prenotazione — ${n} | ${departure_point} → ${arrival_point} | ${departure_date}`,
        companyIntro: 'Una nuova prenotazione è stata registrata.',
        receiptTitle: 'RICEVUTA',
        paid: 'PAGATO',
        toPay: 'DA INCASSARE',
      },
      es: {
        subject: 'SU RESERVA',
        confirmed: 'Reserva confirmada',
        dear: (n) => `Hola ${n},`,
        intro: 'Su traslado está confirmado. Aquí está el resumen de su reserva:',
        sectionTrip: 'DETALLES DEL VIAJE',
        sectionClient: 'SUS DATOS',
        sectionPayment: 'PAGO',
        labelFrom: 'Salida',
        labelTo: 'Llegada',
        labelDate: 'Fecha',
        labelTime: 'Hora',
        labelVehicle: 'Vehículo',
        labelPassengers: 'Pasajeros',
        labelDistance: 'Distancia',
        labelFlight: 'N° de vuelo',
        labelNotes: 'Notas',
        labelName: 'Nombre',
        labelEmail: 'Email',
        labelPhone: 'Teléfono',
        labelPayMethod: 'Método',
        labelTotal: payment_method === 'stripe' ? 'Total pagado' : 'Total a pagar en el lugar',
        cancelTitle: 'Cancelar reserva',
        cancelText: '¿Desea cancelar? Haga clic en el botón de abajo.',
        cancelBtn: 'Cancelar mi reserva',
        questions: '¿Preguntas?',
        contactUs: 'Contáctenos:',
        copyright: (y) => `© ${y} Rosini Transports et Locations Sàrl — Todos los derechos reservados`,
        payStripe: 'Tarjeta bancaria (Stripe)',
        payTwint: 'TWINT',
        payCash: 'Efectivo',
        companySubject: (n) => `Nueva reserva — ${n} | ${departure_point} → ${arrival_point} | ${departure_date}`,
        companyIntro: 'Se ha registrado una nueva reserva.',
        receiptTitle: 'RECIBO',
        paid: 'PAGADO',
        toPay: 'A COBRAR',
      },
      nl: {
        subject: 'UW BOEKING',
        confirmed: 'Boeking bevestigd',
        dear: (n) => `Hallo ${n},`,
        intro: 'Uw transfer is bevestigd. Hier is uw boekingsoverzicht:',
        sectionTrip: 'REISDETAILS',
        sectionClient: 'UW GEGEVENS',
        sectionPayment: 'BETALING',
        labelFrom: 'Vertrek',
        labelTo: 'Aankomst',
        labelDate: 'Datum',
        labelTime: 'Tijd',
        labelVehicle: 'Voertuig',
        labelPassengers: 'Passagiers',
        labelDistance: 'Afstand',
        labelFlight: 'Vluchtnummer',
        labelNotes: 'Notities',
        labelName: 'Naam',
        labelEmail: 'Email',
        labelPhone: 'Telefoon',
        labelPayMethod: 'Methode',
        labelTotal: payment_method === 'stripe' ? 'Totaal betaald' : 'Totaal ter plaatse te betalen',
        cancelTitle: 'Boeking annuleren',
        cancelText: 'Wilt u annuleren? Klik op de onderstaande knop.',
        cancelBtn: 'Mijn boeking annuleren',
        questions: 'Vragen?',
        contactUs: 'Neem contact op:',
        copyright: (y) => `© ${y} Rosini Transports et Locations Sàrl — Alle rechten voorbehouden`,
        payStripe: 'Creditcard (Stripe)',
        payTwint: 'TWINT',
        payCash: 'Contant',
        companySubject: (n) => `Nieuwe boeking — ${n} | ${departure_point} → ${arrival_point} | ${departure_date}`,
        companyIntro: 'Er is een nieuwe boeking geregistreerd.',
        receiptTitle: 'ONTVANGSTBEWIJS',
        paid: 'BETAALD',
        toPay: 'TE INNEN',
      },
    };

    const t = T[language] || T.fr;
    const payMethodLabel = payment_method === 'stripe' ? t.payStripe : payment_method === 'twint' ? t.payTwint : t.payCash;
    const isPaid = payment_method === 'stripe';
    const cancelUrl = `https://rosini.online/MyBookings?email=${encodeURIComponent(client_email)}&lang=${language}`;
    const year = new Date().getFullYear();

    // ─── Row helper ────────────────────────────────────────────────────────────
    const row = (label, value, highlight = false) => `
      <tr>
        <td style="padding:9px 12px;color:#999;font-size:13px;white-space:nowrap;width:40%;">${label}</td>
        <td style="padding:9px 12px;color:${highlight ? '#F5C300' : '#ffffff'};font-size:${highlight ? '18px' : '13px'};font-weight:${highlight ? 'bold' : 'normal'};">${value}</td>
      </tr>`;

    const sectionHeader = (title) => `
      <tr>
        <td colspan="2" style="padding:0;">
          <div style="background:#F5C300;padding:8px 12px;">
            <span style="color:#000;font-size:11px;font-weight:bold;letter-spacing:1.5px;">${title}</span>
          </div>
        </td>
      </tr>`;

    const spacer = () => `<tr><td colspan="2" style="height:12px;"></td></tr>`;

    // ─── CLIENT EMAIL BODY ──────────────────────────────────────────────────────
    const clientEmailBody = `<!DOCTYPE html>
<html lang="${language}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:620px;margin:0 auto;padding:32px 16px;">

  <!-- HEADER -->
  <div style="background:#000;border-top:4px solid #F5C300;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
    <p style="margin:0;color:#F5C300;font-size:32px;font-weight:900;letter-spacing:6px;">ROSINI</p>
    <p style="margin:4px 0 0;color:#F5C300;font-size:10px;letter-spacing:3px;opacity:0.8;">TRANSPORTS ET LOCATIONS SÀRL</p>
    <div style="margin:16px auto 0;width:40px;height:2px;background:#F5C300;opacity:0.4;"></div>
    <p style="margin:12px 0 0;color:#F5C300;font-size:18px;font-weight:bold;letter-spacing:2px;">✓ ${t.confirmed.toUpperCase()}</p>
  </div>

  <!-- GREETING -->
  <div style="background:#111;padding:24px 32px;border-left:1px solid #222;border-right:1px solid #222;">
    <p style="margin:0;color:#ffffff;font-size:15px;">${t.dear(client_name)}</p>
    <p style="margin:10px 0 0;color:#aaa;font-size:13px;line-height:1.7;">${t.intro}</p>
  </div>

  <!-- TRIP DETAILS -->
  <div style="background:#111;border-left:1px solid #222;border-right:1px solid #222;margin-top:2px;">
    <table style="width:100%;border-collapse:collapse;">
      ${sectionHeader(t.sectionTrip)}
      ${row(t.labelFrom, departure_point)}
      ${row(t.labelTo, arrival_point)}
      ${row(t.labelDate, departure_date)}
      ${row(t.labelTime, departure_time)}
      ${row(t.labelVehicle, vehicleLabel)}
      ${row(t.labelPassengers, String(passengers || 1))}
      ${row(t.labelDistance, `${distance_km} km`)}
      ${flight_number ? row(t.labelFlight, flight_number) : ''}
      ${notes ? row(t.labelNotes, notes) : ''}
      ${spacer()}
    </table>
  </div>

  <!-- CLIENT DETAILS -->
  <div style="background:#111;border-left:1px solid #222;border-right:1px solid #222;margin-top:2px;">
    <table style="width:100%;border-collapse:collapse;">
      ${sectionHeader(t.sectionClient)}
      ${row(t.labelName, client_name)}
      ${row(t.labelEmail, client_email)}
      ${client_phone ? row(t.labelPhone, client_phone) : ''}
      ${spacer()}
    </table>
  </div>

  <!-- PAYMENT -->
  <div style="background:#111;border-left:1px solid #222;border-right:1px solid #222;margin-top:2px;">
    <table style="width:100%;border-collapse:collapse;">
      ${sectionHeader(t.sectionPayment)}
      ${row(t.labelPayMethod, payMethodLabel)}
      <tr>
        <td style="padding:9px 12px;color:#999;font-size:13px;">${t.labelTotal}</td>
        <td style="padding:9px 12px;">
          <span style="color:#F5C300;font-size:22px;font-weight:bold;">CHF ${total_price}</span>
          ${isPaid ? `<span style="margin-left:10px;background:#F5C300;color:#000;font-size:10px;font-weight:bold;padding:3px 8px;border-radius:4px;vertical-align:middle;">${t.paid}</span>` : ''}
        </td>
      </tr>
      ${spacer()}
    </table>
  </div>

  <!-- CANCEL -->
  ${booking_id ? `
  <div style="background:#111;border-left:1px solid #222;border-right:1px solid #222;margin-top:2px;padding:20px 32px;text-align:center;">
    <p style="margin:0 0 4px;color:#666;font-size:12px;">${t.cancelText}</p>
    <a href="${cancelUrl}" style="display:inline-block;margin-top:10px;padding:10px 24px;background:transparent;border:1px solid #444;border-radius:6px;color:#aaa;font-size:12px;text-decoration:none;">${t.cancelBtn}</a>
  </div>` : ''}

  <!-- CONTACT -->
  <div style="background:#000;border:1px solid #F5C300;border-radius:0 0 12px 12px;margin-top:2px;padding:20px 32px;text-align:center;">
    <p style="margin:0;color:#aaa;font-size:12px;">${t.questions} ${t.contactUs}</p>
    <a href="mailto:info@rosini.online" style="color:#F5C300;font-size:14px;font-weight:bold;text-decoration:none;">info@rosini.online</a>
    <span style="color:#555;margin:0 8px;">|</span>
    <a href="tel:+41772492245" style="color:#F5C300;font-size:14px;font-weight:bold;text-decoration:none;">+41 77 249 22 45</a>
    <p style="margin:16px 0 0;color:#333;font-size:10px;">${t.copyright(year)}</p>
    <p style="margin:2px 0 0;color:#333;font-size:10px;">Chemin des Bulesses 16, 1814 La Tour-de-Peilz — IDE: CHE-264.039.709</p>
  </div>

</div>
</body>
</html>`;

    // ─── COMPANY EMAIL BODY ─────────────────────────────────────────────────────
    const companyEmailBody = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:620px;margin:0 auto;padding:32px 16px;">

  <!-- HEADER -->
  <div style="background:#000;border-top:4px solid #F5C300;border-radius:12px 12px 0 0;padding:24px 32px;">
    <p style="margin:0;color:#F5C300;font-size:24px;font-weight:900;letter-spacing:4px;">ROSINI</p>
    <p style="margin:4px 0 0;color:#F5C300;font-size:10px;letter-spacing:2px;opacity:0.7;">TRANSPORTS ET LOCATIONS SÀRL</p>
    <p style="margin:12px 0 0;color:#ffffff;font-size:16px;font-weight:bold;">🔔 Nouvelle réservation</p>
    <p style="margin:4px 0 0;color:#aaa;font-size:12px;">${t.companyIntro}</p>
  </div>

  <!-- CLIENT -->
  <div style="background:#111;border-left:1px solid #222;border-right:1px solid #222;margin-top:2px;">
    <table style="width:100%;border-collapse:collapse;">
      ${sectionHeader('CLIENT')}
      ${row('Nom', client_name)}
      ${row('Email', client_email)}
      ${row('Téléphone', client_phone || '—')}
      ${client_phone ? `<tr><td colspan="2" style="padding:0 12px 12px;"><a href="https://wa.me/${client_phone.replace(/\D/g,'')}" style="display:inline-block;background:#25D366;color:#fff;font-size:12px;font-weight:bold;padding:6px 16px;border-radius:6px;text-decoration:none;">💬 WhatsApp</a></td></tr>` : ''}
    </table>
  </div>

  <!-- TRAJET -->
  <div style="background:#111;border-left:1px solid #222;border-right:1px solid #222;margin-top:2px;">
    <table style="width:100%;border-collapse:collapse;">
      ${sectionHeader('TRAJET')}
      ${row('Départ', departure_point)}
      ${row('Arrivée', arrival_point)}
      ${row('Date', departure_date)}
      ${row('Heure', departure_time)}
      ${row('Véhicule', vehicleLabel)}
      ${row('Passagers', String(passengers || 1))}
      ${row('Distance', `${distance_km} km`)}
      ${flight_number ? row('Vol', flight_number) : ''}
      ${notes ? row('Notes', notes) : ''}
      ${spacer()}
    </table>
  </div>

  <!-- PAIEMENT -->
  <div style="background:#111;border-left:1px solid #222;border-right:1px solid #222;margin-top:2px;">
    <table style="width:100%;border-collapse:collapse;">
      ${sectionHeader('PAIEMENT')}
      ${row('Méthode', payMethodLabel)}
      <tr>
        <td style="padding:9px 12px;color:#999;font-size:13px;">Montant total</td>
        <td style="padding:9px 12px;">
          <span style="color:#F5C300;font-size:22px;font-weight:bold;">CHF ${total_price}</span>
          <span style="margin-left:10px;background:${isPaid ? '#F5C300' : '#ff6b00'};color:#000;font-size:11px;font-weight:bold;padding:4px 10px;border-radius:4px;vertical-align:middle;">${isPaid ? 'PAYÉ EN LIGNE ✓' : 'À ENCAISSER ⚠️'}</span>
        </td>
      </tr>
      ${spacer()}
    </table>
  </div>

  <!-- FOOTER -->
  <div style="background:#000;border:1px solid #333;border-radius:0 0 12px 12px;margin-top:2px;padding:16px 32px;text-align:center;">
    <p style="margin:0;color:#444;font-size:11px;">Rosini Transports et Locations Sàrl — Notification automatique</p>
    <p style="margin:4px 0 0;color:#333;font-size:10px;">© ${year} — Chemin des Bulesses 16, 1814 La Tour-de-Peilz</p>
  </div>

</div>
</body>
</html>`;

    // ─── PDF RECEIPT (B&W, for company only) ───────────────────────────────────
    const generateReceiptPDF = () => {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();

      let y = 18;

      // Company name
      doc.setFontSize(22);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      doc.text('ROSINI', 15, y);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text('TRANSPORTS ET LOCATIONS SÀRL', 15, y + 6);

      // Receipt title (right)
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('REÇU', pw - 15, y + 2, { align: 'right' });

      // Company details
      y += 14;
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Chemin des Bulesses 16 — 1814 La Tour-de-Peilz', 15, y);
      doc.text('IDE: CHE-264.039.709  |  +41 77 249 22 45  |  info@rosini.online', 15, y + 5);

      doc.setTextColor(120, 120, 120);
      doc.text(`Émis le ${new Date().toLocaleDateString('fr-CH')}`, pw - 15, y, { align: 'right' });
      doc.text(`Trajet prévu: ${departure_date}`, pw - 15, y + 5, { align: 'right' });

      // Divider
      y += 14;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(15, y, pw - 15, y);

      // ── Section: Client ──
      y += 8;
      doc.setFillColor(30, 30, 30);
      doc.rect(15, y, pw - 30, 7, 'F');
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('INFORMATIONS DU CLIENT', 18, y + 5);

      y += 10;
      const clientRows = [
        ['Nom', client_name],
        ['Email', client_email],
        ['Téléphone', client_phone || '—'],
      ];
      for (const [label, value] of clientRows) {
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(label + ':', 18, y);
        doc.setTextColor(0, 0, 0);
        doc.text(value, 65, y);
        y += 6;
      }

      // ── Section: Trajet ──
      y += 4;
      doc.setFillColor(30, 30, 30);
      doc.rect(15, y, pw - 30, 7, 'F');
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('DÉTAILS DU TRAJET', 18, y + 5);

      y += 10;
      const tripRows = [
        ['Départ', departure_point],
        ['Arrivée', arrival_point],
        ['Date', departure_date],
        ['Heure', departure_time],
        ['Véhicule', vehicleLabel],
        ['Passagers', String(passengers || 1)],
        ['Distance', `${distance_km} km`],
      ];
      if (flight_number) tripRows.push(['N° de vol', flight_number]);
      if (notes) tripRows.push(['Notes', notes]);

      for (const [label, value] of tripRows) {
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(label + ':', 18, y);
        doc.setTextColor(0, 0, 0);
        const lines = doc.splitTextToSize(value, pw - 80);
        doc.text(lines, 65, y);
        y += lines.length > 1 ? lines.length * 5 + 1 : 6;
      }

      // ── Section: Paiement ──
      y += 4;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(15, y, pw - 15, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Méthode de paiement:', 18, y);
      doc.setTextColor(0, 0, 0);
      doc.text(payMethodLabel, 70, y);

      // Total
      y += 8;
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text('Montant total:', 18, y);
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0);
      doc.text(`CHF ${total_price}`, 65, y);

      // PAID / TO COLLECT badge (black box, white text)
      y += 3;
      const badge = isPaid ? 'PAYÉ EN LIGNE ✓' : 'À ENCAISSER ⚠️';
      const badgeW = isPaid ? 42 : 40;
      doc.setFillColor(0, 0, 0);
      doc.roundedRect(pw - 15 - badgeW, y - 6, badgeW, 8, 2, 2, 'F');
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(badge, pw - 15 - badgeW / 2, y - 0.5, { align: 'center' });

      // ── Footer ──
      y = ph - 18;
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.3);
      doc.line(15, y, pw - 15, y);
      y += 5;
      doc.setFontSize(7);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text('Rosini Transports et Locations Sàrl  |  Chemin des Bulesses 16  |  1814 La Tour-de-Peilz  |  IDE: CHE-264.039.709', pw / 2, y, { align: 'center' });
      doc.text(`© ${year} Rosini Transfert`, pw / 2, y + 4, { align: 'center' });

      return doc.output('arraybuffer');
    };

    // ─── Gmail sender with optional PDF attachment ──────────────────────────────
    const sendGmailEmail = async (to, subject, htmlBody, pdfBuffer = null) => {
      const { accessToken } = await base44.asServiceRole.connectors.getConnection("gmail");
      const encodedName = `=?UTF-8?B?${btoa(unescape(encodeURIComponent('Rosini Transports')))}?=`;
      const encodedSubject = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
      const boundary = 'RosiniEmailBoundary_' + Date.now();

      let rawEmail;

      if (pdfBuffer) {
        // Multipart email with PDF attachment
        const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
        const pdfFilename = `recu-rosini-${departure_date}.pdf`;
        rawEmail = [
          `From: ${encodedName} <rosinitransportsetlications@gmail.com>`,
          `To: ${to}`,
          `Subject: ${encodedSubject}`,
          `MIME-Version: 1.0`,
          `Content-Type: multipart/mixed; boundary="${boundary}"`,
          ``,
          `--${boundary}`,
          `Content-Type: text/html; charset=UTF-8`,
          `Content-Transfer-Encoding: 7bit`,
          ``,
          htmlBody,
          ``,
          `--${boundary}`,
          `Content-Type: application/pdf; name="${pdfFilename}"`,
          `Content-Transfer-Encoding: base64`,
          `Content-Disposition: attachment; filename="${pdfFilename}"`,
          ``,
          pdfBase64,
          ``,
          `--${boundary}--`,
        ].join('\r\n');
      } else {
        rawEmail = [
          `From: ${encodedName} <rosinitransportsetlications@gmail.com>`,
          `To: ${to}`,
          `Subject: ${encodedSubject}`,
          `MIME-Version: 1.0`,
          `Content-Type: text/html; charset=UTF-8`,
          ``,
          htmlBody,
        ].join('\r\n');
      }

      const encodedEmail = btoa(unescape(encodeURIComponent(rawEmail)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: encodedEmail }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gmail API error: ${err}`);
      }
    };

    // ─── SMS notification ──────────────────────────────────────────────────
    if (client_phone) {
      try {
        await base44.asServiceRole.functions.invoke('sendWhatsApp', {
          type: 'payment_confirmed',
          booking: {
            client_name,
            client_phone,
            departure_point,
            arrival_point,
            departure_date,
            departure_time,
            vehicle_type,
            total_price,
            payment_method,
            language
          }
        });
        console.log('SMS confirmation sent to ' + client_phone + ' [lang: ' + language + ']');
      } catch (waErr) {
        console.error('WhatsApp notification failed (non-critical):', waErr.message);
      }
    }

    // ─── Subject per language ───────────────────────────────────────────────────
    const clientSubject = t.subject;

    // ─── Send to client ─────────────────────────────────────────────────────────
    if (!skip_client_email && client_email) {
      try {
        await sendGmailEmail(client_email, clientSubject, clientEmailBody);
        console.log(`Confirmation email sent to ${client_email}`);
      } catch (emailError) {
        console.error(`Error sending client email:`, emailError);
      }
    } else {
      console.log(`Short notice booking — skipping client email for ${client_email}`);
    }

    // ─── Send to company (with PDF) ─────────────────────────────────────────────
    if (client_name && departure_point && arrival_point) {
      try {
        const pdfBuffer = generateReceiptPDF();
        const companySubject = t.companySubject(client_name);
        await sendGmailEmail('info@rosini.online', companySubject, companyEmailBody, pdfBuffer);
        console.log(`Company email with PDF receipt sent for booking by ${client_name}`);
      } catch (receiptError) {
        console.error(`Error sending company email:`, receiptError);
      }
    }

    return Response.json({ success: true, message: 'Booking processed successfully' });
  } catch (error) {
    console.error('Error in sendBookingConfirmation:', error);
    return Response.json({ error: error.message, details: error.toString() }, { status: 500 });
  }
});