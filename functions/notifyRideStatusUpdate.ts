import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const messages = {
  en_route: {
    fr: (name, dep) => `🚗 *Rosini Transfert*\n\nBonjour ${name}, votre chauffeur est proche et arrivera dans environ 5 minutes a :\n📍 ${dep}\n\nTenez-vous pret(e) !`,
    pt: (name, dep) => `🚗 *Rosini Transfert*\n\nOla ${name}, o seu motorista esta proximo e chegara em aproximadamente 5 minutos em :\n📍 ${dep}\n\nPor favor, prepare-se!`,
    en: (name, dep) => `🚗 *Rosini Transfert*\n\nHello ${name}, your driver is nearby and will arrive in about 5 minutes at:\n📍 ${dep}\n\nPlease get ready!`,
    de: (name, dep) => `🚗 *Rosini Transfert*\n\nHallo ${name}, Ihr Fahrer ist in der Nahe und kommt in ca. 5 Minuten bei:\n📍 ${dep}\n\nBitte machen Sie sich bereit!`,
    it: (name, dep) => `🚗 *Rosini Transfert*\n\nSalve ${name}, il vostro autista e vicino e arrivera in circa 5 minuti a:\n📍 ${dep}\n\nPreparatevi!`,
    es: (name, dep) => `🚗 *Rosini Transfert*\n\nHola ${name}, su conductor esta cerca y llegara en unos 5 minutos a:\n📍 ${dep}\n\n¡Preparese!`,
    nl: (name, dep) => `🚗 *Rosini Transfert*\n\nHallo ${name}, uw chauffeur is in de buurt en arriveert over ongeveer 5 minuten bij:\n📍 ${dep}\n\nMaakt u zich klaar!`,
  },
  arrived: {
    fr: (name, dep) => `📍 *Rosini Transfert*\n\nBonjour ${name}, votre chauffeur est arrive a votre point de depart :\n📍 ${dep}\n\nIl vous attend. Bonne route !`,
    pt: (name, dep) => `📍 *Rosini Transfert*\n\nOla ${name}, o seu motorista chegou ao ponto de partida :\n📍 ${dep}\n\nEle esta a sua espera. Boa viagem!`,
    en: (name, dep) => `📍 *Rosini Transfert*\n\nHello ${name}, your driver has arrived at your pickup point:\n📍 ${dep}\n\nHe is waiting for you. Have a great trip!`,
    de: (name, dep) => `📍 *Rosini Transfert*\n\nHallo ${name}, Ihr Fahrer ist angekommen bei:\n📍 ${dep}\n\nEr wartet auf Sie. Gute Fahrt!`,
    it: (name, dep) => `📍 *Rosini Transfert*\n\nSalve ${name}, il vostro autista e arrivato a:\n📍 ${dep}\n\nVi sta aspettando. Buon viaggio!`,
    es: (name, dep) => `📍 *Rosini Transfert*\n\nHola ${name}, su conductor ha llegado a:\n📍 ${dep}\n\nLe esta esperando. ¡Buen viaje!`,
    nl: (name, dep) => `📍 *Rosini Transfert*\n\nHallo ${name}, uw chauffeur is aangekomen bij:\n📍 ${dep}\n\nHij wacht op u. Goede reis!`,
  },
};

Deno.serve(async (req) => {
  try {
    const { booking_id, status } = await req.json();

    if (!booking_id || !status) {
      return Response.json({ error: 'Missing booking_id or status' }, { status: 400 });
    }

    if (!messages[status]) {
      console.log(`Status "${status}" — no WhatsApp configured, skipping.`);
      return Response.json({ success: true, skipped: true });
    }

    // Get booking data via Base44 HTTP API directly
    const appId = Deno.env.get('BASE44_APP_ID');
    const apiBase = `https://api.base44.com/api/apps/${appId}/entities/Booking`;

    const listRes = await fetch(`${apiBase}?filters=${encodeURIComponent(JSON.stringify({ id: booking_id }))}`, {
      headers: { 'x-api-key': Deno.env.get('BASE44_SERVICE_ROLE_KEY') || '' },
    });

    // Fallback: parse from request body if needed
    // Actually, just use the SDK properly with a timeout
    const base44 = createClientFromRequest(req);
    
    let booking;
    try {
      const results = await Promise.race([
        base44.asServiceRole.entities.Booking.filter({ id: booking_id }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
      ]);
      booking = results[0];
    } catch (e) {
      console.error('Booking fetch failed:', e.message);
      return Response.json({ error: 'Could not fetch booking: ' + e.message }, { status: 500 });
    }

    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    const { client_name, client_phone, departure_point, language } = booking;
    const lang = (language && messages[status][language]) ? language : 'fr';
    const msgBody = messages[status][lang](client_name || 'Client', departure_point || '');

    console.log(`Sending WhatsApp | status=${status} | lang=${lang} | phone=${client_phone}`);

    if (!client_phone) {
      console.warn('No client phone — skipping WhatsApp.');
      return Response.json({ success: true, skipped: 'no_phone' });
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const from = Deno.env.get('TWILIO_WHATSAPP_FROM');

    if (!accountSid || !authToken || !from) {
      console.error('Missing Twilio env vars');
      return Response.json({ error: 'Twilio not configured' }, { status: 500 });
    }

    const digits = client_phone.replace(/\D/g, '');
    const formattedTo = `whatsapp:+${digits}`;
    console.log(`Formatted phone: ${formattedTo} | From: ${from}`);

    const twilioRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ From: from, To: formattedTo, Body: msgBody }).toString(),
      }
    );

    const twilioData = await twilioRes.json();
    if (!twilioRes.ok) {
      console.error(`Twilio error ${twilioRes.status}:`, JSON.stringify(twilioData));
      return Response.json({ error: twilioData.message, twilio: twilioData }, { status: 500 });
    }

    console.log(`WhatsApp sent OK. SID: ${twilioData.sid}`);
    return Response.json({ success: true, sid: twilioData.sid });

  } catch (error) {
    console.error('notifyRideStatusUpdate error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});