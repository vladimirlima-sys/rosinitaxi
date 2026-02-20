import Stripe from 'npm:stripe@14.21.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { client_name, client_email, departure, arrival, vehicle_type, distance_km, departure_date, departure_time } = session.metadata || {};
    const amount = (session.amount_total / 100).toFixed(2);
    const vehicleLabel = vehicle_type === 'economic' ? 'Économique' : 'Confort';

    const base44 = createClientFromRequest(req);

    // Email to client
    if (client_email) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: client_email,
        subject: `✅ Confirmation de votre réservation — Rosini Transfert`,
        body: `
Bonjour ${client_name},

Votre réservation est confirmée et le paiement a bien été reçu.

━━━━━━━━━━━━━━━━━━━━━━━━
DÉTAILS DE VOTRE TRAJET
━━━━━━━━━━━━━━━━━━━━━━━━
🚗 Véhicule     : ${vehicleLabel}
📍 Départ       : ${departure}
🏁 Arrivée      : ${arrival}
📅 Date         : ${departure_date} à ${departure_time}
📏 Distance     : ${distance_km} km
💳 Total payé   : CHF ${amount}
━━━━━━━━━━━━━━━━━━━━━━━━

Notre chauffeur vous contactera avant le départ pour confirmer les détails.

Pour toute question : taxirosini@gmail.com | +41 79 650 53 47

Merci de votre confiance,
Rosini Transfert
        `.trim(),
      });
    }

    // Notification email to Rosini
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'taxirosini@gmail.com',
      subject: `🚗 Nouvelle réservation — ${client_name} | ${departure} → ${arrival}`,
      body: `
Nouvelle réservation confirmée et payée.

━━━━━━━━━━━━━━━━━━━━━━━━
DÉTAILS DE LA RÉSERVATION
━━━━━━━━━━━━━━━━━━━━━━━━
👤 Client       : ${client_name}
📧 Email        : ${client_email}
🚗 Véhicule     : ${vehicleLabel}
📍 Départ       : ${departure}
🏁 Arrivée      : ${arrival}
📅 Date         : ${departure_date} à ${departure_time}
📏 Distance     : ${distance_km} km
💳 Montant      : CHF ${amount}
━━━━━━━━━━━━━━━━━━━━━━━━
      `.trim(),
    });

    console.log(`Emails sent for booking: ${client_name} — ${departure} → ${arrival}`);
  }

  return Response.json({ received: true });
});