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
        const clientMsg =
          `✅ *Réservation confirmée — Rosini Transfert*\n\n` +
          `Bonjour ${client_name}, votre paiement a bien été reçu.\n\n` +
          `📍 ${departure_point} → ${arrival_point}\n` +
          `📅 ${departure_date} à ${departure_time}\n` +
          `🚗 ${vehicleLabel}\n` +
          `💶 CHF ${total_price}\n\n` +
          `Pour toute question: +41 77 249 22 45`;

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
        const cancelClientMsg =
          `❌ *Réservation annulée — Rosini Transfert*\n\n` +
          `Bonjour ${client_name}, votre réservation a été annulée.\n\n` +
          `📍 ${departure_point} → ${arrival_point}\n` +
          `📅 ${departure_date} à ${departure_time}\n\n` +
          `Pour toute question: +41 77 249 22 45`;

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