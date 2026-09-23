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
        en_route: (name, dep, link) =>
`🚗 ROSINI TRANSFERT
━━━━━━━━━━━━━━━━━━
Bonjour ${name},
votre chauffeur est en route !

📍 Direction: ${dep}

🔴 Suivez en direct:
${link}
━━━━━━━━━━━━━━━━━━`,
        arrived: (name, dep) =>
`✅ ROSINI TRANSFERT
━━━━━━━━━━━━━━━━━━
Bonjour ${name},
votre chauffeur est arrive !

📍 ${dep}

Bonne route ! 🙌
━━━━━━━━━━━━━━━━━━`
      },
      pt: {
        en_route: (name, dep, link) =>
`🚗 ROSINI TRANSFERT
━━━━━━━━━━━━━━━━━━
Ola ${name},
o seu motorista esta a caminho !

📍 Destino: ${dep}

🔴 Acompanhe em direto:
${link}
━━━━━━━━━━━━━━━━━━`,
        arrived: (name, dep) =>
`✅ ROSINI TRANSFERT
━━━━━━━━━━━━━━━━━━
Ola ${name},
o seu motorista chegou !

📍 ${dep}

Boa viagem ! 🙌
━━━━━━━━━━━━━━━━━━`
      },
      en: {
        en_route: (name, dep, link) =>
`🚗 ROSINI TRANSFERT
━━━━━━━━━━━━━━━━━━
Hello ${name},
your driver is on the way !

📍 To: ${dep}

🔴 Track live:
${link}
━━━━━━━━━━━━━━━━━━`,
        arrived: (name, dep) =>
`✅ ROSINI TRANSFERT
━━━━━━━━━━━━━━━━━━
Hello ${name},
your driver has arrived !

📍 ${dep}

Have a great trip ! 🙌
━━━━━━━━━━━━━━━━━━`
      },
      de: {
        en_route: (name, dep, link) =>
`🚗 ROSINI TRANSFERT
━━━━━━━━━━━━━━━━━━
Hallo ${name},
Ihr Fahrer ist unterwegs !

📍 Ziel: ${dep}

🔴 Live verfolgen:
${link}
━━━━━━━━━━━━━━━━━━`,
        arrived: (name, dep) =>
`✅ ROSINI TRANSFERT
━━━━━━━━━━━━━━━━━━
Hallo ${name},
Ihr Fahrer ist angekommen !

📍 ${dep}

Gute Fahrt ! 🙌
━━━━━━━━━━━━━━━━━━`
      },
      it: {
        en_route: (name, dep, link) =>
`🚗 ROSINI TRANSFERT
━━━━━━━━━━━━━━━━━━
Salve ${name},
il suo autista e in arrivo !

📍 Destinazione: ${dep}

🔴 Segui in diretta:
${link}
━━━━━━━━━━━━━━━━━━`,
        arrived: (name, dep) =>
`✅ ROSINI TRANSFERT
━━━━━━━━━━━━━━━━━━
Salve ${name},
il suo autista e arrivato !

📍 ${dep}

Buon viaggio ! 🙌
━━━━━━━━━━━━━━━━━━`
      },
      es: {
        en_route: (name, dep, link) =>
`🚗 ROSINI TRANSFERT
━━━━━━━━━━━━━━━━━━
Hola ${name},
su conductor esta en camino !

📍 Destino: ${dep}

🔴 Siga en directo:
${link}
━━━━━━━━━━━━━━━━━━`,
        arrived: (name, dep) =>
`✅ ROSINI TRANSFERT
━━━━━━━━━━━━━━━━━━
Hola ${name},
su conductor ha llegado !

📍 ${dep}

Buen viaje ! 🙌
━━━━━━━━━━━━━━━━━━`
      },
      nl: {
        en_route: (name, dep, link) =>
`🚗 ROSINI TRANSFERT
━━━━━━━━━━━━━━━━━━
Hallo ${name},
uw chauffeur is onderweg !

📍 Naar: ${dep}

🔴 Volg live:
${link}
━━━━━━━━━━━━━━━━━━`,
        arrived: (name, dep) =>
`✅ ROSINI TRANSFERT
━━━━━━━━━━━━━━━━━━
Hallo ${name},
uw chauffeur is gearriveerd !

📍 ${dep}

Goede reis ! 🙌
━━━━━━━━━━━━━━━━━━`
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