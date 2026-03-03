import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Only send WhatsApp for en_route and arrived
const statusMessages = {
  en_route: {
    pt: { whatsapp: (name, dep) => `🚗 *Rosini Transfert* — Olá ${name}, o seu motorista está a caminho e deve chegar em aproximadamente 5 minutos ao ponto de partida: ${dep}. Por favor, prepare-se!` },
    fr: { whatsapp: (name, dep) => `🚗 *Rosini Transfert* — Bonjour ${name}, votre chauffeur est proche et devrait arriver dans environ 5 minutes à votre point de départ : ${dep}. Tenez-vous prêt(e) !` },
    en: { whatsapp: (name, dep) => `🚗 *Rosini Transfert* — Hello ${name}, your driver is nearby and should arrive in about 5 minutes at your pickup point: ${dep}. Please get ready!` },
    de: { whatsapp: (name, dep) => `🚗 *Rosini Transfert* — Hallo ${name}, Ihr Fahrer ist in der Nähe und sollte in ca. 5 Minuten an Ihrem Abholpunkt ankommen: ${dep}. Bitte machen Sie sich bereit!` },
    it: { whatsapp: (name, dep) => `🚗 *Rosini Transfert* — Salve ${name}, il vostro autista è vicino e dovrebbe arrivare in circa 5 minuti al punto di partenza: ${dep}. Per favore preparatevi!` },
    es: { whatsapp: (name, dep) => `🚗 *Rosini Transfert* — Hola ${name}, su conductor está cerca y debería llegar en unos 5 minutos a su punto de recogida: ${dep}. ¡Por favor prepárese!` },
    nl: { whatsapp: (name, dep) => `🚗 *Rosini Transfert* — Hallo ${name}, uw chauffeur is in de buurt en zou over ongeveer 5 minuten bij uw vertrekpunt moeten zijn: ${dep}. Maakt u zich klaar!` },
  },
  arrived: {
    pt: { whatsapp: (name, dep) => `📍 *Rosini Transfert* — Olá ${name}, o seu motorista chegou ao ponto de partida: ${dep}. Ele está à sua espera!` },
    fr: { whatsapp: (name, dep) => `📍 *Rosini Transfert* — Bonjour ${name}, votre chauffeur est arrivé au point de départ : ${dep}. Il vous attend !` },
    en: { whatsapp: (name, dep) => `📍 *Rosini Transfert* — Hello ${name}, your driver has arrived at the pickup point: ${dep}. He is waiting for you!` },
    de: { whatsapp: (name, dep) => `📍 *Rosini Transfert* — Hallo ${name}, Ihr Fahrer ist am Abholpunkt angekommen: ${dep}. Er wartet auf Sie!` },
    it: { whatsapp: (name, dep) => `📍 *Rosini Transfert* — Salve ${name}, il vostro autista è arrivato al punto di partenza: ${dep}. Vi sta aspettando!` },
    es: { whatsapp: (name, dep) => `📍 *Rosini Transfert* — Hola ${name}, su conductor ha llegado al punto de recogida: ${dep}. ¡Le está esperando!` },
    nl: { whatsapp: (name, dep) => `📍 *Rosini Transfert* — Hallo ${name}, uw chauffeur is aangekomen bij het vertrekpunt: ${dep}. Hij wacht op u!` },
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