import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Only WhatsApp for en_route and arrived statuses
const messages = {
  en_route: {
    fr: (name, dep) => `🚗 *Rosini Transfert*\n\nBonjour ${name}, votre chauffeur est proche et arrivera dans environ 5 minutes à :\n📍 ${dep}\n\nTenez-vous prêt(e) !`,
    pt: (name, dep) => `🚗 *Rosini Transfert*\n\nOlá ${name}, o seu motorista está próximo e chegará em aproximadamente 5 minutos em :\n📍 ${dep}\n\nPor favor, prepare-se!`,
    en: (name, dep) => `🚗 *Rosini Transfert*\n\nHello ${name}, your driver is nearby and will arrive in about 5 minutes at:\n📍 ${dep}\n\nPlease get ready!`,
    de: (name, dep) => `🚗 *Rosini Transfert*\n\nHallo ${name}, Ihr Fahrer ist in der Nähe und kommt in ca. 5 Minuten bei:\n📍 ${dep}\n\nBitte machen Sie sich bereit!`,
    it: (name, dep) => `🚗 *Rosini Transfert*\n\nSalve ${name}, il vostro autista è vicino e arriverà in circa 5 minuti a:\n📍 ${dep}\n\nPreparatevi!`,
    es: (name, dep) => `🚗 *Rosini Transfert*\n\nHola ${name}, su conductor está cerca y llegará en unos 5 minutos a:\n📍 ${dep}\n\n¡Prepárese!`,
    nl: (name, dep) => `🚗 *Rosini Transfert*\n\nHallo ${name}, uw chauffeur is in de buurt en arriveert over ongeveer 5 minuten bij:\n📍 ${dep}\n\nMaakt u zich klaar!`,
  },
  arrived: {
    fr: (name, dep) => `📍 *Rosini Transfert*\n\nBonjour ${name}, votre chauffeur est arrivé à votre point de départ :\n📍 ${dep}\n\nIl vous attend. Bonne route !`,
    pt: (name, dep) => `📍 *Rosini Transfert*\n\nOlá ${name}, o seu motorista chegou ao ponto de partida :\n📍 ${dep}\n\nEle está à sua espera. Boa viagem!`,
    en: (name, dep) => `📍 *Rosini Transfert*\n\nHello ${name}, your driver has arrived at your pickup point:\n📍 ${dep}\n\nHe is waiting for you. Have a great trip!`,
    de: (name, dep) => `📍 *Rosini Transfert*\n\nHallo ${name}, Ihr Fahrer ist angekommen bei:\n📍 ${dep}\n\nEr wartet auf Sie. Gute Fahrt!`,
    it: (name, dep) => `📍 *Rosini Transfert*\n\nSalve ${name}, il vostro autista è arrivato a:\n📍 ${dep}\n\nVi sta aspettando. Buon viaggio!`,
    es: (name, dep) => `📍 *Rosini Transfert*\n\nHola ${name}, su conductor ha llegado a:\n📍 ${dep}\n\nLe está esperando. ¡Buen viaje!`,
    nl: (name, dep) => `📍 *Rosini Transfert*\n\nHallo ${name}, uw chauffeur is aangekomen bij:\n📍 ${dep}\n\nHij wacht op u. Goede reis!`,
  },
};

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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { booking_id, status } = await req.json();

    if (!booking_id || !status) {
      return Response.json({ error: 'Missing booking_id or status' }, { status: 400 });
    }

    // Skip silently for statuses we don't handle
    if (!messages[status]) {
      console.log(`Status "${status}" — no WhatsApp configured, skipping.`);
      return Response.json({ success: true, skipped: true });
    }

    const booking = await base44.asServiceRole.entities.Booking.get(booking_id);
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    const { client_name, client_phone, departure_point, language } = booking;
    const lang = (language && messages[status][language]) ? language : 'fr';
    const msgBody = messages[status][lang](client_name || 'Client', departure_point || '');

    console.log(`Sending WhatsApp | status=${status} | lang=${lang} | phone=${client_phone}`);

    if (!client_phone) {
      console.warn('No client phone — skipping WhatsApp.');
      return Response.json({ success: true, skipped: true });
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const from = Deno.env.get('TWILIO_WHATSAPP_FROM');

    if (!accountSid || !authToken || !from) {
      console.error('Missing Twilio env vars.');
      return Response.json({ error: 'Twilio not configured' }, { status: 500 });
    }

    const formattedTo = formatPhone(client_phone);
    console.log(`Formatted phone: ${formattedTo}`);

    await sendWhatsApp(accountSid, authToken, from, formattedTo, msgBody);

    return Response.json({ success: true });
  } catch (error) {
    console.error('notifyRideStatusUpdate error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});