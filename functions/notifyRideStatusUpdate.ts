import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

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

    lang = (lang && messages[status][lang]) ? lang : 'fr';
    const msgBody = messages[status][lang].whatsapp(name || 'Client', dep || '');
    const emailSubject = messages[status][lang].email_subject;
    const emailBody = messages[status][lang].email_body(name || 'Client', dep || '');

    console.log(`Sending notifications | status=${status} | lang=${lang} | phone=${phone}`);

    const results = { whatsapp: null, email: null };

    // Send WhatsApp
    if (phone) {
      try {
        const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
        const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
        const from = Deno.env.get('TWILIO_WHATSAPP_FROM');

        if (accountSid && authToken && from) {
          const digits = phone.replace(/\D/g, '');
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
          if (twilioRes.ok) {
            results.whatsapp = twilioData.sid;
            console.log(`WhatsApp sent OK. SID: ${twilioData.sid}`);
          } else {
            console.error(`Twilio error ${twilioRes.status}:`, JSON.stringify(twilioData));
          }
        } else {
          console.warn('Twilio not configured');
        }
      } catch (err) {
        console.error('WhatsApp send error:', err.message);
      }
    }

    // Send Email via Resend (alternative to Gmail)
    if (email) {
      try {
        console.log(`Attempting to send email to ${email}`);
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        
        if (resendApiKey) {
          const plainTextBody = emailBody.replace(/<br>/g, '\n').replace(/<[^>]*>/g, '');
          const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Rosini Transfert <noreply@rosini.ch>',
              to: email,
              subject: `Rosini Transfert - ${emailSubject}`,
              html: `<html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #F5C300;">Rosini Transfert</h2>
                  ${emailBody}
                  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                  <p style="color: #999; font-size: 12px;">© 2026 Rosini Transfert. Todos os direitos reservados.</p>
                </div>
              </body></html>`
            })
          });
          
          const resendData = await resendRes.json();
          if (resendRes.ok && resendData.id) {
            results.email = 'sent';
            console.log('Email sent successfully via Resend to', email);
          } else {
            console.error('Resend error:', JSON.stringify(resendData));
            results.email = 'failed';
          }
        } else {
          console.warn('Resend API key not configured');
        }
      } catch (err) {
        console.error('Email send error:', err.message);
        results.email = `error: ${err.message}`;
      }
    } else {
      console.warn('No client email to send notification');
    }

    return Response.json({ success: true, results });

  } catch (error) {
    console.error('notifyRideStatusUpdate error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});