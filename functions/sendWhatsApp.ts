import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM"); // e.g. whatsapp:+14155238886

// Extrai o número de telefone puro do TWILIO_WHATSAPP_FROM (remove prefixo "whatsapp:")
const TWILIO_SMS_FROM = TWILIO_WHATSAPP_FROM
  ? TWILIO_WHATSAPP_FROM.replace('whatsapp:', '')
  : null;

// WhatsApp (para admin/empresa)
async function sendWhatsAppMessage(to, body) {
  const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const fromFormatted = TWILIO_WHATSAPP_FROM.startsWith('whatsapp:')
    ? TWILIO_WHATSAPP_FROM
    : `whatsapp:${TWILIO_WHATSAPP_FROM}`;
  const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: fromFormatted,
        To: toFormatted,
        Body: body,
      }).toString(),
    }
  );

  const result = await response.json();
  if (!response.ok) {
    throw new Error(`Twilio WhatsApp error: ${result.message || JSON.stringify(result)}`);
  }
  return result;
}

// SMS (para clientes)
async function sendSmsMessage(to, body) {
  const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: TWILIO_SMS_FROM,
        To: to,
        Body: body,
      }).toString(),
    }
  );

  const result = await response.json();
  if (!response.ok) {
    throw new Error(`Twilio SMS error: ${result.message || JSON.stringify(result)}`);
  }
  return result;
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { type, booking } = body;

    if (!type || !booking) {
      return Response.json({ error: 'Missing type or booking' }, { status: 400 });
    }

    const {
      client_name,
      client_phone,
      departure_point,
      arrival_point,
      departure_date,
      departure_time,
      vehicle_type,
      total_price,
      driver_phone,
    } = booking;

    const vehicleLabel = vehicle_type === 'comfort' ? 'Comfort' : 'Standard';
    const lang = booking.language || 'fr';
    const results = [];

    // ── NEW BOOKING ──────────────────────────────────────────────
    if (type === 'new_booking') {
      const driverPhone = driver_phone || '+41772492245';
      const driverMsg =
        `Nouvelle reservation - Rosini Transfert\n\n` +
        `Client: ${client_name}\n` +
        `Tel: ${client_phone || '—'}\n` +
        `De: ${departure_point}\n` +
        `A: ${arrival_point}\n` +
        `Le: ${departure_date} a ${departure_time}\n` +
        `Vehicule: ${vehicleLabel}\n` +
        `Total: CHF ${total_price}`;

      try {
        await sendSmsMessage(driverPhone, driverMsg);
        results.push({ to: driverPhone, status: 'sent', channel: 'sms' });
        console.log('SMS sent to driver:', driverPhone);
      } catch (err) {
        console.error('Error sending to driver:', err.message);
        results.push({ to: driverPhone, status: 'error', error: err.message });
      }

    // ── PAYMENT CONFIRMED ─────────────────────────────────────────
    } else if (type === 'payment_confirmed') {
      // SMS para cliente (todos os idiomas)
      if (client_phone) {
        const msgTemplates = {
          fr: (n, dep, arr, date, time, v, price) =>
`✅ ROSINI TRANSFERT
━━━━━━━━━━━━━━━━━━
Bonjour ${n},
votre reservation est confirmee !

🗺 Trajet
  📍 ${dep}
  🏁 ${arr}

📅 ${date}  🕐 ${time}
🚗 ${v}
💶 CHF ${price}
━━━━━━━━━━━━━━━━━━
❓ +41 77 249 22 45`,

          pt: (n, dep, arr, date, time, v, price) =>
`✅ ROSINI TRANSFERT
━━━━━━━━━━━━━━━━━━
Ola ${n},
a sua reserva foi confirmada !

🗺 Trajeto
  📍 ${dep}
  🏁 ${arr}

📅 ${date}  🕐 ${time}
🚗 ${v}
💶 CHF ${price}
━━━━━━━━━━━━━━━━━━
❓ +41 77 249 22 45`,

          en: (n, dep, arr, date, time, v, price) =>
`✅ ROSINI TRANSFERT
━━━━━━━━━━━━━━━━━━
Hello ${n},
your booking is confirmed !

🗺 Journey
  📍 ${dep}
  🏁 ${arr}

📅 ${date}  🕐 ${time}
🚗 ${v}
💶 CHF ${price}
━━━━━━━━━━━━━━━━━━
❓ +41 77 249 22 45`,

          de: (n, dep, arr, date, time, v, price) =>
`✅ ROSINI TRANSFERT
━━━━━━━━━━━━━━━━━━
Hallo ${n},
Ihre Buchung ist bestatigt !

🗺 Fahrt
  📍 ${dep}
  🏁 ${arr}

📅 ${date}  🕐 ${time}
🚗 ${v}
💶 CHF ${price}
━━━━━━━━━━━━━━━━━━
❓ +41 77 249 22 45`,

          it: (n, dep, arr, date, time, v, price) =>
`✅ ROSINI TRANSFERT
━━━━━━━━━━━━━━━━━━
Salve ${n},
la sua prenotazione e confermata !

🗺 Percorso
  📍 ${dep}
  🏁 ${arr}

📅 ${date}  🕐 ${time}
🚗 ${v}
💶 CHF ${price}
━━━━━━━━━━━━━━━━━━
❓ +41 77 249 22 45`,

          es: (n, dep, arr, date, time, v, price) =>
`✅ ROSINI TRANSFERT
━━━━━━━━━━━━━━━━━━
Hola ${n},
su reserva esta confirmada !

🗺 Trayecto
  📍 ${dep}
  🏁 ${arr}

📅 ${date}  🕐 ${time}
🚗 ${v}
💶 CHF ${price}
━━━━━━━━━━━━━━━━━━
❓ +41 77 249 22 45`,

          nl: (n, dep, arr, date, time, v, price) =>
`✅ ROSINI TRANSFERT
━━━━━━━━━━━━━━━━━━
Hallo ${n},
uw boeking is bevestigd !

🗺 Rit
  📍 ${dep}
  🏁 ${arr}

📅 ${date}  🕐 ${time}
🚗 ${v}
💶 CHF ${price}
━━━━━━━━━━━━━━━━━━
❓ +41 77 249 22 45`,
        };
        const tpl = msgTemplates[lang] || msgTemplates['fr'];
        const clientMsg = tpl(client_name, departure_point, arrival_point, departure_date, departure_time, vehicleLabel, total_price);

        try {
          await sendSmsMessage(client_phone, clientMsg);
          results.push({ to: client_phone, status: 'sent', channel: 'sms' });
          console.log('SMS sent to client:', client_phone);
        } catch (err) {
          console.error('Error sending SMS to client:', err.message);
          results.push({ to: client_phone, status: 'error', error: err.message });
        }
      }

      // SMS para admin
      const adminMsg =
        `Paiement confirme - Rosini Transfert\n\n` +
        `${client_name}\n` +
        `${departure_point} -> ${arrival_point}\n` +
        `${departure_date} a ${departure_time}\n` +
        `CHF ${total_price} (Stripe)`;

      try {
        await sendSmsMessage('+41772492245', adminMsg);
        results.push({ to: '+41772492245', status: 'sent', channel: 'sms' });
      } catch (err) {
        console.error('Error sending admin payment notification:', err.message);
      }

    // ── CANCELLED ─────────────────────────────────────────────────
    } else if (type === 'cancelled') {
      // SMS para cliente
      if (client_phone) {
        const cancelTemplates = {
          fr: (n, dep, arr, date, time) => `Reservation annulee - Rosini Transfert\n\nBonjour ${n}, votre reservation a ete annulee.\n${dep} -> ${arr}\n${date} a ${time}\n\nQuestions: +41 77 249 22 45`,
          pt: (n, dep, arr, date, time) => `Reserva cancelada - Rosini Transfert\n\nOla ${n}, a sua reserva foi cancelada.\n${dep} -> ${arr}\n${date} as ${time}\n\nDuvidas: +41 77 249 22 45`,
          en: (n, dep, arr, date, time) => `Booking cancelled - Rosini Transfert\n\nHello ${n}, your booking has been cancelled.\n${dep} -> ${arr}\n${date} at ${time}\n\nQuestions: +41 77 249 22 45`,
          de: (n, dep, arr, date, time) => `Buchung storniert - Rosini Transfert\n\nHallo ${n}, Ihre Buchung wurde storniert.\n${dep} -> ${arr}\n${date} um ${time}\n\nFragen: +41 77 249 22 45`,
          it: (n, dep, arr, date, time) => `Prenotazione annullata - Rosini Transfert\n\nSalve ${n}, la sua prenotazione e stata annullata.\n${dep} -> ${arr}\n${date} alle ${time}\n\nDomande: +41 77 249 22 45`,
          es: (n, dep, arr, date, time) => `Reserva cancelada - Rosini Transfert\n\nHola ${n}, su reserva ha sido cancelada.\n${dep} -> ${arr}\n${date} a las ${time}\n\nPreguntas: +41 77 249 22 45`,
          nl: (n, dep, arr, date, time) => `Boeking geannuleerd - Rosini Transfert\n\nHallo ${n}, uw boeking is geannuleerd.\n${dep} -> ${arr}\n${date} om ${time}\n\nVragen: +41 77 249 22 45`,
        };
        const cancelTpl = cancelTemplates[lang] || cancelTemplates['fr'];
        const cancelClientMsg = cancelTpl(client_name, departure_point, arrival_point, departure_date, departure_time);

        try {
          await sendSmsMessage(client_phone, cancelClientMsg);
          results.push({ to: client_phone, status: 'sent', channel: 'sms' });
          console.log('SMS sent to client (cancellation):', client_phone);
        } catch (err) {
          console.error('Error sending cancellation SMS to client:', err.message);
          results.push({ to: client_phone, status: 'error', error: err.message });
        }
      }

      // SMS para admin
      const cancelAdminMsg =
        `Reservation annulee - Rosini Transfert\n\n` +
        `${client_name}\n` +
        `${departure_point} -> ${arrival_point}\n` +
        `${departure_date} a ${departure_time}`;

      try {
        await sendSmsMessage('+41772492245', cancelAdminMsg);
        results.push({ to: '+41772492245', status: 'sent', channel: 'sms' });
      } catch (err) {
        console.error('Error sending cancellation admin notification:', err.message);
      }

    } else {
      return Response.json({ error: `Unknown type: ${type}` }, { status: 400 });
    }

    return Response.json({ success: true, results });
  } catch (error) {
    console.error('sendWhatsApp error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});