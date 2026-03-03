import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const statusMessages = {
  en_route: {
    pt: { title: '🚗 Motorista a caminho', body: 'O seu motorista saiu em direção ao ponto de partida.' },
    fr: { title: '🚗 Chauffeur en route', body: 'Votre chauffeur se dirige vers le point de départ.' },
    en: { title: '🚗 Driver on the way', body: 'Your driver is heading to the pickup point.' },
    de: { title: '🚗 Fahrer unterwegs', body: 'Ihr Fahrer ist auf dem Weg zum Abholpunkt.' },
    it: { title: '🚗 Autista in arrivo', body: 'Il vostro autista si sta dirigendo verso il punto di partenza.' },
    es: { title: '🚗 Conductor en camino', body: 'Su conductor se dirige al punto de recogida.' },
    nl: { title: '🚗 Chauffeur onderweg', body: 'Uw chauffeur is op weg naar het vertrekpunt.' },
  },
  arrived: {
    pt: { title: '📍 Motorista chegou!', body: 'O seu motorista chegou ao ponto de partida. Prepare-se!' },
    fr: { title: '📍 Chauffeur arrivé!', body: 'Votre chauffeur est arrivé au point de départ. Préparez-vous!' },
    en: { title: '📍 Driver arrived!', body: 'Your driver has arrived at the pickup point. Get ready!' },
    de: { title: '📍 Fahrer angekommen!', body: 'Ihr Fahrer ist am Abholpunkt angekommen. Machen Sie sich bereit!' },
    it: { title: '📍 Autista arrivato!', body: 'Il vostro autista è arrivato al punto di partenza. Preparatevi!' },
    es: { title: '📍 Conductor llegó!', body: '¡Su conductor ha llegado al punto de recogida. Prepárese!' },
    nl: { title: '📍 Chauffeur gearriveerd!', body: 'Uw chauffeur is aangekomen bij het vertrekpunt. Maak u klaar!' },
  },
  in_progress: {
    pt: { title: '⚡ Corrida iniciada', body: 'A sua corrida começou. Boa viagem!' },
    fr: { title: '⚡ Trajet commencé', body: 'Votre trajet a commencé. Bon voyage!' },
    en: { title: '⚡ Trip started', body: 'Your trip has started. Enjoy the ride!' },
    de: { title: '⚡ Fahrt begonnen', body: 'Ihre Fahrt hat begonnen. Gute Reise!' },
    it: { title: '⚡ Viaggio iniziato', body: 'Il vostro viaggio è iniziato. Buon viaggio!' },
    es: { title: '⚡ Viaje iniciado', body: '¡Su viaje ha comenzado. ¡Buen viaje!' },
    nl: { title: '⚡ Rit begonnen', body: 'Uw rit is begonnen. Goede reis!' },
  },
  completed: {
    pt: { title: '✅ Corrida concluída', body: 'Obrigado por usar Rosini Transfert. Deixe uma avaliação!' },
    fr: { title: '✅ Trajet terminé', body: "Merci d'avoir utilisé Rosini Transfert. Laissez un avis!" },
    en: { title: '✅ Trip completed', body: 'Thank you for using Rosini Transfert. Leave a review!' },
    de: { title: '✅ Fahrt abgeschlossen', body: 'Vielen Dank für die Nutzung von Rosini Transfert. Hinterlassen Sie eine Bewertung!' },
    it: { title: '✅ Viaggio completato', body: 'Grazie per aver utilizzato Rosini Transfert. Lascia una recensione!' },
    es: { title: '✅ Viaje completado', body: '¡Gracias por usar Rosini Transfert. ¡Deje una reseña!' },
    nl: { title: '✅ Rit voltooid', body: 'Bedankt voor het gebruik van Rosini Transfert. Laat een beoordeling achter!' },
  },
};

