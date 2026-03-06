import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const { booking_id, client_phone, client_name, departure_point, tracking_link, status, language = 'fr' } = await req.json();

    if (!booking_id || !client_phone || !status) {
      return Response.json(
        { error: 'Missing required fields: booking_id, client_phone, status' },
        { status: 400 }
      );
    }

    // Only send for en_route and arrived
    if (!['en_route', 'arrived'].includes(status)) {
      return Response.json({ success: true, skipped: true });
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const whatsappFrom = Deno.env.get('TWILIO_WHATSAPP_FROM');

    if (!accountSid || !authToken || !whatsappFrom) {
      return Response.json({ error: 'Twilio credentials not configured' }, { status: 500 });
    }

    // SMS sender = same number without whatsapp: prefix
    const smsFrom = whatsappFrom.replace('whatsapp:', '');

    // Format phone number
    let formattedPhone = client_phone.replace(/\s/g, '');
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone.replace(/\D/g, '');
    }

    // SMS message templates per language and status
    const messages = {
      fr: {
        en_route: (name, dep, link) => `Rosini Transfert: Bonjour ${name}, votre chauffeur est en route vers ${dep}. Suivez en temps reel: ${link}`,
        arrived:  (name, dep)       => `Rosini Transfert: Bonjour ${name}, votre chauffeur est arrive a ${dep}. Bonne route!`
      },
      pt: {
        en_route: (name, dep, link) => `Rosini Transfert: Ola ${name}, o seu motorista esta a caminho de ${dep}. Acompanhe em tempo real: ${link}`,
        arrived:  (name, dep)       => `Rosini Transfert: Ola ${name}, o seu motorista chegou a ${dep}. Boa viagem!`
      },
      en: {
        en_route: (name, dep, link) => `Rosini Transfert: Hello ${name}, your driver is on the way to ${dep}. Track in real time: ${link}`,
        arrived:  (name, dep)       => `Rosini Transfert: Hello ${name}, your driver has arrived at ${dep}. Have a great trip!`
      },
      de: {
        en_route: (name, dep, link) => `Rosini Transfert: Hallo ${name}, Ihr Fahrer ist auf dem Weg nach ${dep}. Verfolgen Sie ihn: ${link}`,
        arrived:  (name, dep)       => `Rosini Transfert: Hallo ${name}, Ihr Fahrer ist in ${dep} angekommen. Gute Fahrt!`
      },
      it: {
        en_route: (name, dep, link) => `Rosini Transfert: Salve ${name}, il suo autista e in arrivo a ${dep}. Segui in tempo reale: ${link}`,
        arrived:  (name, dep)       => `Rosini Transfert: Salve ${name}, il suo autista e arrivato a ${dep}. Buon viaggio!`
      },
      es: {
        en_route: (name, dep, link) => `Rosini Transfert: Hola ${name}, su conductor esta en camino a ${dep}. Siga en tiempo real: ${link}`,
        arrived:  (name, dep)       => `Rosini Transfert: Hola ${name}, su conductor ha llegado a ${dep}. Buen viaje!`
      },
      nl: {
        en_route: (name, dep, link) => `Rosini Transfert: Hallo ${name}, uw chauffeur is onderweg naar ${dep}. Volg live: ${link}`,
        arrived:  (name, dep)       => `Rosini Transfert: Hallo ${name}, uw chauffeur is gearriveerd bij ${dep}. Goede reis!`
      },
    };

    const langMsgs = messages[language] || messages['fr'];
    const msgFn = langMsgs[status];
    const messageBody = status === 'en_route'
      ? msgFn(client_name || '', departure_point || '', tracking_link || '')
      : msgFn(client_name || '', departure_point || '');

    // Send SMS via Twilio
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const bodyData = new URLSearchParams({
      From: smsFrom,
      To: formattedPhone,
      Body: messageBody,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: bodyData.toString()
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Twilio SMS error:', data);
      return Response.json({ error: 'Failed to send SMS', details: data }, { status: 500 });
    }

    console.log('SMS sent to client:', formattedPhone, '| status:', status, '| lang:', language, '| sid:', data.sid);
    return Response.json({ success: true, message_sid: data.sid });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});