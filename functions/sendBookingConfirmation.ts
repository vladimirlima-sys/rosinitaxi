import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { encode } from 'npm:js-base64';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { client_name, client_email, client_phone, departure_point, arrival_point, departure_date, departure_time, flight_number, vehicle_type, distance_km, total_price, passengers, notes, payment_method, language = 'fr', skip_client_email = false } = body;



    const vehicleLabel = vehicle_type === 'economic' ? 'Standard' : 'Confort';
    const flightInfo = flight_number ? `<tr><td style="padding:6px 0;color:#888;">Vol</td><td style="padding:6px 0;color:#fff;">${flight_number}</td></tr>` : '';
    const notesInfo = notes ? `<tr><td style="padding:6px 0;color:#888;">Notes</td><td style="padding:6px 0;color:#fff;">${notes}</td></tr>` : '';
    
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
        adminTitle: '🔔 Nova reserva recebida',
        adminText: 'Um novo cliente fez uma reserva.',
        client: 'Cliente',
        email: 'Email',
        phone: 'Telefone',
        notSet: 'Não informado',
        adminPaymentLabel: payment_method === 'stripe' ? 'Montante encaixado' : 'Montante a encaixar',
        copyright: (year) => `© ${year} Rosini Transfert. Todos os direitos reservados.`,
        adminCopyright: (year) => `© ${year} Rosini Transfert — Notificação automática`,
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
        adminTitle: '🔔 Nouvelle réservation reçue',
        adminText: 'Un nouveau client a effectué une réservation.',
        client: 'Client',
        email: 'Email',
        phone: 'Téléphone',
        notSet: 'Non renseigné',
        adminPaymentLabel: payment_method === 'stripe' ? 'Montant encaissé' : 'Montant à encaisser',
        copyright: (year) => `© ${year} Rosini Transfert. Tous droits réservés.`,
        adminCopyright: (year) => `© ${year} Rosini Transfert — Notification automatique`,
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
        adminTitle: '🔔 New booking received',
        adminText: 'A new client has made a booking.',
        client: 'Client',
        email: 'Email',
        phone: 'Phone',
        notSet: 'Not provided',
        adminPaymentLabel: payment_method === 'stripe' ? 'Amount collected' : 'Amount to collect',
        copyright: (year) => `© ${year} Rosini Transfert. All rights reserved.`,
        adminCopyright: (year) => `© ${year} Rosini Transfert — Automatic notification`,
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
        adminTitle: '🔔 Neue Buchung eingegangen',
        adminText: 'Ein neuer Kunde hat eine Buchung vorgenommen.',
        client: 'Kunde',
        email: 'Email',
        phone: 'Telefon',
        notSet: 'Nicht angegeben',
        adminPaymentLabel: payment_method === 'stripe' ? 'Eingegangener Betrag' : 'Zu kassierender Betrag',
        copyright: (year) => `© ${year} Rosini Transfert. Alle Rechte vorbehalten.`,
        adminCopyright: (year) => `© ${year} Rosini Transfert — Automatische Benachrichtigung`,
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
        adminTitle: '🔔 Nuova prenotazione ricevuta',
        adminText: 'Un nuovo cliente ha effettuato una prenotazione.',
        client: 'Cliente',
        email: 'Email',
        phone: 'Telefono',
        notSet: 'Non fornito',
        adminPaymentLabel: payment_method === 'stripe' ? 'Importo incassato' : 'Importo da incassare',
        copyright: (year) => `© ${year} Rosini Transfert. Tutti i diritti riservati.`,
        adminCopyright: (year) => `© ${year} Rosini Transfert — Notifica automatica`,
      },
    };

    const t = texts[language] || texts.fr;

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

    const adminEmailBody = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background:#0A0A0A;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#C9A96E;font-size:28px;font-weight:300;letter-spacing:4px;margin:0;">ROSINI</h1>
      <p style="color:#C9A96E;font-size:11px;letter-spacing:3px;margin:4px 0 0;">TRANSFERT</p>
    </div>

    <div style="background:#111;border:1px solid #C9A96E33;border-radius:12px;padding:32px;">
      <h2 style="color:#C9A96E;font-size:20px;font-weight:300;margin:0 0 8px;">${t.adminTitle}</h2>
      <p style="color:#888;margin:0 0 24px;">${t.adminText}</p>

      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#888;">${t.client}</td><td style="padding:6px 0;color:#fff;">${client_name}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">${t.email}</td><td style="padding:6px 0;color:#fff;">${client_email}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">${t.phone}</td><td style="padding:6px 0;color:#fff;">${client_phone || t.notSet}</td></tr>
         <tr><td colspan="2" style="padding:12px 0;"><hr style="border:none;border-top:1px solid #333;margin:0;"></td></tr>
         <tr><td style="padding:6px 0;color:#888;">${t.journey}</td><td style="padding:6px 0;color:#fff;">${departure_point} → ${arrival_point}</td></tr>
         <tr><td style="padding:6px 0;color:#888;">${t.date}</td><td style="padding:6px 0;color:#fff;">${departure_date} à ${departure_time}</td></tr>
         <tr><td style="padding:6px 0;color:#888;">${t.vehicle}</td><td style="padding:6px 0;color:#fff;">${vehicleLabel}</td></tr>
         <tr><td style="padding:6px 0;color:#888;">${t.passengers}</td><td style="padding:6px 0;color:#fff;">${passengers || 1}</td></tr>
         <tr><td style="padding:6px 0;color:#888;">${t.distance}</td><td style="padding:6px 0;color:#fff;">${distance_km} km</td></tr>
         ${flightRow}
         ${notesRow}
         <tr><td colspan="2" style="padding:12px 0;"><hr style="border:none;border-top:1px solid #333;margin:0;"></td></tr>
         <tr><td style="padding:6px 0;color:#888;font-weight:bold;">${t.adminPaymentLabel}</td><td style="padding:6px 0;color:#C9A96E;font-size:18px;font-weight:bold;">CHF ${total_price}</td></tr>
      </table>
    </div>

    <p style="color:#444;text-align:center;font-size:11px;margin-top:24px;">${t.adminCopyright(new Date().getFullYear())}</p>
    </div>
    </body>
    </html>`;

    // Send emails using Gmail connector
    const sendGmailEmail = async (to, subject, htmlBody) => {
      const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');
      
      // Create MIME message with proper headers
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
      
      // Convert to base64url for Gmail API
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

    // Send notification email to admin
    if (client_name && departure_point && arrival_point) {
      const adminSubjectPrefix = skip_client_email ? '⚡ URGENTE — Moins de 90 min' : '🔔 Nouvelle réservation';
      try {
        await sendGmailEmail(
          'taxirosini@gmail.com',
          `${adminSubjectPrefix} — ${client_name} | ${departure_point} → ${arrival_point} | CHF ${total_price}`,
          adminEmailBody
        );
        console.log(`Admin notification sent for booking by ${client_name}`);
      } catch (adminEmailError) {
        console.error(`Error sending admin email:`, adminEmailError);
      }
    }

    return Response.json({ success: true, message: 'Booking processed successfully' });
  } catch (error) {
    console.error('Error sending confirmation emails:', error);
    return Response.json({ error: error.message, details: error.toString() }, { status: 500 });
  }
});