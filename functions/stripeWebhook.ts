import Stripe from 'npm:stripe@14.21.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, Deno.env.get("STRIPE_WEBHOOK_SECRET"));
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const meta = session.metadata || {};

    const clientName = meta.client_name || "Client";
    const clientEmail = session.customer_email || meta.client_email;
    const departure = meta.departure || "";
    const arrival = meta.arrival || "";
    const departureDate = meta.departure_date || "";
    const departureTime = meta.departure_time || "";
    const vehicleType = meta.vehicle_type === "comfort" ? "Confort" : "Standard";
    const distanceKm = meta.distance_km || "";
    const amount = (session.amount_total / 100).toFixed(2);
    const isShortNotice = meta.is_short_notice === 'true';
    const clientPhone = meta.client_phone || '';
    const year = new Date().getFullYear();

    // Build WhatsApp click-to-chat link if phone number is available
    const cleanPhone = clientPhone.replace(/\D/g, '');
    const whatsappLink = cleanPhone
      ? `https://wa.me/${cleanPhone}`
      : null;

    const clientHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="color:#C9A96E;font-size:28px;font-weight:300;letter-spacing:4px;margin:0;">ROSINI</h1>
    <p style="color:#C9A96E;font-size:11px;letter-spacing:3px;margin:4px 0 0;">TRANSFERT</p>
  </div>
  <div style="background:#111;border:1px solid #222;border-radius:12px;padding:32px;margin-bottom:24px;">
    <h2 style="color:#fff;font-size:20px;font-weight:300;margin:0 0 8px;">✅ Réservation confirmée</h2>
    <p style="color:#888;margin:0 0 24px;">Merci ${clientName}, votre transfer est confirmé.</p>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:6px 0;color:#888;">Trajet</td><td style="padding:6px 0;color:#fff;">${departure} → ${arrival}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Date</td><td style="padding:6px 0;color:#fff;">${departureDate} à ${departureTime}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Véhicule</td><td style="padding:6px 0;color:#fff;">${vehicleType}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Distance</td><td style="padding:6px 0;color:#fff;">${distanceKm} km</td></tr>
      <tr><td colspan="2" style="padding:12px 0;"><hr style="border:none;border-top:1px solid #333;margin:0;"></td></tr>
      <tr><td style="padding:6px 0;color:#888;font-weight:bold;">Total payé</td><td style="padding:6px 0;color:#C9A96E;font-size:18px;font-weight:bold;">CHF ${amount}</td></tr>
    </table>
  </div>
  <div style="text-align:center;padding:24px;background:#111;border:1px solid #222;border-radius:12px;">
    <p style="color:#888;margin:0 0 4px;font-size:13px;">Des questions ? Contactez-nous</p>
    <a href="mailto:info@rosini.online" style="color:#C9A96E;text-decoration:none;">info@rosini.online</a>
  </div>
  <p style="color:#444;text-align:center;font-size:11px;margin-top:24px;">© ${year} Rosini Transfert. Tous droits réservés.</p>
