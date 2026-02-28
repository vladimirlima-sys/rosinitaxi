import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { booking_id, type } = await req.json();
    // type: 'on_the_way' | 'arrived'

    if (!booking_id || !type) {
      return Response.json({ error: 'Missing booking_id or type' }, { status: 400 });
    }

    const bookings = await base44.asServiceRole.entities.Booking.list();
    const booking = bookings.find(b => b.id === booking_id);

    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    const { client_name, client_email, client_phone, departure_point, arrival_point, departure_time } = booking;

    const subjects = {
      on_the_way: `🚗 Votre chauffeur est en route — Rosini Transfert`,
      arrived: `✅ Votre chauffeur est arrivé — Rosini Transfert`,
    };

    const bodies = {
      on_the_way: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#F5C300;font-size:28px;font-weight:300;letter-spacing:4px;margin:0;">ROSINI</h1>
      <p style="color:#F5C300;font-size:11px;letter-spacing:3px;margin:4px 0 0;">TRANSFERT</p>
    </div>
    <div style="background:#111;border:1px solid #222;border-radius:12px;padding:32px;margin-bottom:24px;">
      <h2 style="color:#fff;font-size:22px;font-weight:400;margin:0 0 12px;">🚗 Votre chauffeur est en route !</h2>
      <p style="color:#aaa;font-size:14px;margin:0 0 24px;">Bonjour <strong style="color:#fff;">${client_name}</strong>, votre chauffeur Rosini est en chemin et sera bientôt à votre point de départ.</p>
      <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:16px;">
        <p style="color:#888;font-size:12px;margin:0 0 4px;">POINT DE DÉPART</p>
        <p style="color:#fff;font-size:14px;margin:0;">${departure_point}</p>
      </div>
      <div style="background:#1a1a1a;border-radius:8px;padding:16px;">
        <p style="color:#888;font-size:12px;margin:0 0 4px;">DESTINATION</p>
        <p style="color:#fff;font-size:14px;margin:0;">${arrival_point}</p>
      </div>
    </div>
    <div style="text-align:center;padding:20px;background:#111;border:1px solid #222;border-radius:12px;">
      <p style="color:#888;font-size:13px;margin:0 0 8px;">Questions ? Contactez-nous</p>
      <a href="tel:+41772492245" style="color:#F5C300;text-decoration:none;font-size:14px;">+41 77 249 22 45</a>
    </div>
    <p style="color:#444;text-align:center;font-size:11px;margin-top:24px;">© ${new Date().getFullYear()} Rosini Transfert. Tous droits réservés.</p>
  </div>
</body>
</html>`,
      arrived: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#F5C300;font-size:28px;font-weight:300;letter-spacing:4px;margin:0;">ROSINI</h1>
      <p style="color:#F5C300;font-size:11px;letter-spacing:3px;margin:4px 0 0;">TRANSFERT</p>
    </div>
    <div style="background:#111;border:1px solid #222;border-radius:12px;padding:32px;margin-bottom:24px;">
      <h2 style="color:#fff;font-size:22px;font-weight:400;margin:0 0 12px;">✅ Votre chauffeur est arrivé !</h2>
      <p style="color:#aaa;font-size:14px;margin:0 0 24px;">Bonjour <strong style="color:#fff;">${client_name}</strong>, votre chauffeur Rosini vous attend au point de départ. Bonne route !</p>
      <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:16px;">
        <p style="color:#888;font-size:12px;margin:0 0 4px;">POINT DE DÉPART</p>
        <p style="color:#fff;font-size:14px;margin:0;">${departure_point}</p>
      </div>
    </div>
    <div style="text-align:center;padding:20px;background:#111;border:1px solid #222;border-radius:12px;">
      <p style="color:#888;font-size:13px;margin:0 0 8px;">Questions ? Contactez-nous</p>
      <a href="tel:+41772492245" style="color:#F5C300;text-decoration:none;font-size:14px;">+41 77 249 22 45</a>
    </div>
    <p style="color:#444;text-align:center;font-size:11px;margin-top:24px;">© ${new Date().getFullYear()} Rosini Transfert. Tous droits réservés.</p>
  </div>
</body>
</html>`,
    };

    const subject = subjects[type];
    const htmlBody = bodies[type];

    if (!subject || !htmlBody) {
      return Response.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    // Send WhatsApp if client has phone
    if (client_phone) {
      try {
        const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
        const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
        const from = Deno.env.get('TWILIO_WHATSAPP_FROM');

        const msgBody = type === 'on_the_way'
          ? `🚗 *Rosini Transfert* — Bonjour ${client_name}, votre chauffeur est en route vers ${departure_point}. À tout de suite !`
          : `✅ *Rosini Transfert* — Votre chauffeur est arrivé à ${departure_point} et vous attend. Bonne route !`;

        const toNumber = client_phone.replace(/\s/g, '').replace(/^00/, '+');
        const formattedTo = toNumber.startsWith('+') ? `whatsapp:${toNumber}` : `whatsapp:+${toNumber}`;

        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              From: from,
              To: formattedTo,
              Body: msgBody,
            }).toString(),
          }
        );
        const result = await response.json();
        console.log('WhatsApp sent:', result.sid || result.message || JSON.stringify(result));
      } catch (waErr) {
        console.error('WhatsApp failed (non-critical):', waErr.message);
      }
    }

    // Send email if client has email
    if (client_email) {
      try {
        const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');
        const lines = [
          `From: taxirosini@gmail.com`,
          `To: ${client_email}`,
          `Subject: ${subject}`,
          `MIME-Version: 1.0`,
          `Content-Type: text/html; charset="UTF-8"`,
          ``,
          htmlBody
        ];
        const emailMessage = lines.join('\r\n');
        const base64Message = btoa(unescape(encodeURIComponent(emailMessage)))
          .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

        const resp = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ raw: base64Message })
        });
        if (!resp.ok) {
          const err = await resp.text();
          console.error('Gmail error:', err);
        } else {
          console.log('Email sent to client:', client_email);
        }
      } catch (emailErr) {
        console.error('Email failed (non-critical):', emailErr.message);
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('notifyClientDriverStatus error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});