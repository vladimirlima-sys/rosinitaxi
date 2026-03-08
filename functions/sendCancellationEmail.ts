import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const translations = {
  fr: {
    subject: '❌ Annulation de votre réservation',
    title: 'Réservation annulée',
    greeting: 'Bonjour',
    booking_details: 'Détails de votre réservation',
    route: 'Trajet',
    date: 'Date',
    time: 'Heure',
    vehicle: 'Véhicule',
    amount: 'Montant',
    refund_status: 'Statut du remboursement',
    refund_issued: 'Remboursement de',
    refund_pending: 'Remboursement en attente',
    no_refund: 'Aucun remboursement',
    less_than_24h: 'Moins de 24h avant le départ',
    contact_support: 'Pour toute question, contactez-nous',
    footer: 'Notification automatique',
  },
  pt: {
    subject: '❌ Cancelamento da sua reserva',
    title: 'Reserva cancelada',
    greeting: 'Olá',
    booking_details: 'Detalhes da sua reserva',
    route: 'Trajeto',
    date: 'Data',
    time: 'Hora',
    vehicle: 'Veículo',
    amount: 'Valor',
    refund_status: 'Status do reembolso',
    refund_issued: 'Reembolso de',
    refund_pending: 'Reembolso pendente',
    no_refund: 'Sem reembolso',
    less_than_24h: 'Menos de 24h antes da partida',
    contact_support: 'Para qualquer dúvida, entre em contato',
    footer: 'Notificação automática',
  },
  en: {
    subject: '❌ Your booking has been cancelled',
    title: 'Booking cancelled',
    greeting: 'Hello',
    booking_details: 'Booking details',
    route: 'Journey',
    date: 'Date',
    time: 'Time',
    vehicle: 'Vehicle',
    amount: 'Amount',
    refund_status: 'Refund status',
    refund_issued: 'Refund of',
    refund_pending: 'Refund pending',
    no_refund: 'No refund',
    less_than_24h: 'Less than 24h before departure',
    contact_support: 'For any questions, contact us',
    footer: 'Automatic notification',
  },
  de: {
    subject: '❌ Ihre Buchung wurde storniert',
    title: 'Buchung storniert',
    greeting: 'Hallo',
    booking_details: 'Buchungsdetails',
    route: 'Fahrt',
    date: 'Datum',
    time: 'Uhrzeit',
    vehicle: 'Fahrzeug',
    amount: 'Betrag',
    refund_status: 'Rückerstattungsstatus',
    refund_issued: 'Rückerstattung von',
    refund_pending: 'Rückerstattung ausstehend',
    no_refund: 'Keine Rückerstattung',
    less_than_24h: 'Weniger als 24h vor Abfahrt',
    contact_support: 'Kontaktieren Sie uns bei Fragen',
    footer: 'Automatische Benachrichtigung',
  },
  it: {
    subject: '❌ La tua prenotazione è stata annullata',
    title: 'Prenotazione annullata',
    greeting: 'Ciao',
    booking_details: 'Dettagli prenotazione',
    route: 'Percorso',
    date: 'Data',
    time: 'Ora',
    vehicle: 'Veicolo',
    amount: 'Importo',
    refund_status: 'Stato rimborso',
    refund_issued: 'Rimborso di',
    refund_pending: 'Rimborso in sospeso',
    no_refund: 'Nessun rimborso',
    less_than_24h: 'Meno di 24h prima della partenza',
    contact_support: 'Per domande, contattaci',
    footer: 'Notifica automatica',
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { 
      client_name, 
      client_email, 
      booking_id,
      departure_point,
      arrival_point,
      departure_date,
      departure_time,
      total_price,
      refund_issued,
      refund_amount,
      hours_until_departure,
      language = 'fr',
      cancelled_by = 'client'
    } = body;

    if (!client_email || !booking_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const t = translations[language] || translations['fr'];
    const vehicleLabel = departure_point && arrival_point ? `${departure_point} → ${arrival_point}` : '';

    // Determine refund message
    let refundMsg = '';
    if (refund_issued) {
      refundMsg = `✅ ${t.refund_issued} CHF ${refund_amount}`;
    } else if (hours_until_departure < 24 && hours_until_departure > 0) {
      refundMsg = `⚠️ ${t.less_than_24h} — ${t.no_refund}`;
    } else {
      refundMsg = `❌ ${t.no_refund}`;
    }

    // Build HTML email
    const emailHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="color:#F5C300;font-size:28px;font-weight:700;letter-spacing:4px;margin:0;">ROSINI</h1>
    <p style="color:#F5C300;font-size:11px;letter-spacing:3px;margin:4px 0 0;">TRANSFERT</p>
  </div>
  <div style="background:#111;border:1px solid #F5C300;border-radius:12px;padding:32px;">
    <h2 style="color:#F5C300;font-size:20px;font-weight:600;margin:0 0 24px;">❌ ${t.title}</h2>
    <p style="color:#fff;margin:0 0 20px;">${t.greeting} ${client_name},</p>
    <p style="color:#aaa;margin:0 0 24px;line-height:1.6;">Votre réservation a été annulée le ${new Date().toLocaleDateString()}.</p>
    
    <h3 style="color:#F5C300;font-size:14px;font-weight:600;margin:20px 0 12px;">${t.booking_details}</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <tr><td style="padding:7px 0;color:#888;width:40%;">${t.route}</td><td style="padding:7px 0;color:#fff;">${vehicleLabel}</td></tr>
      <tr><td style="padding:7px 0;color:#888;">${t.date}</td><td style="padding:7px 0;color:#fff;">${departure_date}</td></tr>
      <tr><td style="padding:7px 0;color:#888;">${t.time}</td><td style="padding:7px 0;color:#fff;">${departure_time}</td></tr>
      <tr><td style="padding:7px 0;color:#888;">${t.amount}</td><td style="padding:7px 0;color:#F5C300;font-weight:bold;">CHF ${total_price}</td></tr>
      <tr><td colspan="2" style="padding:10px 0;"><hr style="border:none;border-top:1px solid #333;margin:0;"></td></tr>
      <tr><td style="padding:7px 0;color:#888;">${t.refund_status}</td><td style="padding:7px 0;color:${refund_issued ? '#4ade80' : '#f87171'};font-weight:bold;">${refundMsg}</td></tr>
    </table>
  </div>
  
  <div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:20px;margin-top:24px;text-align:center;">
    <p style="color:#888;font-size:12px;margin:0;">❓ ${t.contact_support}</p>
    <p style="color:#F5C300;font-size:14px;font-weight:bold;margin:8px 0 0;">+41 77 249 22 45</p>
  </div>
  
  <p style="color:#444;text-align:center;font-size:11px;margin-top:24px;">© ${new Date().getFullYear()} Rosini Transfert — ${t.footer}</p>
</div></body></html>`;

    // Get Gmail access token
    console.log('Getting Gmail connection...');
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    
    // Send email via Gmail API
    const emailMessage = `To: ${client_email}\r\nSubject: ${t.subject}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${emailHtml}`;
    const encodedEmail = btoa(emailMessage);
    
    console.log(`Sending cancellation email to ${client_email}...`);
    const gmailResponse = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedEmail,
      }),
    });

    if (!gmailResponse.ok) {
      const errorText = await gmailResponse.text();
      console.error(`Gmail API error (${gmailResponse.status}):`, errorText);
      throw new Error(`Gmail API error: ${errorText}`);
    }

    const gmailResult = await gmailResponse.json();
    console.log(`Cancellation email sent to ${client_email}. Message ID: ${gmailResult.id}`);
    return Response.json({ success: true, messageId: gmailResult.id });
  } catch (error) {
    console.error('Send cancellation email error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});