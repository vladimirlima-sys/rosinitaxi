import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { client_name, client_email, client_phone, departure_point, arrival_point, departure_date, departure_time, flight_number, vehicle_type, distance_km, total_price, passengers, notes, payment_method, language = 'fr', skip_client_email = false } = body;



    // Translation texts by language
    const texts = {
      pt: {
        confirmTitle: '✅ Reserva confirmada',
        thankYou: (name) => `Obrigado ${name}, seu transfer está confirmado.`,
        journey: 'Trajeto',
        date: 'Data',
        vehicle: 'Veículo',
        passengers: 'Passageiros',
        distance: 'Distância',
        flight: 'Voo',
        notes: 'Observações',
        paymentLabel: payment_method === 'stripe' ? 'Total pago' : 'Total a pagar no local',
        contactText: 'Dúvidas? Entre em contato conosco',
        client: 'Cliente',
        email: 'Email',
        phone: 'Telefone',
        copyright: (year) => `© ${year} Rosini Transfert. Todos os direitos reservados.`,
        // Receipt PDF
        vehicleLabel: vehicle_type === 'economic' ? 'Standard' : 'Conforto',
        receiptTitle: 'RECIBO',
        clientInfoTitle: 'INFORMAÇÕES DO CLIENTE',
        journeyDetailsTitle: 'DETALHES DA VIAGEM',
        nameLabel: 'Nome:',
        dep: 'Partida:',
        arr: 'Chegada:',
        dateTime: 'Data/Hora:',
        atLabel: 'às',
        totalAmount: 'Valor total:',
        paymentMethodLabel: 'Método:',
        paid: 'PAGO',
        toPay: 'A COBRAR',
        paymentStripe: 'Stripe (online)',
        paymentTwint: 'TWINT',
        paymentCash: 'Dinheiro',
        tripDateLabel: 'Trajeto:',
        dateLabel: 'Data:',
        newBookingSubject: (name) => `RECIBO - ${name} | ${departure_point} → ${arrival_point} | ${departure_date}`,
        newBookingBody: (name) => `<p>Nova reserva de <strong>${name}</strong></p><p>${departure_point} → ${arrival_point}</p><p>CHF ${total_price}</p>`,
      },
      fr: {
        confirmTitle: '✅ Réservation confirmée',
        thankYou: (name) => `Merci ${name}, votre transfer est confirmé.`,
        journey: 'Trajet',
        date: 'Date',
        vehicle: 'Véhicule',
        passengers: 'Passagers',
        distance: 'Distance',
        flight: 'Vol',
        notes: 'Notes',
        paymentLabel: payment_method === 'stripe' ? 'Total payé' : 'Total à payer sur place',
        contactText: 'Des questions ? Contactez-nous',
        client: 'Client',
        email: 'Email',
        phone: 'Téléphone',
        copyright: (year) => `© ${year} Rosini Transfert. Tous droits réservés.`,
        // Receipt PDF
        vehicleLabel: vehicle_type === 'economic' ? 'Standard' : 'Confort',
        receiptTitle: 'REÇU',
        clientInfoTitle: 'INFORMATIONS DU CLIENT',
        journeyDetailsTitle: 'DÉTAILS DU TRAJET',
        nameLabel: 'Nom:',
        dep: 'Départ:',
        arr: 'Arrivée:',
        dateTime: 'Date/Heure:',
        atLabel: 'à',
        totalAmount: 'Montant total:',
        paymentMethodLabel: 'Méthode:',
        paid: 'PAYÉ',
        toPay: 'À ENCAISSER',
        paymentStripe: 'Stripe (en ligne)',
        paymentTwint: 'TWINT',
        paymentCash: 'Espèces',
        tripDateLabel: 'Trajet:',
        dateLabel: 'Date:',
        newBookingSubject: (name) => `REÇU - ${name} | ${departure_point} → ${arrival_point} | ${departure_date}`,
        newBookingBody: (name) => `<p>Nouvelle réservation de <strong>${name}</strong></p><p>${departure_point} → ${arrival_point}</p><p>CHF ${total_price}</p>`,
      },
      en: {
        confirmTitle: '✅ Booking confirmed',
        thankYou: (name) => `Thank you ${name}, your transfer is confirmed.`,
        journey: 'Journey',
        date: 'Date',
        vehicle: 'Vehicle',
        passengers: 'Passengers',
        distance: 'Distance',
        flight: 'Flight',
        notes: 'Notes',
        paymentLabel: payment_method === 'stripe' ? 'Total paid' : 'Total to pay on site',
        contactText: 'Questions? Contact us',
        client: 'Client',
        email: 'Email',
        phone: 'Phone',
        copyright: (year) => `© ${year} Rosini Transfert. All rights reserved.`,
        // Receipt PDF
        vehicleLabel: vehicle_type === 'economic' ? 'Standard' : 'Comfort',
        receiptTitle: 'RECEIPT',
        clientInfoTitle: 'CLIENT INFORMATION',
        journeyDetailsTitle: 'JOURNEY DETAILS',
        nameLabel: 'Name:',
        dep: 'Departure:',
        arr: 'Arrival:',
        dateTime: 'Date/Time:',
        atLabel: 'at',
        totalAmount: 'Total amount:',
        paymentMethodLabel: 'Method:',
        paid: 'PAID',
        toPay: 'TO COLLECT',
        paymentStripe: 'Stripe (online)',
        paymentTwint: 'TWINT',
        paymentCash: 'Cash',
        tripDateLabel: 'Trip:',
        dateLabel: 'Date:',
        newBookingSubject: (name) => `RECEIPT - ${name} | ${departure_point} → ${arrival_point} | ${departure_date}`,
        newBookingBody: (name) => `<p>New booking from <strong>${name}</strong></p><p>${departure_point} → ${arrival_point}</p><p>CHF ${total_price}</p>`,
      },
      de: {
        confirmTitle: '✅ Buchung bestätigt',
        thankYou: (name) => `Danke ${name}, Ihr Transfer ist bestätigt.`,
        journey: 'Strecke',
        date: 'Datum',
        vehicle: 'Fahrzeug',
        passengers: 'Passagiere',
        distance: 'Entfernung',
        flight: 'Flug',
        notes: 'Notizen',
        paymentLabel: payment_method === 'stripe' ? 'Gezahlter Gesamtbetrag' : 'Gesamtbetrag vor Ort zahlbar',
        contactText: 'Fragen? Kontaktieren Sie uns',
        client: 'Kunde',
        email: 'Email',
        phone: 'Telefon',
        copyright: (year) => `© ${year} Rosini Transfert. Alle Rechte vorbehalten.`,
        // Receipt PDF
        vehicleLabel: vehicle_type === 'economic' ? 'Standard' : 'Komfort',
        receiptTitle: 'QUITTUNG',
        clientInfoTitle: 'KUNDENDATEN',
        journeyDetailsTitle: 'REISEDETAILS',
        nameLabel: 'Name:',
        dep: 'Abfahrt:',
        arr: 'Ankunft:',
        dateTime: 'Datum/Zeit:',
        atLabel: 'um',
        totalAmount: 'Gesamtbetrag:',
        paymentMethodLabel: 'Methode:',
        paid: 'BEZAHLT',
        toPay: 'EINZUZIEHEN',
        paymentStripe: 'Stripe (online)',
        paymentTwint: 'TWINT',
        paymentCash: 'Bargeld',
        tripDateLabel: 'Fahrt:',
        dateLabel: 'Datum:',
        newBookingSubject: (name) => `QUITTUNG - ${name} | ${departure_point} → ${arrival_point} | ${departure_date}`,
        newBookingBody: (name) => `<p>Neue Buchung von <strong>${name}</strong></p><p>${departure_point} → ${arrival_point}</p><p>CHF ${total_price}</p>`,
      },
      it: {
        confirmTitle: '✅ Prenotazione confermata',
        thankYou: (name) => `Grazie ${name}, il vostro trasferimento è confermato.`,
        journey: 'Percorso',
        date: 'Data',
        vehicle: 'Veicolo',
        passengers: 'Passeggeri',
        distance: 'Distanza',
        flight: 'Volo',
        notes: 'Note',
        paymentLabel: payment_method === 'stripe' ? 'Totale pagato' : 'Totale da pagare in loco',
        contactText: 'Domande? Contattaci',
        client: 'Cliente',
        email: 'Email',
        phone: 'Telefono',
        copyright: (year) => `© ${year} Rosini Transfert. Tutti i diritti riservati.`,
        // Receipt PDF
        vehicleLabel: vehicle_type === 'economic' ? 'Standard' : 'Comfort',
        receiptTitle: 'RICEVUTA',
        clientInfoTitle: 'INFORMAZIONI SUL CLIENTE',
        journeyDetailsTitle: 'DETTAGLI DEL PERCORSO',
        nameLabel: 'Nome:',
        dep: 'Partenza:',
        arr: 'Arrivo:',
        dateTime: 'Data/Ora:',
        atLabel: 'alle',
        totalAmount: 'Importo totale:',
        paymentMethodLabel: 'Metodo:',
        paid: 'PAGATO',
        toPay: 'DA INCASSARE',
        paymentStripe: 'Stripe (online)',
        paymentTwint: 'TWINT',
        paymentCash: 'Contanti',
        tripDateLabel: 'Percorso:',
        dateLabel: 'Data:',
        newBookingSubject: (name) => `RICEVUTA - ${name} | ${departure_point} → ${arrival_point} | ${departure_date}`,
        newBookingBody: (name) => `<p>Nuova prenotazione da <strong>${name}</strong></p><p>${departure_point} → ${arrival_point}</p><p>CHF ${total_price}</p>`,
      },
    };

    const t = texts[language] || texts.fr;
    const vehicleLabel = t.vehicleLabel;

    const flightRow = flight_number ? `<tr><td style="padding:6px 0;color:#888;">${t.flight}</td><td style="padding:6px 0;color:#fff;">${flight_number}</td></tr>` : '';
    const notesRow = notes ? `<tr><td style="padding:6px 0;color:#888;">${t.notes}</td><td style="padding:6px 0;color:#fff;">${notes}</td></tr>` : '';

    const clientEmailBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#C9A96E;font-size:28px;font-weight:300;letter-spacing:4px;margin:0;">ROSINI</h1>
      <p style="color:#C9A96E;font-size:11px;letter-spacing:3px;margin:4px 0 0;">TRANSFERT</p>
    </div>

    <div style="background:#111;border:1px solid #222;border-radius:12px;padding:32px;margin-bottom:24px;">
      <h2 style="color:#fff;font-size:20px;font-weight:300;margin:0 0 8px;">${t.confirmTitle}</h2>
      <p style="color:#888;margin:0 0 24px;">${t.thankYou(client_name)}</p>

      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#888;">${t.journey}</td><td style="padding:6px 0;color:#fff;">${departure_point} → ${arrival_point}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">${t.date}</td><td style="padding:6px 0;color:#fff;">${departure_date} à ${departure_time}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">${t.vehicle}</td><td style="padding:6px 0;color:#fff;">${vehicleLabel}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">${t.passengers}</td><td style="padding:6px 0;color:#fff;">${passengers || 1}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">${t.distance}</td><td style="padding:6px 0;color:#fff;">${distance_km} km</td></tr>
        ${flightRow}
        ${notesRow}
        <tr><td colspan="2" style="padding:12px 0;"><hr style="border:none;border-top:1px solid #333;margin:0;"></td></tr>
        <tr><td style="padding:6px 0;color:#888;font-weight:bold;">${t.paymentLabel}</td><td style="padding:6px 0;color:#C9A96E;font-size:18px;font-weight:bold;">CHF ${total_price}</td></tr>
      </table>
    </div>

    <div style="text-align:center;padding:24px;background:#111;border:1px solid #222;border-radius:12px;">
      <p style="color:#888;margin:0 0 4px;font-size:13px;">${t.contactText}</p>
      <a href="mailto:info@taxirosini.com" style="color:#C9A96E;text-decoration:none;">info@taxirosini.com</a>
    </div>

    <p style="color:#444;text-align:center;font-size:11px;margin-top:24px;">${t.copyright(new Date().getFullYear())}</p>
  </div>
