import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const translations = {
  fr: {
    on_the_way_subject: `🚗 Votre chauffeur est en route — Rosini Transfert`,
    arrived_subject: `✅ Votre chauffeur est arrivé — Rosini Transfert`,
    on_the_way_whatsapp: (name, dep, driverName) =>
      `🚗 *Rosini Transfert*\n\nBonjour ${name}, votre chauffeur *${driverName}* est en route et arrivera dans environ 5 minutes à votre point de départ :\n📍 ${dep}\n\nTenez-vous prêt(e) !`,
    arrived_whatsapp: (name, dep, driverName) =>
      `✅ *Rosini Transfert*\n\nBonjour ${name}, votre chauffeur *${driverName}* est arrivé à votre point de départ :\n📍 ${dep}\n\nIl vous attend. Bonne route !`,
    on_the_way_email_title: `🚗 Votre chauffeur est en route !`,
    on_the_way_email_body: (name, dep, driverName) =>
      `Bonjour ${name},<br><br>Votre chauffeur <strong>${driverName}</strong> est en route et arrivera dans environ 5 minutes à :<br><strong>${dep}</strong>`,
    arrived_email_title: `✅ Votre chauffeur est arrivé !`,
    arrived_email_body: (name, dep, driverName) =>
      `Bonjour ${name},<br><br>Votre chauffeur <strong>${driverName}</strong> est arrivé à votre point de départ :<br><strong>${dep}</strong><br><br>Il vous attend. Bonne route !`,
  },
  pt: {
    on_the_way_subject: `🚗 O seu motorista está a caminho — Rosini Transfert`,
    arrived_subject: `✅ O seu motorista chegou — Rosini Transfert`,
    on_the_way_whatsapp: (name, dep, driverName) =>
      `🚗 *Rosini Transfert*\n\nOlá ${name}, o seu motorista *${driverName}* está a caminho e chegará em aproximadamente 5 minutos em :\n📍 ${dep}\n\nPor favor, prepare-se!`,
    arrived_whatsapp: (name, dep, driverName) =>
      `✅ *Rosini Transfert*\n\nOlá ${name}, o seu motorista *${driverName}* chegou ao ponto de partida :\n📍 ${dep}\n\nEle está à sua espera. Boa viagem!`,
    on_the_way_email_title: `🚗 O seu motorista está a caminho!`,
    on_the_way_email_body: (name, dep, driverName) =>
      `Olá ${name},<br><br>O seu motorista <strong>${driverName}</strong> está a caminho e chegará em breve a :<br><strong>${dep}</strong>`,
    arrived_email_title: `✅ O seu motorista chegou!`,
    arrived_email_body: (name, dep, driverName) =>
      `Olá ${name},<br><br>O seu motorista <strong>${driverName}</strong> chegou ao ponto de partida :<br><strong>${dep}</strong><br><br>Ele está à sua espera. Boa viagem!`,
  },
  en: {
    on_the_way_subject: `🚗 Your driver is on the way — Rosini Transfert`,
    arrived_subject: `✅ Your driver has arrived — Rosini Transfert`,
    on_the_way_whatsapp: (name, dep, driverName) =>
      `🚗 *Rosini Transfert*\n\nHello ${name}, your driver *${driverName}* is on the way and will arrive in about 5 minutes at:\n📍 ${dep}\n\nPlease get ready!`,
    arrived_whatsapp: (name, dep, driverName) =>
      `✅ *Rosini Transfert*\n\nHello ${name}, your driver *${driverName}* has arrived at your pickup point:\n📍 ${dep}\n\nHe is waiting for you. Have a great trip!`,
    on_the_way_email_title: `🚗 Your driver is on the way!`,
    on_the_way_email_body: (name, dep, driverName) =>
      `Hello ${name},<br><br>Your driver <strong>${driverName}</strong> is on the way and will arrive shortly at:<br><strong>${dep}</strong>`,
    arrived_email_title: `✅ Your driver has arrived!`,
    arrived_email_body: (name, dep, driverName) =>
      `Hello ${name},<br><br>Your driver <strong>${driverName}</strong> has arrived at your pickup point:<br><strong>${dep}</strong><br><br>He is waiting for you. Have a great trip!`,
  },
  de: {
    on_the_way_subject: `🚗 Ihr Fahrer ist unterwegs — Rosini Transfert`,
    arrived_subject: `✅ Ihr Fahrer ist angekommen — Rosini Transfert`,
    on_the_way_whatsapp: (name, dep, driverName) =>
      `🚗 *Rosini Transfert*\n\nHallo ${name}, Ihr Fahrer *${driverName}* ist unterwegs und kommt in ca. 5 Minuten bei:\n📍 ${dep}\n\nBitte machen Sie sich bereit!`,
    arrived_whatsapp: (name, dep, driverName) =>
      `✅ *Rosini Transfert*\n\nHallo ${name}, Ihr Fahrer *${driverName}* ist angekommen bei:\n📍 ${dep}\n\nEr wartet auf Sie. Gute Fahrt!`,
    on_the_way_email_title: `🚗 Ihr Fahrer ist unterwegs!`,
    on_the_way_email_body: (name, dep, driverName) =>
      `Hallo ${name},<br><br>Ihr Fahrer <strong>${driverName}</strong> ist unterwegs und wird bald ankommen bei:<br><strong>${dep}</strong>`,
    arrived_email_title: `✅ Ihr Fahrer ist angekommen!`,
    arrived_email_body: (name, dep, driverName) =>
      `Hallo ${name},<br><br>Ihr Fahrer <strong>${driverName}</strong> ist angekommen bei:<br><strong>${dep}</strong><br><br>Er wartet auf Sie. Gute Fahrt!`,
  },
  it: {
    on_the_way_subject: `🚗 Il vostro autista è in arrivo — Rosini Transfert`,
    arrived_subject: `✅ Il vostro autista è arrivato — Rosini Transfert`,
    on_the_way_whatsapp: (name, dep, driverName) =>
      `🚗 *Rosini Transfert*\n\nSalve ${name}, il vostro autista *${driverName}* è in arrivo e arriverà in circa 5 minuti a:\n📍 ${dep}\n\nPreparatevi!`,
    arrived_whatsapp: (name, dep, driverName) =>
      `✅ *Rosini Transfert*\n\nSalve ${name}, il vostro autista *${driverName}* è arrivato a:\n📍 ${dep}\n\nVi sta aspettando. Buon viaggio!`,
    on_the_way_email_title: `🚗 Il vostro autista è in arrivo!`,
    on_the_way_email_body: (name, dep, driverName) =>
      `Salve ${name},<br><br>Il vostro autista <strong>${driverName}</strong> è in arrivo e sarà presto a:<br><strong>${dep}</strong>`,
    arrived_email_title: `✅ Il vostro autista è arrivato!`,
    arrived_email_body: (name, dep, driverName) =>
      `Salve ${name},<br><br>Il vostro autista <strong>${driverName}</strong> è arrivato a:<br><strong>${dep}</strong><br><br>Vi sta aspettando. Buon viaggio!`,
  },
  es: {
    on_the_way_subject: `🚗 Su conductor está en camino — Rosini Transfert`,
    arrived_subject: `✅ Su conductor ha llegado — Rosini Transfert`,
    on_the_way_whatsapp: (name, dep, driverName) =>
      `🚗 *Rosini Transfert*\n\nHola ${name}, su conductor *${driverName}* está en camino y llegará en unos 5 minutos a:\n📍 ${dep}\n\n¡Prepárese!`,
    arrived_whatsapp: (name, dep, driverName) =>
      `✅ *Rosini Transfert*\n\nHola ${name}, su conductor *${driverName}* ha llegado a:\n📍 ${dep}\n\nLe está esperando. ¡Buen viaje!`,
    on_the_way_email_title: `🚗 ¡Su conductor está en camino!`,
    on_the_way_email_body: (name, dep, driverName) =>
      `Hola ${name},<br><br>Su conductor <strong>${driverName}</strong> está en camino y llegará pronto a:<br><strong>${dep}</strong>`,
    arrived_email_title: `✅ ¡Su conductor ha llegado!`,
    arrived_email_body: (name, dep, driverName) =>
      `Hola ${name},<br><br>Su conductor <strong>${driverName}</strong> ha llegado a:<br><strong>${dep}</strong><br><br>Le está esperando. ¡Buen viaje!`,
  },
  nl: {
    on_the_way_subject: `🚗 Uw chauffeur is onderweg — Rosini Transfert`,
    arrived_subject: `✅ Uw chauffeur is gearriveerd — Rosini Transfert`,
    on_the_way_whatsapp: (name, dep, driverName) =>
      `🚗 *Rosini Transfert*\n\nHallo ${name}, uw chauffeur *${driverName}* is onderweg en arriveert over ongeveer 5 minuten bij:\n📍 ${dep}\n\nMaakt u zich klaar!`,
    arrived_whatsapp: (name, dep, driverName) =>
      `✅ *Rosini Transfert*\n\nHallo ${name}, uw chauffeur *${driverName}* is aangekomen bij:\n📍 ${dep}\n\nHij wacht op u. Goede reis!`,
    on_the_way_email_title: `🚗 Uw chauffeur is onderweg!`,
    on_the_way_email_body: (name, dep, driverName) =>
      `Hallo ${name},<br><br>Uw chauffeur <strong>${driverName}</strong> is onderweg en zal binnenkort aankomen bij:<br><strong>${dep}</strong>`,
    arrived_email_title: `✅ Uw chauffeur is gearriveerd!`,
    arrived_email_body: (name, dep, driverName) =>
      `Hallo ${name},<br><br>Uw chauffeur <strong>${driverName}</strong> is aangekomen bij:<br><strong>${dep}</strong><br><br>Hij wacht op u. Goede reis!`,
  },
};