function buildEmailHtml(title, body, clientName, departurePoint, arrivalPoint) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#F5C300;font-size:28px;font-weight:300;letter-spacing:4px;margin:0;">ROSINI</h1>
      <p style="color:#F5C300;font-size:11px;letter-spacing:3px;margin:4px 0 0;">TRANSFERT</p>
    </div>
    <div style="background:#111;border:1px solid #222;border-radius:12px;padding:32px;margin-bottom:24px;">
      <h2 style="color:#fff;font-size:22px;font-weight:400;margin:0 0 12px;">${title}</h2>
      <p style="color:#aaa;font-size:14px;margin:0 0 24px;">${body}</p>
      <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:16px;">
        <p style="color:#888;font-size:12px;margin:0 0 4px;">DÉPART</p>
        <p style="color:#fff;font-size:14px;margin:0;">${departurePoint}</p>
      </div>
      <div style="background:#1a1a1a;border-radius:8px;padding:16px;">
        <p style="color:#888;font-size:12px;margin:0 0 4px;">DESTINATION</p>
        <p style="color:#fff;font-size:14px;margin:0;">${arrivalPoint}</p>
      </div>
    </div>
    <div style="text-align:center;padding:20px;background:#111;border:1px solid #222;border-radius:12px;">
      <p style="color:#888;font-size:13px;margin:0 0 8px;">Questions ? Contactez-nous</p>
      <a href="tel:+41772492245" style="color:#F5C300;text-decoration:none;font-size:14px;">+41 77 249 22 45</a>
    </div>
    <p style="color:#444;text-align:center;font-size:11px;margin-top:24px;">© ${year} Rosini Transfert</p>
  </div>
</body>
</html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { booking_id, status } = await req.json();

    if (!booking_id || !status) {
      return Response.json({ error: 'Missing booking_id or status' }, { status: 400 });
    }

    const booking = await base44.asServiceRole.entities.Booking.get(booking_id);
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    const { client_email, client_phone, client_name, departure_point, arrival_point, language = 'fr' } = booking;
    const lang = language || 'fr';
    const langMessages = statusMessages[status];
    if (!langMessages) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }
    const messages = langMessages[lang] || langMessages['fr'];

    // Send WhatsApp notification
    if (client_phone) {
      try {
        const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
        const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
        const from = Deno.env.get('TWILIO_WHATSAPP_FROM');
        const formattedTo = `whatsapp:+${client_phone.replace(/\D/g, '')}`;
        const msgBody = `${messages.title}\n${messages.body}`;
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({ From: from, To: formattedTo, Body: msgBody }).toString(),
        });
        const result = await response.json();
        if (response.ok) {
          console.log(`WhatsApp sent to ${formattedTo}:`, result.sid);
        } else {
          console.warn('WhatsApp API warning:', result.message || JSON.stringify(result));
        }
      } catch (waErr) {
        console.error('WhatsApp notification failed:', waErr.message);
      }
    }

    // Send Email via Gmail connector
    if (client_email) {
      try {
        const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
        const htmlBody = buildEmailHtml(messages.title, messages.body, client_name, departure_point, arrival_point);
        const encodedSubject = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(messages.title)))}?=`;
        const encodedName = `=?UTF-8?B?${btoa(unescape(encodeURIComponent('Rosini Transfert')))}?=`;

        const rawEmail = [
          `From: ${encodedName} <rosinitransportsetlications@gmail.com>`,
          `To: ${client_email}`,
          `Subject: ${encodedSubject}`,
          `MIME-Version: 1.0`,
          `Content-Type: text/html; charset=UTF-8`,
          ``,
          htmlBody,
        ].join('\r\n');

        const encodedEmail = btoa(unescape(encodeURIComponent(rawEmail)))
          .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: encodedEmail }),
        });

        const gmailData = await gmailRes.json();
        if (!gmailRes.ok) {
          console.error('Gmail API error:', JSON.stringify(gmailData));
        } else {
          console.log(`Email sent to ${client_email}`, gmailData.id);
        }
      } catch (emailErr) {
        console.error('Email notification failed:', emailErr.message);
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in notifyRideStatusUpdate:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});