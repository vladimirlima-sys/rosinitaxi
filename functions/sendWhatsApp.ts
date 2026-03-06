import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM"); // e.g. whatsapp:+14155238886

async function sendWhatsAppMessage(to, body) {
  const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
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
        From: TWILIO_FROM,
        To: toFormatted,
        Body: body,
      }).toString(),
    }
  );

  const result = await response.json();
  if (!response.ok) {
    throw new Error(`Twilio error: ${result.message || JSON.stringify(result)}`);
  }
  return result;
}

async function sendWhatsAppTemplate(to, templateSid, templateVariables) {
  const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

  const params = new URLSearchParams({
    From: TWILIO_FROM,
    To: toFormatted,
    ContentSid: templateSid,
  });

  if (templateVariables && templateVariables.length > 0) {
    templateVariables.forEach((variable, index) => {
      params.append(`ContentVariables`, JSON.stringify(variable));
    });
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
      driver_name,
    } = booking;

    const vehicleLabel = vehicle_type === 'comfort' ? 'Comfort' : 'Standard';
    const results = [];

    // ── NEW BOOKING ──────────────────────────────────────────────
    if (type === 'new_booking') {
      // Notify driver (+41772492245 = company/admin number)
      const driverPhone = driver_phone || '+41772492245';
      const driverMsg =
        `🔔 *Nouvelle réservation — Rosini Transfert*\n\n` +
        `👤 Client: ${client_name}\n` +
        `📱 Tel: ${client_phone || '—'}\n` +
        `📍 De: ${departure_point}\n` +
        `📍 À: ${arrival_point}\n` +
        `📅 Le: ${departure_date} à ${departure_time}\n` +
        `🚗 Véhicule: ${vehicleLabel}\n` +
        `💶 Total: CHF ${total_price}`;

      try {
        await sendWhatsAppMessage(driverPhone, driverMsg);
        results.push({ to: driverPhone, status: 'sent' });
        console.log('WhatsApp sent to driver:', driverPhone);
      } catch (err) {
        console.error('Error sending to driver:', err.message);
        results.push({ to: driverPhone, status: 'error', error: err.message });
      }

    // ── PAYMENT CONFIRMED ─────────────────────────────────────────
    } else if (type === 'payment_confirmed') {
      // Notify client
      if (client_phone) {
        const lang = booking.language || 'fr';
        const msgTemplates = {
          fr: (n, dep, arr, date, time, v, price) => `✅ *Réservation confirmée — Rosini Transfert*\n\nBonjour ${n}, votre paiement a bien été reçu.\n\n📍 ${dep} → ${arr}\n📅 ${date} à ${time}\n🚗 ${v}\n💶 CHF ${price}\n\nPour toute question: +41 77 249 22 45`,
          pt: (n, dep, arr, date, time, v, price) => `✅ *Reserva confirmada — Rosini Transfert*\n\nOlá ${n}, o seu pagamento foi recebido.\n\n📍 ${dep} → ${arr}\n📅 ${date} às ${time}\n🚗 ${v}\n💶 CHF ${price}\n\nQualquer dúvida: +41 77 249 22 45`,
          en: (n, dep, arr, date, time, v, price) => `✅ *Booking confirmed — Rosini Transfert*\n\nHello ${n}, your payment has been received.\n\n📍 ${dep} → ${arr}\n📅 ${date} at ${time}\n🚗 ${v}\n💶 CHF ${price}\n\nAny questions: +41 77 249 22 45`,
          de: (n, dep, arr, date, time, v, price) => `✅ *Buchung bestätigt — Rosini Transfert*\n\nHallo ${n}, Ihre Zahlung wurde erhalten.\n\n📍 ${dep} → ${arr}\n📅 ${date} um ${time}\n🚗 ${v}\n💶 CHF ${price}\n\nBei Fragen: +41 77 249 22 45`,
          it: (n, dep, arr, date, time, v, price) => `✅ *Prenotazione confermata — Rosini Transfert*\n\nSalve ${n}, il suo pagamento è stato ricevuto.\n\n📍 ${dep} → ${arr}\n📅 ${date} alle ${time}\n🚗 ${v}\n💶 CHF ${price}\n\nPer qualsiasi domanda: +41 77 249 22 45`,
          es: (n, dep, arr, date, time, v, price) => `✅ *Reserva confirmada — Rosini Transfert*\n\nHola ${n}, su pago ha sido recibido.\n\n📍 ${dep} → ${arr}\n📅 ${date} a las ${time}\n🚗 ${v}\n💶 CHF ${price}\n\nCualquier pregunta: +41 77 249 22 45`,
          nl: (n, dep, arr, date, time, v, price) => `✅ *Boeking bevestigd — Rosini Transfert*\n\nHallo ${n}, uw betaling is ontvangen.\n\n📍 ${dep} → ${arr}\n📅 ${date} om ${time}\n🚗 ${v}\n💶 CHF ${price}\n\nVragen: +41 77 249 22 45`,
        };
        const tpl = msgTemplates[lang] || msgTemplates['fr'];
        const clientMsg = tpl(client_name, departure_point, arrival_point, departure_date, departure_time, vehicleLabel, total_price);

        try {
          await sendWhatsAppMessage(client_phone, clientMsg);
          results.push({ to: client_phone, status: 'sent' });
          console.log('WhatsApp sent to client:', client_phone);
        } catch (err) {
          console.error('Error sending to client:', err.message);
          results.push({ to: client_phone, status: 'error', error: err.message });
        }
      }

      // Also notify admin/driver
      const adminMsg =
        `💳 *Paiement confirmé — Rosini Transfert*\n\n` +
        `👤 ${client_name}\n` +
        `📍 ${departure_point} → ${arrival_point}\n` +
        `📅 ${departure_date} à ${departure_time}\n` +
        `💶 CHF ${total_price} (Stripe)`;

      try {
        await sendWhatsAppMessage('+41772492245', adminMsg);
        results.push({ to: '+41772492245', status: 'sent' });
      } catch (err) {
        console.error('Error sending admin payment notification:', err.message);
      }

    // ── CANCELLED ─────────────────────────────────────────────────
    } else if (type === 'cancelled') {
      // Notify client
      if (client_phone) {
        const lang = booking.language || 'fr';
        const cancelTemplates = {
          fr: (n, dep, arr, date, time) => `❌ *Réservation annulée — Rosini Transfert*\n\nBonjour ${n}, votre réservation a été annulée.\n\n📍 ${dep} → ${arr}\n📅 ${date} à ${time}\n\nPour toute question: +41 77 249 22 45`,
          pt: (n, dep, arr, date, time) => `❌ *Reserva cancelada — Rosini Transfert*\n\nOlá ${n}, a sua reserva foi cancelada.\n\n📍 ${dep} → ${arr}\n📅 ${date} às ${time}\n\nQualquer dúvida: +41 77 249 22 45`,
          en: (n, dep, arr, date, time) => `❌ *Booking cancelled — Rosini Transfert*\n\nHello ${n}, your booking has been cancelled.\n\n📍 ${dep} → ${arr}\n📅 ${date} at ${time}\n\nAny questions: +41 77 249 22 45`,
          de: (n, dep, arr, date, time) => `❌ *Buchung storniert — Rosini Transfert*\n\nHallo ${n}, Ihre Buchung wurde storniert.\n\n📍 ${dep} → ${arr}\n📅 ${date} um ${time}\n\nBei Fragen: +41 77 249 22 45`,
          it: (n, dep, arr, date, time) => `❌ *Prenotazione annullata — Rosini Transfert*\n\nSalve ${n}, la sua prenotazione è stata annullata.\n\n📍 ${dep} → ${arr}\n📅 ${date} alle ${time}\n\nPer qualsiasi domanda: +41 77 249 22 45`,
          es: (n, dep, arr, date, time) => `❌ *Reserva cancelada — Rosini Transfert*\n\nHola ${n}, su reserva ha sido cancelada.\n\n📍 ${dep} → ${arr}\n📅 ${date} a las ${time}\n\nCualquier pregunta: +41 77 249 22 45`,
          nl: (n, dep, arr, date, time) => `❌ *Boeking geannuleerd — Rosini Transfert*\n\nHallo ${n}, uw boeking is geannuleerd.\n\n📍 ${dep} → ${arr}\n📅 ${date} om ${time}\n\nVragen: +41 77 249 22 45`,
        };
        const cancelTpl = cancelTemplates[lang] || cancelTemplates['fr'];
        const cancelClientMsg = cancelTpl(client_name, departure_point, arrival_point, departure_date, departure_time);

        try {
          await sendWhatsAppMessage(client_phone, cancelClientMsg);
          results.push({ to: client_phone, status: 'sent' });
        } catch (err) {
          console.error('Error sending cancellation to client:', err.message);
          results.push({ to: client_phone, status: 'error', error: err.message });
        }
      }

      // Notify admin
      const cancelAdminMsg =
        `❌ *Réservation annulée — Rosini Transfert*\n\n` +
        `👤 ${client_name}\n` +
        `📍 ${departure_point} → ${arrival_point}\n` +
        `📅 ${departure_date} à ${departure_time}`;

      try {
        await sendWhatsAppMessage('+41772492245', cancelAdminMsg);
        results.push({ to: '+41772492245', status: 'sent' });
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