function buildEmailHtml(title, body, dep, arr, trackingLink) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="color:#F5C300;font-size:28px;font-weight:300;letter-spacing:4px;margin:0;">ROSINI</h1>
    <p style="color:#F5C300;font-size:11px;letter-spacing:3px;margin:4px 0 0;">TRANSFERT</p>
  </div>
  <div style="background:#111;border:1px solid #222;border-radius:12px;padding:32px;margin-bottom:24px;">
    <h2 style="color:#fff;font-size:20px;font-weight:400;margin:0 0 16px;">${title}</h2>
    <p style="color:#aaa;font-size:14px;line-height:1.6;margin:0 0 24px;">${body}</p>
    <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:12px;">
      <p style="color:#888;font-size:11px;margin:0 0 4px;text-transform:uppercase;">Point de départ</p>
      <p style="color:#fff;font-size:14px;margin:0;">${dep}</p>
    </div>
    ${arr ? `<div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:12px;">
      <p style="color:#888;font-size:11px;margin:0 0 4px;text-transform:uppercase;">Destination</p>
      <p style="color:#fff;font-size:14px;margin:0;">${arr}</p>
    </div>` : ''}
    ${trackingLink ? `<div style="text-align:center;margin-top:20px;">
      <a href="${trackingLink}" style="display:inline-block;background:#F5C300;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">Rastrear Corrida</a>
    </div>` : ''}
  </div>
  <div style="text-align:center;padding:20px;background:#111;border:1px solid #222;border-radius:12px;">
    <p style="color:#888;font-size:13px;margin:0 0 8px;">Perguntas? Entre em contato</p>
    <a href="tel:+41772492245" style="color:#F5C300;text-decoration:none;font-size:14px;font-weight:bold;">+41 77 249 22 45</a>
  </div>
  <p style="color:#444;text-align:center;font-size:11px;margin-top:24px;">© ${year} Rosini Transfert</p>
