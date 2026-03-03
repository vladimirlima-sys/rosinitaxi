import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const statusMessages = {
  en_route: {
    fr: (name, driver, dep) => `🚗 *Rosini Transfert* — Bonjour ${name} !\n\nVotre chauffeur *${driver}* est en route vers votre point de départ :\n📍 ${dep}\n\nIl arrive bientôt. Tenez-vous prêt(e) ! 🙏`,
    pt: (name, driver, dep) => `🚗 *Rosini Transfert* — Olá ${name} !\n\nO seu motorista *${driver}* está a caminho do seu ponto de partida :\n📍 ${dep}\n\nChegará em breve. Prepare-se ! 🙏`,
    en: (name, driver, dep) => `🚗 *Rosini Transfert* — Hello ${name} !\n\nYour driver *${driver}* is on the way to your pickup point:\n📍 ${dep}\n\nThey'll be there soon. Please get ready! 🙏`,
    de: (name, driver, dep) => `🚗 *Rosini Transfert* — Hallo ${name} !\n\nIhr Fahrer *${driver}* ist auf dem Weg zu Ihrem Abholpunkt:\n📍 ${dep}\n\nEr kommt bald. Bitte machen Sie sich bereit! 🙏`,
    it: (name, driver, dep) => `🚗 *Rosini Transfert* — Ciao ${name} !\n\nIl vostro autista *${driver}* è in arrivo al vostro punto di partenza:\n📍 ${dep}\n\nSarà lì presto. Preparatevi! 🙏`,
    es: (name, driver, dep) => `🚗 *Rosini Transfert* — ¡Hola ${name} !\n\nSu conductor *${driver}* está en camino hacia su punto de recogida:\n📍 ${dep}\n\n¡Llegará pronto. Por favor, prepárese! 🙏`,
    nl: (name, driver, dep) => `🚗 *Rosini Transfert* — Hallo ${name} !\n\nUw chauffeur *${driver}* is onderweg naar uw ophaallocatie:\n📍 ${dep}\n\nHij is er snel. Maak u klaar! 🙏`,
  },
  arrived: {
    fr: (name, driver, dep) => `📍 *Rosini Transfert* — Bonjour ${name} !\n\nVotre chauffeur *${driver}* est arrivé à votre point de départ et vous attend :\n📍 ${dep}\n\nMerci de le rejoindre dès que possible 🙌`,
    pt: (name, driver, dep) => `📍 *Rosini Transfert* — Olá ${name} !\n\nO seu motorista *${driver}* chegou ao seu ponto de partida e está à sua espera :\n📍 ${dep}\n\nPor favor, dirija-se até ele o mais rapidamente possível 🙌`,
    en: (name, driver, dep) => `📍 *Rosini Transfert* — Hello ${name} !\n\nYour driver *${driver}* has arrived at the pickup point and is waiting for you:\n📍 ${dep}\n\nPlease come out as soon as possible 🙌`,
    de: (name, driver, dep) => `📍 *Rosini Transfert* — Hallo ${name} !\n\nIhr Fahrer *${driver}* ist an Ihrem Abholpunkt angekommen und wartet auf Sie:\n📍 ${dep}\n\nBitte kommen Sie so schnell wie möglich 🙌`,
    it: (name, driver, dep) => `📍 *Rosini Transfert* — Ciao ${name} !\n\nIl vostro autista *${driver}* è arrivato al punto di partenza e vi aspetta:\n📍 ${dep}\n\nVi preghiamo di raggiungerlo il prima possibile 🙌`,
    es: (name, driver, dep) => `📍 *Rosini Transfert* — ¡Hola ${name} !\n\nSu conductor *${driver}* ha llegado al punto de recogida y le está esperando:\n📍 ${dep}\n\n¡Por favor, salga lo antes posible! 🙌`,
    nl: (name, driver, dep) => `📍 *Rosini Transfert* — Hallo ${name} !\n\nUw chauffeur *${driver}* is aangekomen op de ophaallocatie en wacht op u:\n📍 ${dep}\n\nKom zo snel mogelijk naar buiten 🙌`,
  },
  in_progress: {
    fr: (name, driver, dep, arr) => `⚡ *Rosini Transfert* — Bon voyage ${name} !\n\n🚗 Votre trajet est en cours avec *${driver}*.\n📍 De : ${dep}\n🏁 Vers : ${arr}\n\nNous vous souhaitons une excellente route ! 🌟`,
    pt: (name, driver, dep, arr) => `⚡ *Rosini Transfert* — Boa viagem ${name} !\n\n🚗 O seu trajeto está em curso com *${driver}*.\n📍 De : ${dep}\n🏁 Para : ${arr}\n\nDesejamos-lhe uma excelente viagem ! 🌟`,
    en: (name, driver, dep, arr) => `⚡ *Rosini Transfert* — Have a great trip, ${name}!\n\n🚗 Your ride is in progress with *${driver}*.\n📍 From: ${dep}\n🏁 To: ${arr}\n\nWe wish you a wonderful journey! 🌟`,
    de: (name, driver, dep, arr) => `⚡ *Rosini Transfert* — Gute Fahrt, ${name}!\n\n🚗 Ihre Fahrt ist mit *${driver}* im Gange.\n📍 Von: ${dep}\n🏁 Nach: ${arr}\n\nWir wünschen Ihnen eine wundervolle Reise! 🌟`,
    it: (name, driver, dep, arr) => `⚡ *Rosini Transfert* — Buon viaggio, ${name}!\n\n🚗 Il vostro viaggio è in corso con *${driver}*.\n📍 Da: ${dep}\n🏁 A: ${arr}\n\nVi auguriamo un ottimo viaggio! 🌟`,
    es: (name, driver, dep, arr) => `⚡ *Rosini Transfert* — ¡Buen viaje, ${name}!\n\n🚗 Tu viaje está en curso con *${driver}*.\n📍 Desde: ${dep}\n🏁 Hasta: ${arr}\n\n¡Te deseamos un viaje maravilloso! 🌟`,
    nl: (name, driver, dep, arr) => `⚡ *Rosini Transfert* — Goede reis, ${name}!\n\n🚗 Uw rit is bezig met *${driver}*.\n📍 Van: ${dep}\n🏁 Naar: ${arr}\n\nWij wensen u een prachtige reis! 🌟`,
  },
  completed: {
    fr: (name, driver, arr) => `✅ *Rosini Transfert* — Merci ${name} !\n\nVotre trajet avec *${driver}* est terminé.\n🏁 Destination : ${arr}\n\nNous espérons que vous avez apprécié le voyage. À bientôt ! 🙏\n\n⭐ Laissez un avis : https://g.page/r/...`,
    pt: (name, driver, arr) => `✅ *Rosini Transfert* — Obrigado ${name} !\n\nO seu trajeto com *${driver}* terminou.\n🏁 Destino : ${arr}\n\nEsperamos que tenha apreciado a viagem. Até breve ! 🙏`,
    en: (name, driver, arr) => `✅ *Rosini Transfert* — Thank you, ${name}!\n\nYour ride with *${driver}* is complete.\n🏁 Destination: ${arr}\n\nWe hope you enjoyed the journey. See you soon! 🙏`,
    de: (name, driver, arr) => `✅ *Rosini Transfert* — Danke, ${name}!\n\nIhre Fahrt mit *${driver}* ist beendet.\n🏁 Ziel: ${arr}\n\nWir hoffen, Sie hatten eine angenehme Fahrt. Bis bald! 🙏`,
    it: (name, driver, arr) => `✅ *Rosini Transfert* — Grazie, ${name}!\n\nIl vostro viaggio con *${driver}* è terminato.\n🏁 Destinazione: ${arr}\n\nSperiamo che abbiate apprezzato il viaggio. A presto! 🙏`,
    es: (name, driver, arr) => `✅ *Rosini Transfert* — ¡Gracias, ${name}!\n\nTu viaje con *${driver}* ha terminado.\n🏁 Destino: ${arr}\n\n¡Esperamos que hayas disfrutado del viaje. ¡Hasta pronto! 🙏`,
    nl: (name, driver, arr) => `✅ *Rosini Transfert* — Dank u, ${name}!\n\nUw rit met *${driver}* is voltooid.\n🏁 Bestemming: ${arr}\n\nWe hopen dat u genoten heeft van de reis. Tot ziens! 🙏`,
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { booking_id, status } = await req.json();

    if (!booking_id || !status) {
      return Response.json({ error: 'Missing booking_id or status' }, { status: 400 });
    }

    const booking = await base44.asServiceRole.entities.Booking.get(booking_id);
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    const { client_phone, client_name, language = 'fr', departure_point, arrival_point, driver_name, driver_id } = booking;
    const lang = language || 'fr';
    const driverName = driver_name || 'Rosini';

    const msgFn = statusMessages[status]?.[lang] || statusMessages[status]?.['fr'];
    if (!msgFn) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Build message based on status
    let message;
    if (status === 'en_route') {
      message = msgFn(client_name, driverName, departure_point);
    } else if (status === 'arrived') {
      message = msgFn(client_name, driverName, departure_point);
    } else if (status === 'in_progress') {
      message = msgFn(client_name, driverName, departure_point, arrival_point);
    } else if (status === 'completed') {
      message = msgFn(client_name, driverName, arrival_point);
    }

    console.log(`[notifyRideStatusUpdate] Status: ${status}, lang: ${lang}, client: ${client_name}, phone: ${client_phone}`);

    // Send WhatsApp via Twilio
    if (client_phone) {
      try {
        const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
        const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
        const from = Deno.env.get('TWILIO_WHATSAPP_FROM');

        const digitsOnly = client_phone.replace(/\D/g, '');
        const formattedTo = `whatsapp:+${digitsOnly}`;

        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ From: from, To: formattedTo, Body: message }).toString(),
        });

        const result = await res.json();
        if (res.ok) {
          console.log(`WhatsApp sent to ${formattedTo}: ${result.sid}`);
        } else {
          console.error('Twilio error:', result.message || JSON.stringify(result));
        }
      } catch (err) {
        console.error('WhatsApp send failed:', err.message);
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in notifyRideStatusUpdate:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});