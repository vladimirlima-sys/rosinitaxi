import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const translations = {
  fr: {
    on_the_way_subject: `🚗 Votre chauffeur est en route — Rosini Transfert`,
    arrived_subject: `✅ Votre chauffeur est arrivé — Rosini Transfert`,
    on_the_way_title: `🚗 Votre chauffeur est en route !`,
    on_the_way_body: (name, dep, driverName) => `Bonjour <strong style="color:#fff;">${name}</strong>, votre chauffeur <strong style="color:#F5C300;">${driverName}</strong> est en chemin et sera bientôt à votre point de départ.`,
    arrived_title: `✅ Votre chauffeur est arrivé !`,
    arrived_body: (name, driverName) => `Bonjour <strong style="color:#fff;">${name}</strong>, votre chauffeur <strong style="color:#F5C300;">${driverName}</strong> vous attend au point de départ. Bonne route !`,
    departure_label: `POINT DE DÉPART`,
    destination_label: `DESTINATION`,
    contact: `Questions ? Contactez-nous`,
    copyright: (y) => `© ${y} Rosini Transfert. Tous droits réservés.`,
    on_the_way_whatsapp: (name, dep, driverName) => `🚗 *Rosini Transfert* — Bonjour ${name}, votre chauffeur *${driverName}* est en route vers ${dep}. À tout de suite !`,
    arrived_whatsapp: (name, dep, driverName) => `✅ *Rosini Transfert* — Votre chauffeur *${driverName}* est arrivé à ${dep} et vous attend. Bonne route !`,
  },
  pt: {
    on_the_way_subject: `🚗 O seu motorista está a caminho — Rosini Transfert`,
    arrived_subject: `✅ O seu motorista chegou — Rosini Transfert`,
    on_the_way_title: `🚗 O seu motorista está a caminho!`,
    on_the_way_body: (name, dep, driverName) => `Olá <strong style="color:#fff;">${name}</strong>, o seu motorista <strong style="color:#F5C300;">${driverName}</strong> está a caminho e chegará em breve ao seu ponto de partida.`,
    arrived_title: `✅ O seu motorista chegou!`,
    arrived_body: (name, dep, driverName) => `Olá <strong style="color:#fff;">${name}</strong>, o seu motorista <strong style="color:#F5C300;">${driverName}</strong> está à sua espera no ponto de partida. Boa viagem!`,
    departure_label: `PONTO DE PARTIDA`,
    destination_label: `DESTINO`,
    contact: `Dúvidas? Entre em contato`,
    copyright: (y) => `© ${y} Rosini Transfert. Todos os direitos reservados.`,
    on_the_way_whatsapp: (name, dep, driverName) => `🚗 *Rosini Transfert* — Olá ${name}, o seu motorista *${driverName}* está a caminho de ${dep}. Até já!`,
    arrived_whatsapp: (name, dep, driverName) => `✅ *Rosini Transfert* — O seu motorista *${driverName}* chegou a ${dep} e está à sua espera. Boa viagem!`,
  },
  en: {
    on_the_way_subject: `🚗 Your driver is on the way — Rosini Transfert`,
    arrived_subject: `✅ Your driver has arrived — Rosini Transfert`,
    on_the_way_title: `🚗 Your driver is on the way!`,
    on_the_way_body: (name, dep, driverName) => `Hello <strong style="color:#fff;">${name}</strong>, your driver <strong style="color:#F5C300;">${driverName}</strong> is on the way and will arrive at your departure point shortly.`,
    arrived_title: `✅ Your driver has arrived!`,
    arrived_body: (name, dep, driverName) => `Hello <strong style="color:#fff;">${name}</strong>, your driver <strong style="color:#F5C300;">${driverName}</strong> is waiting for you at the departure point. Have a great trip!`,
    departure_label: `DEPARTURE POINT`,
    destination_label: `DESTINATION`,
    contact: `Questions? Contact us`,
    copyright: (y) => `© ${y} Rosini Transfert. All rights reserved.`,
    on_the_way_whatsapp: (name, dep, driverName) => `🚗 *Rosini Transfert* — Hello ${name}, your driver *${driverName}* is on the way to ${dep}. See you soon!`,
    arrived_whatsapp: (name, dep, driverName) => `✅ *Rosini Transfert* — Your driver *${driverName}* has arrived at ${dep} and is waiting for you. Have a great trip!`,
  },
  de: {
    on_the_way_subject: `🚗 Ihr Fahrer ist unterwegs — Rosini Transfert`,
    arrived_subject: `✅ Ihr Fahrer ist angekommen — Rosini Transfert`,
    on_the_way_title: `🚗 Ihr Fahrer ist unterwegs!`,
    on_the_way_body: (name, dep, driverName) => `Hallo <strong style="color:#fff;">${name}</strong>, Ihr Fahrer <strong style="color:#F5C300;">${driverName}</strong> ist auf dem Weg und wird bald an Ihrem Abholpunkt sein.`,
    arrived_title: `✅ Ihr Fahrer ist angekommen!`,
    arrived_body: (name, dep, driverName) => `Hallo <strong style="color:#fff;">${name}</strong>, Ihr Fahrer <strong style="color:#F5C300;">${driverName}</strong> wartet an Ihrem Abholpunkt. Gute Fahrt!`,
    departure_label: `ABHOLPUNKT`,
    destination_label: `ZIEL`,
    contact: `Fragen? Kontaktieren Sie uns`,
    copyright: (y) => `© ${y} Rosini Transfert. Alle Rechte vorbehalten.`,
    on_the_way_whatsapp: (name, dep, driverName) => `🚗 *Rosini Transfert* — Hallo ${name}, Ihr Fahrer *${driverName}* ist auf dem Weg nach ${dep}. Bis gleich!`,
    arrived_whatsapp: (name, dep, driverName) => `✅ *Rosini Transfert* — Ihr Fahrer *${driverName}* ist in ${dep} angekommen und wartet auf Sie. Gute Fahrt!`,
  },
  it: {
    on_the_way_subject: `🚗 Il vostro autista è in arrivo — Rosini Transfert`,
    arrived_subject: `✅ Il vostro autista è arrivato — Rosini Transfert`,
    on_the_way_title: `🚗 Il vostro autista è in arrivo!`,
    on_the_way_body: (name, dep, driverName) => `Salve <strong style="color:#fff;">${name}</strong>, il vostro autista <strong style="color:#F5C300;">${driverName}</strong> è in arrivo e sarà presto al vostro punto di partenza.`,
    arrived_title: `✅ Il vostro autista è arrivato!`,
    arrived_body: (name, dep, driverName) => `Salve <strong style="color:#fff;">${name}</strong>, il vostro autista <strong style="color:#F5C300;">${driverName}</strong> vi aspetta al punto di partenza. Buon viaggio!`,
    departure_label: `PUNTO DI PARTENZA`,
    destination_label: `DESTINAZIONE`,
    contact: `Domande? Contattateci`,
    copyright: (y) => `© ${y} Rosini Transfert. Tutti i diritti riservati.`,
    on_the_way_whatsapp: (name, dep, driverName) => `🚗 *Rosini Transfert* — Salve ${name}, il vostro autista *${driverName}* è in arrivo a ${dep}. A presto!`,
    arrived_whatsapp: (name, dep, driverName) => `✅ *Rosini Transfert* — Il vostro autista *${driverName}* è arrivato a ${dep} e vi sta aspettando. Buon viaggio!`,
  },
  es: {
    on_the_way_subject: `🚗 Su conductor está en camino — Rosini Transfert`,
    arrived_subject: `✅ Su conductor ha llegado — Rosini Transfert`,
    on_the_way_title: `🚗 ¡Su conductor está en camino!`,
    on_the_way_body: (name, dep, driverName) => `Hola <strong style="color:#fff;">${name}</strong>, su conductor <strong style="color:#F5C300;">${driverName}</strong> está en camino y llegará pronto a su punto de salida.`,
    arrived_title: `✅ ¡Su conductor ha llegado!`,
    arrived_body: (name, dep, driverName) => `Hola <strong style="color:#fff;">${name}</strong>, su conductor <strong style="color:#F5C300;">${driverName}</strong> le espera en el punto de salida. ¡Buen viaje!`,
    departure_label: `PUNTO DE SALIDA`,
    destination_label: `DESTINO`,
    contact: `¿Preguntas? Contáctenos`,
    copyright: (y) => `© ${y} Rosini Transfert. Todos los derechos reservados.`,
    on_the_way_whatsapp: (name, dep, driverName) => `🚗 *Rosini Transfert* — Hola ${name}, su conductor *${driverName}* está en camino hacia ${dep}. ¡Hasta pronto!`,
    arrived_whatsapp: (name, dep, driverName) => `✅ *Rosini Transfert* — Su conductor *${driverName}* ha llegado a ${dep} y le está esperando. ¡Buen viaje!`,
  },
  nl: {
    on_the_way_subject: `🚗 Uw chauffeur is onderweg — Rosini Transfert`,
    arrived_subject: `✅ Uw chauffeur is gearriveerd — Rosini Transfert`,
    on_the_way_title: `🚗 Uw chauffeur is onderweg!`,
    on_the_way_body: (name, dep, driverName) => `Hallo <strong style="color:#fff;">${name}</strong>, uw chauffeur <strong style="color:#F5C300;">${driverName}</strong> is onderweg en zal binnenkort bij uw vertrekpunt zijn.`,
    arrived_title: `✅ Uw chauffeur is gearriveerd!`,
    arrived_body: (name, dep, driverName) => `Hallo <strong style="color:#fff;">${name}</strong>, uw chauffeur <strong style="color:#F5C300;">${driverName}</strong> wacht op u bij het vertrekpunt. Goede reis!`,
    departure_label: `VERTREKPUNT`,
    destination_label: `BESTEMMING`,
    contact: `Vragen? Neem contact op`,
    copyright: (y) => `© ${y} Rosini Transfert. Alle rechten voorbehouden.`,
    on_the_way_whatsapp: (name, dep) => `🚗 *Rosini Transfert* — Hallo ${name}, uw chauffeur is onderweg naar ${dep}. Tot zo!`,
    arrived_whatsapp: (name, dep) => `✅ *Rosini Transfert* — Uw chauffeur is aangekomen bij ${dep} en wacht op u. Goede reis!`,
  },
};