</body>
</html>`;

    // Receipt for company (professional invoice format)
    const receiptBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Arial', sans-serif;color:#333;">
<div style="max-width:800px;margin:0 auto;padding:40px 20px;">
  <!-- Header -->
  <div style="background:#fff;padding:40px;border-bottom:3px solid #C9A96E;margin-bottom:30px;">
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="vertical-align:top;width:50%;">
          <h1 style="color:#C9A96E;font-size:32px;font-weight:bold;margin:0;letter-spacing:3px;">ROSINI</h1>
          <p style="color:#C9A96E;font-size:12px;letter-spacing:2px;margin:4px 0 0;">TRANSPORTS ET LOCATIONS SARL</p>
          <div style="margin-top:20px;color:#666;font-size:11px;line-height:1.6;">
            <p style="margin:0;">Chemin des Bulesses 16</p>
            <p style="margin:0;">1814 La Tour-de-Peilz</p>
            <p style="margin:8px 0 0;">IDE: CHE-264.039.709</p>
            <p style="margin:8px 0 0;"><strong>Téléphone:</strong> +41 79 650 53 47</p>
            <p style="margin:4px 0 0;"><strong>Email:</strong> info@taxirosini.com</p>
          </div>
        </td>
        <td style="vertical-align:top;text-align:right;">
          <div style="font-size:36px;color:#C9A96E;font-weight:bold;margin-bottom:20px;">REÇU</div>
          <table style="border-collapse:collapse;font-size:11px;line-height:1.8;">
            <tr><td style="padding:4px 0;"><strong>Date:</strong></td><td style="padding:4px 0 4px 20px;">${new Date().toLocaleDateString()}</td></tr>
            <tr><td style="padding:4px 0;"><strong>Trajet:</strong></td><td style="padding:4px 0 4px 20px;">${departure_date}</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </div>

  <!-- Client Info -->
  <div style="background:#fff;padding:25px;margin-bottom:30px;border-left:4px solid #C9A96E;">
    <h3 style="color:#333;font-size:13px;font-weight:bold;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Informations du client</h3>
    <table style="border-collapse:collapse;font-size:12px;line-height:1.8;width:100%;">
      <tr>
        <td style="width:30%;padding:4px 0;color:#888;"><strong>Nom:</strong></td>
        <td style="padding:4px 0;">${client_name}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#888;"><strong>Email:</strong></td>
        <td style="padding:4px 0;">${client_email}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#888;"><strong>Téléphone:</strong></td>
        <td style="padding:4px 0;">${client_phone || '—'}</td>
      </tr>
    </table>
  </div>

  <!-- Journey Details -->
  <div style="background:#fff;padding:25px;margin-bottom:30px;border-left:4px solid #C9A96E;">
    <h3 style="color:#333;font-size:13px;font-weight:bold;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;">Détails du trajet</h3>
    <table style="border-collapse:collapse;width:100%;">
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:12px 0;font-size:12px;color:#888;width:25%;"><strong>Départ:</strong></td>
        <td style="padding:12px 0;font-size:12px;">${departure_point}</td>
        <td style="padding:12px 0 12px 40px;font-size:12px;color:#888;text-align:right;"><strong>Date/Heure:</strong></td>
        <td style="padding:12px 0 12px 20px;font-size:12px;">${departure_date} à ${departure_time}</td>
      </tr>
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:12px 0;font-size:12px;color:#888;"><strong>Arrivée:</strong></td>
        <td style="padding:12px 0;font-size:12px;">${arrival_point}</td>
        <td style="padding:12px 0 12px 40px;font-size:12px;color:#888;text-align:right;"><strong>Véhicule:</strong></td>
        <td style="padding:12px 0 12px 20px;font-size:12px;">${vehicleLabel}</td>
      </tr>
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:12px 0;font-size:12px;color:#888;"><strong>Distance:</strong></td>
        <td style="padding:12px 0;font-size:12px;">${distance_km} km</td>
        <td style="padding:12px 0 12px 40px;font-size:12px;color:#888;text-align:right;"><strong>Passagers:</strong></td>
        <td style="padding:12px 0 12px 20px;font-size:12px;">${passengers || 1}</td>
      </tr>
      ${flight_number ? `
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:12px 0;font-size:12px;color:#888;"><strong>Vol:</strong></td>
        <td colspan="3" style="padding:12px 0;font-size:12px;">${flight_number}</td>
      </tr>
      ` : ''}
      ${notes ? `
      <tr>
        <td style="padding:12px 0;font-size:12px;color:#888;"><strong>Notes:</strong></td>
        <td colspan="3" style="padding:12px 0;font-size:12px;">${notes}</td>
      </tr>
      ` : ''}
    </table>
  </div>

  <!-- Amount Table -->
  <div style="background:#fff;padding:25px;margin-bottom:30px;">
    <table style="border-collapse:collapse;width:100%;font-size:12px;">
      <tr style="border-top:2px solid #eee;border-bottom:2px solid #eee;">
        <td style="padding:12px 0;text-align:right;width:70%;"><strong>Montant total:</strong></td>
        <td style="padding:12px 0 12px 20px;text-align:right;"><span style="font-size:20px;color:#C9A96E;font-weight:bold;">CHF ${total_price}</span></td>
      </tr>
      <tr>
        <td style="padding:12px 0;text-align:right;color:#888;font-size:11px;">Méthode de paiement: ${payment_method === 'stripe' ? 'Stripe (en ligne)' : payment_method === 'twint' ? 'TWINT' : 'Espèces'}</td>
        <td style="padding:12px 0 12px 20px;"><span style="background:#d4af37;padding:2px 8px;border-radius:3px;font-size:11px;color:#333;font-weight:bold;">${payment_method === 'stripe' ? 'PAYÉ' : 'À ENCAISSER'}</span></td>
      </tr>
    </table>
  </div>

  <!-- Footer -->
  <div style="background:#f9f9f9;padding:25px;border-top:1px solid #eee;text-align:center;font-size:11px;color:#999;line-height:1.6;">
    <p style="margin:0 0 8px;">Rosini Transports et locations Sarl | Chemin des Bulesses 16 | 1814 La Tour-de-Peilz</p>
    <p style="margin:0;">© ${new Date().getFullYear()} Rosini Transfert. Tous droits réservés.</p>
  </div>
</div>
</body>
</html>`;

    // Generate receipt PDF (translated)
    const generateReceiptPDF = () => {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 15;

      // Header
      doc.setFontSize(24);
      doc.setTextColor(201, 169, 110);
      doc.text('ROSINI', 15, yPos);
      doc.setFontSize(9);
      doc.text('TRANSPORTS ET LOCATIONS SARL', 15, yPos + 7);
      
      // Receipt title (translated)
      doc.setFontSize(18);
      doc.setTextColor(201, 169, 110);
      doc.text(t.receiptTitle, pageWidth - 40, yPos + 3);
      
      // Company details (always in French/address format)
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      yPos += 20;
      doc.text('Chemin des Bulesses 16', 15, yPos);
      doc.text('1814 La Tour-de-Peilz', 15, yPos + 5);
      doc.text('IDE: CHE-264.039.709', 15, yPos + 10);
      doc.text('+41 79 650 53 47 | info@taxirosini.com', 15, yPos + 15);
      
      doc.setTextColor(150, 150, 150);
      doc.text(`${t.dateLabel} ${new Date().toLocaleDateString('fr-CH')}`, pageWidth - 60, yPos + 5);
      doc.text(`${t.tripDateLabel} ${departure_date}`, pageWidth - 60, yPos + 10);
      
      // Separator
      yPos += 25;
      doc.setDrawColor(201, 169, 110);
      doc.line(15, yPos, pageWidth - 15, yPos);
      
      // Client info (translated)
      yPos += 8;
      doc.setFontSize(11);
      doc.setTextColor(51, 51, 51);
      doc.setFont(undefined, 'bold');
      doc.text(t.clientInfoTitle, 15, yPos);
      
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      yPos += 7;
      doc.setTextColor(100, 100, 100);
      doc.text(t.nameLabel, 15, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(client_name, 45, yPos);
      
      yPos += 6;
      doc.setTextColor(100, 100, 100);
      doc.text('Email:', 15, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(client_email, 45, yPos);
      
      yPos += 6;
      doc.setTextColor(100, 100, 100);
      doc.text(`${t.phone}:`, 15, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(client_phone || '—', 45, yPos);
      
      // Journey details (translated)
      yPos += 12;
      doc.setFontSize(11);
      doc.setTextColor(51, 51, 51);
      doc.setFont(undefined, 'bold');
      doc.text(t.journeyDetailsTitle, 15, yPos);
      
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      yPos += 7;
      doc.setTextColor(100, 100, 100);
      doc.text(t.dep, 15, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(departure_point, 45, yPos);
      
      yPos += 6;
      doc.setTextColor(100, 100, 100);
      doc.text(t.arr, 15, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(arrival_point, 45, yPos);
      
      yPos += 6;
      doc.setTextColor(100, 100, 100);
      doc.text(t.dateTime, 15, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(`${departure_date} ${t.atLabel} ${departure_time}`, 45, yPos);
      
      yPos += 6;
      doc.setTextColor(100, 100, 100);
      doc.text(`${t.vehicle}:`, 15, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(vehicleLabel, 45, yPos);
      
      yPos += 6;
      doc.setTextColor(100, 100, 100);
      doc.text(`${t.distance}:`, 15, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(`${distance_km} km`, 45, yPos);
      
      yPos += 6;
      doc.setTextColor(100, 100, 100);
      doc.text(`${t.passengers}:`, 15, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(String(passengers || 1), 45, yPos);
      
      if (flight_number) {
        yPos += 6;
        doc.setTextColor(100, 100, 100);
        doc.text(`${t.flight}:`, 15, yPos);
        doc.setTextColor(0, 0, 0);
        doc.text(flight_number, 45, yPos);
      }
      
      // Amount section
      yPos += 15;
      doc.setDrawColor(201, 169, 110);
      doc.line(15, yPos, pageWidth - 15, yPos);
      
      yPos += 8;
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.setFont(undefined, 'bold');
      doc.text(t.totalAmount, 15, yPos);
      doc.setTextColor(201, 169, 110);
      doc.setFontSize(20);
      doc.text(`CHF ${total_price}`, pageWidth - 40, yPos - 2);
      
      // Payment info (translated)
      yPos += 10;
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.setFont(undefined, 'normal');
      const payMethodLabel = payment_method === 'stripe' ? t.paymentStripe : payment_method === 'twint' ? t.paymentTwint : t.paymentCash;
      const statusLabel = payment_method === 'stripe' ? t.paid : t.toPay;
      doc.text(`${t.paymentMethodLabel} ${payMethodLabel}`, 15, yPos);
      doc.setTextColor(201, 169, 110);
      doc.setFont(undefined, 'bold');
      doc.text(statusLabel, pageWidth - 40, yPos);
      
      // Footer
      yPos = pageHeight - 20;
      doc.setDrawColor(220, 220, 220);
      doc.line(15, yPos, pageWidth - 15, yPos);
      
      yPos += 5;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Rosini Transports et locations Sarl | Chemin des Bulesses 16 | 1814 La Tour-de-Peilz', 15, yPos, { maxWidth: pageWidth - 30, align: 'center' });
      doc.text(t.copyright(new Date().getFullYear()), pageWidth / 2, yPos + 5, { align: 'center' });
      
      return doc.output('arraybuffer');
    };

    // Send emails using Gmail connector with PDF attachment
    const sendGmailEmail = async (to, subject, htmlBody, pdfBytes = null) => {
      const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');
      
      if (!pdfBytes) {
        // Send simple HTML email
        const lines = [
          `From: taxirosini@gmail.com`,
          `To: ${to}`,
          `Subject: ${subject}`,
          `MIME-Version: 1.0`,
          `Content-Type: text/html; charset="UTF-8"`,
          ``,
          htmlBody
        ];
        
        const emailMessage = lines.join('\r\n');
        const base64Message = btoa(unescape(encodeURIComponent(emailMessage)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
        
        const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ raw: base64Message })
        });
        
        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Gmail API error: ${response.status} - ${error}`);
        }
        return response.json();
      } else {
        // Send email with PDF attachment
        const boundary = '==boundary_' + Date.now();
        const pdfBase64 = Array.from(new Uint8Array(pdfBytes))
          .map(b => String.fromCharCode(b))
          .join('');
        const pdfBase64Encoded = btoa(pdfBase64);
        
        const emailContent = `From: taxirosini@gmail.com\r\nTo: ${to}\r\nSubject: ${subject}\r\nMIME-Version: 1.0\r\nContent-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n--${boundary}\r\nContent-Type: text/html; charset="UTF-8"\r\nContent-Transfer-Encoding: 7bit\r\n\r\n${htmlBody}\r\n\r\n--${boundary}\r\nContent-Type: application/pdf; name="receipt.pdf"\r\nContent-Disposition: attachment; filename="receipt.pdf"\r\nContent-Transfer-Encoding: base64\r\n\r\n${pdfBase64Encoded}\r\n\r\n--${boundary}--`;
        
        const base64Message = btoa(unescape(encodeURIComponent(emailContent)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
        
        const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ raw: base64Message })
        });
        
        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Gmail API error: ${response.status} - ${error}`);
        }
        return response.json();
      }
    };

    // Subject lines per language
    const subjectMap = {
      pt: `✅ Reserva confirmada — ${departure_point} → ${arrival_point}`,
      fr: `✅ Réservation confirmée — ${departure_point} → ${arrival_point}`,
      en: `✅ Booking confirmed — ${departure_point} → ${arrival_point}`,
      de: `✅ Buchung bestätigt — ${departure_point} → ${arrival_point}`,
      it: `✅ Prenotazione confermata — ${departure_point} → ${arrival_point}`,
    };
    const clientSubject = subjectMap[language] || subjectMap.fr;

    // Send confirmation email to client (only if not short notice)
    if (!skip_client_email && client_email) {
      try {
        await sendGmailEmail(client_email, clientSubject, clientEmailBody);
        console.log(`Confirmation email sent to ${client_email}`);
      } catch (emailError) {
        console.error(`Error sending client email to ${client_email}:`, emailError);
      }
    } else {
      console.log(`Short notice booking — skipping client email for ${client_email}`);
    }

    // Send receipt PDF to company
    if (client_name && departure_point && arrival_point) {
      try {
        const pdfBytes = generateReceiptPDF();
        const receiptEmailBody = t.newBookingBody(client_name);
        await sendGmailEmail(
          'taxirosini@gmail.com',
          t.newBookingSubject(client_name),
          receiptEmailBody,
          pdfBytes
        );
        console.log(`Receipt PDF sent to company for booking by ${client_name}`);
      } catch (receiptError) {
        console.error(`Error sending receipt PDF:`, receiptError);
      }
    }

    return Response.json({ success: true, message: 'Booking processed successfully' });
  } catch (error) {
    console.error('Error sending confirmation emails:', error);
    return Response.json({ error: error.message, details: error.toString() }, { status: 500 });
  }
});