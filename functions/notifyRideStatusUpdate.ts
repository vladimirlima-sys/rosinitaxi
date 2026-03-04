import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM");

const messages = {
  en_route: {
    fr: { whatsapp: (name, dep) => `🚗 *Rosini Transfert*\n\nBonjour ${name}, votre chauffeur est proche et arrivera dans environ 5 minutes a :\n📍 ${dep}\n\nTenez-vous pret(e) !`, email_subject: 'Votre chauffeur est en route', email_body: (name, dep) => `Bonjour ${name},<br><br>Votre chauffeur Rosini Transfert est proche et arrivera dans environ 5 minutes à :<br><br><strong>📍 ${dep}</strong><br><br>Tenez-vous prêt(e) !` },
    pt: { whatsapp: (name, dep) => `🚗 *Rosini Transfert*\n\nOla ${name}, o seu motorista esta proximo e chegara em aproximadamente 5 minutos em :\n📍 ${dep}\n\nPor favor, prepare-se!`, email_subject: 'Seu motorista está a caminho', email_body: (name, dep) => `Olá ${name},<br><br>Seu motorista Rosini Transfert está próximo e chegará em aproximadamente 5 minutos em :<br><br><strong>📍 ${dep}</strong><br><br>Por favor, prepare-se!` },
    en: { whatsapp: (name, dep) => `🚗 *Rosini Transfert*\n\nHello ${name}, your driver is nearby and will arrive in about 5 minutes at:\n📍 ${dep}\n\nPlease get ready!`, email_subject: 'Your driver is on the way', email_body: (name, dep) => `Hello ${name},<br><br>Your Rosini Transfert driver is nearby and will arrive in about 5 minutes at:<br><br><strong>📍 ${dep}</strong><br><br>Please get ready!` },
    de: { whatsapp: (name, dep) => `🚗 *Rosini Transfert*\n\nHallo ${name}, Ihr Fahrer ist in der Nahe und kommt in ca. 5 Minuten bei:\n📍 ${dep}\n\nBitte machen Sie sich bereit!`, email_subject: 'Ihr Fahrer ist unterwegs', email_body: (name, dep) => `Hallo ${name},<br><br>Ihr Rosini Transfert Fahrer ist in der Nähe und kommt in ca. 5 Minuten bei:<br><br><strong>📍 ${dep}</strong><br><br>Bitte machen Sie sich bereit!` },
    it: { whatsapp: (name, dep) => `🚗 *Rosini Transfert*\n\nSalve ${name}, il vostro autista e vicino e arrivera in circa 5 minuti a:\n📍 ${dep}\n\nPreparatevi!`, email_subject: 'Il vostro autista è in arrivo', email_body: (name, dep) => `Salve ${name},<br><br>Il vostro autista Rosini Transfert è vicino e arriverà in circa 5 minuti a:<br><br><strong>📍 ${dep}</strong><br><br>Preparatevi!` },
    es: { whatsapp: (name, dep) => `🚗 *Rosini Transfert*\n\nHola ${name}, su conductor esta cerca y llegara en unos 5 minutos a:\n📍 ${dep}\n\n¡Preparese!`, email_subject: 'Su conductor está en camino', email_body: (name, dep) => `Hola ${name},<br><br>Su conductor Rosini Transfert está cerca y llegará en unos 5 minutos a:<br><br><strong>📍 ${dep}</strong><br><br>¡Prepárese!` },
    nl: { whatsapp: (name, dep) => `🚗 *Rosini Transfert*\n\nHallo ${name}, uw chauffeur is in de buurt en arriveert over ongeveer 5 minuten bij:\n📍 ${dep}\n\nMaakt u zich klaar!`, email_subject: 'Uw chauffeur is onderweg', email_body: (name, dep) => `Hallo ${name},<br><br>Uw Rosini Transfert chauffeur is in de buurt en arriveert over ongeveer 5 minuten bij:<br><br><strong>📍 ${dep}</strong><br><br>Maakt u zich klaar!` },
  },
  driver_arriving: {
    // Template: rosini_driver_arrived | ContentSid: HX57b573cd1d0f5875c54cc0b145c73281
    // Variables: {{1}} = client_name, {{2}} = departure_point
    use_template: true,
    template_sid: 'HX57b573cd1d0f5875c54cc0b145c73281',
  },
  arrived: {
    fr: { whatsapp: (name, dep) => `📍 *Rosini Transfert*\n\nBonjour ${name}, votre chauffeur est arrive a votre point de depart :\n📍 ${dep}\n\nIl vous attend. Bonne route !`, email_subject: 'Votre chauffeur est arrivé', email_body: (name, dep) => `Bonjour ${name},<br><br>Votre chauffeur Rosini Transfert est arrivé à votre point de départ :<br><br><strong>📍 ${dep}</strong><br><br>Il vous attend. Bonne route !` },
    pt: { whatsapp: (name, dep) => `📍 *Rosini Transfert*\n\nOla ${name}, o seu motorista chegou ao ponto de partida :\n📍 ${dep}\n\nEle esta a sua espera. Boa viagem!`, email_subject: 'Seu motorista chegou', email_body: (name, dep) => `Olá ${name},<br><br>Seu motorista Rosini Transfert chegou ao ponto de partida :<br><br><strong>📍 ${dep}</strong><br><br>Ele está a sua espera. Boa viagem!` },
    en: { whatsapp: (name, dep) => `📍 *Rosini Transfert*\n\nHello ${name}, your driver has arrived at your pickup point:\n📍 ${dep}\n\nHe is waiting for you. Have a great trip!`, email_subject: 'Your driver has arrived', email_body: (name, dep) => `Hello ${name},<br><br>Your Rosini Transfert driver has arrived at your pickup point:<br><br><strong>📍 ${dep}</strong><br><br>He is waiting for you. Have a great trip!` },
    de: { whatsapp: (name, dep) => `📍 *Rosini Transfert*\n\nHallo ${name}, Ihr Fahrer ist angekommen bei:\n📍 ${dep}\n\nEr wartet auf Sie. Gute Fahrt!`, email_subject: 'Ihr Fahrer ist angekommen', email_body: (name, dep) => `Hallo ${name},<br><br>Ihr Rosini Transfert Fahrer ist angekommen bei:<br><br><strong>📍 ${dep}</strong><br><br>Er wartet auf Sie. Gute Fahrt!` },
    it: { whatsapp: (name, dep) => `📍 *Rosini Transfert*\n\nSalve ${name}, il vostro autista e arrivato a:\n📍 ${dep}\n\nVi sta aspettando. Buon viaggio!`, email_subject: 'Il vostro autista è arrivato', email_body: (name, dep) => `Salve ${name},<br><br>Il vostro autista Rosini Transfert è arrivato a:<br><br><strong>📍 ${dep}</strong><br><br>Vi sta aspettando. Buon viaggio!` },
    es: { whatsapp: (name, dep) => `📍 *Rosini Transfert*\n\nHola ${name}, su conductor ha llegado a:\n📍 ${dep}\n\nLe esta esperando. ¡Buen viaje!`, email_subject: 'Su conductor ha llegado', email_body: (name, dep) => `Hola ${name},<br><br>Su conductor Rosini Transfert ha llegado a:<br><br><strong>📍 ${dep}</strong><br><br>Le está esperando. ¡Buen viaje!` },
    nl: { whatsapp: (name, dep) => `📍 *Rosini Transfert*\n\nHallo ${name}, uw chauffeur is aangekomen bij:\n📍 ${dep}\n\nHij wacht op u. Goede reis!`, email_subject: 'Uw chauffeur is aangekomen', email_body: (name, dep) => `Hallo ${name},<br><br>Uw Rosini Transfert chauffeur is aangekomen bij:<br><br><strong>📍 ${dep}</strong><br><br>Hij wacht op u. Goede reis!` },
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { booking_id, status, client_name, client_phone, client_email, departure_point, language } = body;

    if (!booking_id || !status) {
      return Response.json({ error: 'Missing booking_id or status' }, { status: 400 });
    }

    if (!messages[status]) {
      console.log(`Status "${status}" — no WhatsApp configured, skipping.`);
      return Response.json({ success: true, skipped: true });
    }

    // Helper: Send WhatsApp Template
    async function sendWhatsAppTemplate(to, templateSid, variables) {
      const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

      const params = new URLSearchParams({
        From: TWILIO_FROM,
        To: toFormatted,
        ContentSid: templateSid,
      });

      if (variables && variables.length > 0) {
        params.append('ContentVariables', JSON.stringify(variables));
      }

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(`Twilio error: ${result.message || JSON.stringify(result)}`);
      }
      return result;
    }

    // Use booking data passed directly OR fetch from DB
    let phone = client_phone;
    let name = client_name;
    let email = client_email;
    let dep = departure_point;
    let lang = language;

    if (!phone || !name || !dep || !email) {
      // Fetch from DB
      console.log('Fetching booking from DB...');
      const allBookings = await base44.asServiceRole.entities.Booking.list('-created_date', 200);
      const booking = allBookings.find(b => b.id === booking_id);
      if (!booking) {
        return Response.json({ error: 'Booking not found' }, { status: 404 });
      }
      phone = phone || booking.client_phone;
      name = name || booking.client_name;
      email = email || booking.client_email;
      dep = dep || booking.departure_point;
      lang = lang || booking.language;
    }

    const results = { whatsapp: null, email: null };

    // Check if using template
    if (messages[status].use_template) {
      console.log(`Sending template notification | status=${status} | phone=${phone}`);
      
      // Send WhatsApp Template
      if (phone) {
        try {
          const digits = phone.replace(/\D/g, '');
          const formattedTo = `+${digits}`;
          const variables = [name || 'Client', dep || ''];
          
          const templateResult = await sendWhatsAppTemplate(formattedTo, messages[status].template_sid, variables);
          results.whatsapp = templateResult.sid;
          console.log(`WhatsApp template sent OK. SID: ${templateResult.sid}`);
        } catch (err) {
          console.error('WhatsApp template send error:', err.message);
          results.whatsapp_error = err.message;
        }
      }
    } else {
      // Regular message flow
      lang = (lang && messages[status][lang]) ? lang : 'fr';
      const msgBody = messages[status][lang].whatsapp(name || 'Client', dep || '');
      const emailSubject = messages[status][lang].email_subject;
      const emailBody = messages[status][lang].email_body(name || 'Client', dep || '');

      console.log(`Sending notifications | status=${status} | lang=${lang} | phone=${phone}`);

      // Send WhatsApp
      if (phone) {
        try {
          const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
          const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
          const from = Deno.env.get('TWILIO_WHATSAPP_FROM');

          if (accountSid && authToken && from) {
            const digits = phone.replace(/\D/g, '');
            const formattedTo = `whatsapp:+${digits}`;
            const formattedFrom = from.startsWith('whatsapp:') ? from : `whatsapp:${from}`;
            console.log(`Formatted phone: ${formattedTo} | From: ${formattedFrom}`);

            const twilioRes = await fetch(
              `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
              {
                method: 'POST',
                headers: {
                  'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ From: formattedFrom, To: formattedTo, Body: msgBody }).toString(),
              }
            );

            const twilioData = await twilioRes.json();
            if (twilioRes.ok) {
              results.whatsapp = twilioData.sid;
              console.log(`WhatsApp sent OK. SID: ${twilioData.sid}`);
            } else {
              const errMsg = twilioData?.message || JSON.stringify(twilioData);
              console.error(`Twilio error ${twilioRes.status}: ${errMsg}`);
              results.whatsapp_error = `${twilioRes.status}: ${errMsg}`;
            }
          } else {
            console.warn('Twilio not configured');
          }
        } catch (err) {
          console.error('WhatsApp send error:', err.message);
        }
      }

      // Send Email via Gmail (authorized connector)
      if (email) {
      try {
        console.log(`Attempting to send email via Gmail to ${email}`);
        const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
        
        const plainTextBody = emailBody.replace(/<br>/g, '\n').replace(/<[^>]*>/g, '');
        const emailMessage = [
          `From: Rosini Transferts <taxirosini@gmail.com>`,
          `To: ${email}`,
          `Subject: Rosini Transfert - ${emailSubject}`,
          `Content-Type: text/plain; charset="UTF-8"`,
          'Content-Transfer-Encoding: base64',
          '',
          plainTextBody
        ].join('\r\n');
        
        // Use TextEncoder for proper UTF-8 encoding
        const encoder = new TextEncoder();
        const encoded = encoder.encode(emailMessage);
        const binaryString = String.fromCharCode(...encoded);
        const encodedMessage = btoa(binaryString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        
        const gmailRes = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            raw: encodedMessage
          })
        });
        
        if (gmailRes.ok) {
          results.email = 'sent';
          console.log('Email sent successfully via Gmail to', email);
        } else {
          const gmailError = await gmailRes.json();
          console.error('Gmail error:', JSON.stringify(gmailError));
          results.email = 'failed';
        }
      } catch (err) {
        console.error('Email send error:', err.message);
        results.email = `error: ${err.message}`;
      }
    } else {
      console.warn('No client email to send notification');
    }
    }
    }

    return Response.json({ success: true, results });

  } catch (error) {
    console.error('notifyRideStatusUpdate error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});