</div></body></html>`;

    const adminHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="color:#C9A96E;font-size:28px;font-weight:300;letter-spacing:4px;margin:0;">ROSINI</h1>
    <p style="color:#C9A96E;font-size:11px;letter-spacing:3px;margin:4px 0 0;">TRANSFERT</p>
  </div>
  <div style="background:#111;border:1px solid #C9A96E33;border-radius:12px;padding:32px;">
    <h2 style="color:#C9A96E;font-size:20px;font-weight:300;margin:0 0 8px;">🔔 Nouvelle réservation (Stripe)</h2>
    <p style="color:#888;margin:0 0 24px;">Paiement confirmé via Stripe.</p>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:6px 0;color:#888;">Client</td><td style="padding:6px 0;color:#fff;">${clientName}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Email</td><td style="padding:6px 0;color:#fff;">${clientEmail}</td></tr>
      ${clientPhone ? `<tr><td style="padding:6px 0;color:#888;">Téléphone</td><td style="padding:6px 0;color:#fff;">${clientPhone}</td></tr>` : ''}
      ${whatsappLink ? `<tr><td style="padding:6px 0;color:#888;">WhatsApp</td><td style="padding:6px 0;"><a href="${whatsappLink}" style="display:inline-block;background:#25D366;color:#fff;font-weight:bold;padding:6px 16px;border-radius:6px;text-decoration:none;font-size:13px;">💬 Contacter sur WhatsApp</a></td></tr>` : ''}
      <tr><td colspan="2" style="padding:12px 0;"><hr style="border:none;border-top:1px solid #333;margin:0;"></td></tr>
      <tr><td style="padding:6px 0;color:#888;">Trajet</td><td style="padding:6px 0;color:#fff;">${departure} → ${arrival}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Date</td><td style="padding:6px 0;color:#fff;">${departureDate} à ${departureTime}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Véhicule</td><td style="padding:6px 0;color:#fff;">${vehicleType}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Distance</td><td style="padding:6px 0;color:#fff;">${distanceKm} km</td></tr>
      <tr><td colspan="2" style="padding:12px 0;"><hr style="border:none;border-top:1px solid #333;margin:0;"></td></tr>
      <tr><td style="padding:6px 0;color:#888;font-weight:bold;">Montant encaissé</td><td style="padding:6px 0;color:#C9A96E;font-size:18px;font-weight:bold;">CHF ${amount}</td></tr>
    </table>
  </div>
  <p style="color:#444;text-align:center;font-size:11px;margin-top:24px;">© ${year} Rosini Transfert — Notification automatique</p>
</div></body></html>`;

    const base44 = createClientFromRequest(req);

    try {
      if (clientEmail && !isShortNotice) {
        await base44.integrations.Core.SendEmail({
          to: clientEmail,
          subject: `✅ Réservation confirmée — ${departure} → ${arrival}`,
          body: clientHtml,
          from_name: 'Rosini Transfert'
        });
        console.log("Confirmation email sent to client:", clientEmail);
      } else if (isShortNotice) {
        console.log("Short notice booking — skipping client confirmation email for:", clientEmail);
      }

      await base44.integrations.Core.SendEmail({
        to: 'info@rosini.online',
        subject: `🔔 Nouvelle réservation Stripe — ${clientName} | ${departure} → ${arrival} | CHF ${amount}`,
        body: adminHtml,
        from_name: 'Rosini Transfert'
      });
      console.log("Admin notification sent");
    } catch (err) {
      console.error("Failed to send emails:", err.message);
    }

    // Update booking payment status
    try {
      // Use booking_id from metadata if available (most precise), otherwise fallback to email+date match
      let booking = null;
      const bookingId = meta.booking_id;
      if (bookingId) {
        const found = await base44.asServiceRole.entities.Booking.filter({ id: bookingId });
        booking = found?.[0] || null;
      }
      if (!booking) {
        // Fallback: match by email + departure_date + departure_time to avoid updating wrong booking
        const pendingBookings = await base44.asServiceRole.entities.Booking.filter({ client_email: clientEmail, payment_status: "pending" });
        if (departureDate) {
          booking = pendingBookings.find(b => b.departure_date === departureDate && b.departure_time === departureTime) || pendingBookings[0] || null;
        } else {
          booking = pendingBookings[0] || null;
        }
      }
      if (booking) {
        await base44.asServiceRole.entities.Booking.update(booking.id, {
          payment_status: "paid",
          confirmation_sent: true,
          stripe_payment_intent_id: session.payment_intent || null
        });
        console.log("Booking marked as paid:", booking.id, "| email:", clientEmail);

        // Send WhatsApp notification for payment confirmed
        try {
          await base44.asServiceRole.functions.invoke('sendWhatsApp', {
            type: 'payment_confirmed',
            booking: {
              client_name: clientName,
              client_phone: booking.client_phone,
              departure_point: departure,
              arrival_point: arrival,
              departure_date: departureDate,
              departure_time: departureTime,
              vehicle_type: meta.vehicle_type || 'economic',
              total_price: amount,
            }
          });
          console.log("WhatsApp payment_confirmed sent");
        } catch (waErr) {
          console.error("WhatsApp payment notification failed:", waErr.message);
        }
      }
    } catch (err) {
      console.error("Failed to update booking status:", err.message);
    }
  }

  return Response.json({ received: true });
});