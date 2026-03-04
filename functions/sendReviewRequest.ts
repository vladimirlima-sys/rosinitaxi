import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const translations = {
  fr: {
    subject: 'Évaluez votre trajet — Rosini Transfert',
    body: (name, departure, arrival) => `Bonjour ${name},<br><br>Nous espérons que vous avez apprécié votre trajet de ${departure} à ${arrival}.<br><br>Veuillez évaluer votre expérience pour nous aider à améliorer nos services.`
  },
  pt: {
    subject: 'Avalie sua viagem — Rosini Transfert',
    body: (name, departure, arrival) => `Olá ${name},<br><br>Esperamos que tenha gostado de sua viagem de ${departure} a ${arrival}.<br><br>Por favor, avalie sua experiência para nos ajudar a melhorar nossos serviços.`
  },
  en: {
    subject: 'Rate your trip — Rosini Transfert',
    body: (name, departure, arrival) => `Hello ${name},<br><br>We hope you enjoyed your trip from ${departure} to ${arrival}.<br><br>Please rate your experience to help us improve our services.`
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { booking_id, client_name, client_email, departure_point, arrival_point, language } = await req.json();

    if (!client_email || !booking_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const lang = (language && translations[language]) ? language : 'fr';
    const t = translations[lang];
    const reviewLink = `https://rosini.online/review?id=${booking_id}`;

    // Send email with review link
    try {
      const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
      const subject = t.subject;
      const body = t.body(client_name, departure_point, arrival_point);
      
      const emailHtml = `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;color:#333;">
<div style="max-width:600px;margin:0 auto;padding:20px;">
  <h2 style="color:#F5C300;">${subject}</h2>
  <p>${body}</p>
  <div style="text-align:center;margin:30px 0;">
    <a href="${reviewLink}" style="background:#F5C300;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Évaluer la course</a>
  </div>
  <p style="color:#999;font-size:12px;">Rosini Transfert</p>
</div>
</body>
</html>`;

      const encoder = new TextEncoder();
      const emailMessage = [
        `From: Rosini Transferts <taxirosini@gmail.com>`,
        `To: ${client_email}`,
        `Subject: ${subject}`,
        `Content-Type: text/html; charset="UTF-8"`,
        `Content-Transfer-Encoding: base64`,
        '',
        emailHtml
      ].join('\r\n');

      const encoded = encoder.encode(emailMessage);
      const binaryString = String.fromCharCode(...encoded);
      const encodedMessage = btoa(binaryString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

      const gmailRes = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: encodedMessage })
      });

      if (!gmailRes.ok) {
        throw new Error(`Gmail error: ${gmailRes.status}`);
      }

      console.log(`Review request sent to ${client_email}`);
      return Response.json({ success: true });
    } catch (emailErr) {
      console.error('Email send error:', emailErr);
      return Response.json({ error: 'Failed to send review email' }, { status: 500 });
    }
  } catch (error) {
    console.error('Review request error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});