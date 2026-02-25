import Stripe from 'npm:stripe@14.21.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

const base64Encode = (str) => {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const sendEmailViaGmail = async (accessToken, to, subject, htmlBody) => {
  const emailMessage =
    `From: Rosini Transfert <taxirosini@gmail.com>\r\n` +
    `To: ${to}\r\n` +
    `Subject: =?UTF-8?B?${base64Encode(subject)}?=\r\n` +
    `MIME-Version: 1.0\r\n` +
    `Content-Type: text/html; charset="UTF-8"\r\n` +
    `Content-Transfer-Encoding: base64\r\n\r\n` +
    base64Encode(htmlBody);

  const encodedMessage = base64Encode(emailMessage)
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: encodedMessage }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gmail send failed: ${error.error?.message}`);
  }
  return response.json();
};

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
    const year = new Date().getFullYear();

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
    <a href="mailto:taxirosini@gmail.com" style="color:#C9A96E;text-decoration:none;">taxirosini@gmail.com</a>
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
      const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');

      if (clientEmail) {
        await sendEmailViaGmail(accessToken, clientEmail, `✅ Réservation confirmée — ${departure} → ${arrival}`, clientHtml);
        console.log("Confirmation email sent to client:", clientEmail);
      }

      await sendEmailViaGmail(
        accessToken,
        'taxirosini@gmail.com',
        `🔔 Nouvelle réservation Stripe — ${clientName} | ${departure} → ${arrival} | CHF ${amount}`,
        adminHtml
      );
      console.log("Admin notification sent");
    } catch (err) {
      console.error("Failed to send emails via Gmail:", err.message);
    }

    // Update booking payment status
    try {
      const bookings = await base44.asServiceRole.entities.Booking.filter({ client_email: clientEmail, payment_status: "pending" });
      if (bookings.length > 0) {
        await base44.asServiceRole.entities.Booking.update(bookings[0].id, { payment_status: "paid", confirmation_sent: true });
        console.log("Booking marked as paid:", bookings[0].id);
      }
    } catch (err) {
      console.error("Failed to update booking status:", err.message);
    }
  }

  return Response.json({ received: true });
});