</div>
</body></html>`;
}

function formatPhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  return `whatsapp:+${digits}`;
}

async function sendWhatsApp(accountSid, authToken, from, to, body) {
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ From: from, To: to, Body: body }).toString(),
  });
  const result = await res.json();
  if (!res.ok) {
    console.error(`Twilio error ${res.status}:`, JSON.stringify(result));
    throw new Error(result.message || 'Twilio error');
  }
  console.log(`WhatsApp sent OK. SID: ${result.sid} | To: ${to}`);
  return result;
}

async function sendEmail(to, subject, htmlBody, accessToken) {
  const rawEmail = [
    `From: Rosini Transferts <info@rosini.online>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    htmlBody,
  ].join('\r\n');

  const encoder = new TextEncoder();
  const encoded = encoder.encode(rawEmail);
  const binaryString = String.fromCharCode(...encoded);
  const encodedEmail = btoa(binaryString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  const res = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encodedEmail }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('Gmail API error:', JSON.stringify(data));
    throw new Error(data.error?.message || 'Gmail error');
  }
  console.log(`Email sent OK to ${to}. MessageId: ${data.id}`);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { booking_id, type } = await req.json();

    if (!booking_id || !type) {
      return Response.json({ error: 'Missing booking_id or type' }, { status: 400 });
    }

    if (type !== 'on_the_way' && type !== 'arrived') {
      return Response.json({ error: 'Invalid type. Must be on_the_way or arrived' }, { status: 400 });
    }

    const bookings = await base44.asServiceRole.entities.Booking.filter({ id: booking_id });
    if (!bookings || bookings.length === 0) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }
    const booking = bookings[0];

    const { client_name, client_email, client_phone, departure_point, arrival_point, language, driver_name, driver_id } = booking;
    const lang = (language && translations[language]) ? language : 'fr';
    const t = translations[lang];
    const driverName = driver_name || 'Rosini';

    console.log(`notifyClientDriverStatus | type=${type} | lang=${lang} | email=${client_email} | phone=${client_phone}`);

    const subject = type === 'on_the_way' ? t.on_the_way_subject : t.arrived_subject;
    const emailTitle = type === 'on_the_way' ? t.on_the_way_email_title : t.arrived_email_title;
    const emailBodyText = type === 'on_the_way'
      ? t.on_the_way_email_body(client_name, departure_point, driverName)
      : t.arrived_email_body(client_name, departure_point, driverName);
    const waMsg = type === 'on_the_way'
      ? t.on_the_way_whatsapp(client_name, departure_point, driverName)
      : t.arrived_whatsapp(client_name, departure_point, driverName);

    // Send WhatsApp
    if (client_phone) {
      try {
        const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
        const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
        const from = Deno.env.get('TWILIO_WHATSAPP_FROM');
        if (!accountSid || !authToken || !from) {
          console.error('Missing Twilio env vars');
        } else {
          const formattedTo = formatPhone(client_phone);
          console.log(`Sending WhatsApp to ${formattedTo}`);
          await sendWhatsApp(accountSid, authToken, from, formattedTo, waMsg);
        }
      } catch (err) {
        console.error('WhatsApp failed:', err.message);
      }
    } else {
      console.warn('No client_phone — skipping WhatsApp');
    }

    // Send Email with tracking link
    if (client_email) {
      try {
        const appId = Deno.env.get('BASE44_APP_ID');
        const trackingLink = `https://base44.app/${appId}/pages/RideTracking?id=${booking_id}`;
        const htmlBody = buildEmailHtml(emailTitle, emailBodyText, departure_point, arrival_point, trackingLink);
        await sendEmail(client_email, subject, htmlBody, base44);
      } catch (err) {
        console.error('Email failed:', err.message);
      }
    } else {
      console.warn('No client_email — skipping email');
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('notifyClientDriverStatus error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});