function buildEmailBody(t, type, client_name, departure_point, arrival_point, driver_name) {
  const year = new Date().getFullYear();
  const title = type === 'on_the_way' ? t.on_the_way_title : t.arrived_title;
  const body = type === 'on_the_way' ? t.on_the_way_body(client_name, departure_point, driver_name) : t.arrived_body(client_name, departure_point, driver_name);
  const showDestination = type === 'on_the_way';

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
      <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:${showDestination ? '16px' : '0'};">
        <p style="color:#888;font-size:12px;margin:0 0 4px;">${t.departure_label}</p>
        <p style="color:#fff;font-size:14px;margin:0;">${departure_point}</p>
      </div>
      ${showDestination ? `
      <div style="background:#1a1a1a;border-radius:8px;padding:16px;">
        <p style="color:#888;font-size:12px;margin:0 0 4px;">${t.destination_label}</p>
        <p style="color:#fff;font-size:14px;margin:0;">${arrival_point}</p>
      </div>` : ''}
    </div>
    <div style="text-align:center;padding:20px;background:#111;border:1px solid #222;border-radius:12px;">
      <p style="color:#888;font-size:13px;margin:0 0 8px;">${t.contact}</p>
      <a href="tel:+41772492245" style="color:#F5C300;text-decoration:none;font-size:14px;">+41 77 249 22 45</a>
    </div>
    <p style="color:#444;text-align:center;font-size:11px;margin-top:24px;">${t.copyright(year)}</p>
  </div>
</body>
</html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { booking_id, type } = await req.json();

    if (!booking_id || !type) {
      return Response.json({ error: 'Missing booking_id or type' }, { status: 400 });
    }

    const bookings = await base44.asServiceRole.entities.Booking.list();
    const booking = bookings.find(b => b.id === booking_id);

    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    const { client_name, client_email, client_phone, departure_point, arrival_point, language, driver_name } = booking;
    const lang = language || 'fr';
    const t = translations[lang] || translations.fr;
    const driverName = driver_name || 'Rosini';

    const subject = type === 'on_the_way' ? t.on_the_way_subject : t.arrived_subject;
    const htmlBody = buildEmailBody(t, type, client_name, departure_point, arrival_point, driverName);

    if (!subject) {
      return Response.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    // Send WhatsApp
    if (client_phone) {
      try {
        const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
        const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
        const from = Deno.env.get('TWILIO_WHATSAPP_FROM');
        const msgBody = type === 'on_the_way'
          ? t.on_the_way_whatsapp(client_name, departure_point, driverName)
          : t.arrived_whatsapp(client_name, departure_point, driverName);
        const toNumber = client_phone.replace(/\s/g, '').replace(/^00/, '+');
        const formattedTo = toNumber.startsWith('+') ? `whatsapp:${toNumber}` : `whatsapp:+${toNumber}`;
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
          method: 'POST',
          headers: { 'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`), 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ From: from, To: formattedTo, Body: msgBody }).toString(),
        });
        const result = await response.json();
        console.log('WhatsApp sent:', result.sid || JSON.stringify(result));
      } catch (waErr) {
        console.error('WhatsApp failed (non-critical):', waErr.message);
      }
    }

    // Send email
    if (client_email) {
      try {
        const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');
        const lines = [`From: taxirosini@gmail.com`, `To: ${client_email}`, `Subject: ${subject}`, `MIME-Version: 1.0`, `Content-Type: text/html; charset="UTF-8"`, ``, htmlBody];
        const emailMessage = lines.join('\r\n');
        const base64Message = btoa(unescape(encodeURIComponent(emailMessage))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        const resp = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ raw: base64Message })
        });
        if (!resp.ok) { const err = await resp.text(); console.error('Gmail error:', err); }
        else { console.log('Email sent to client:', client_email, 'lang:', lang); }
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