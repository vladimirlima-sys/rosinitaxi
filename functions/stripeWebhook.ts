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
    const vehicleType = meta.vehicle_type === "comfort" ? "Confort" : "Économique";
    const distanceKm = meta.distance_km || "";
    const amount = (session.amount_total / 100).toFixed(2);

    // Email to client
    if (clientEmail) {
      try {
        const base44 = createClientFromRequest(req);
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: clientEmail,
          subject: "✅ Confirmation de votre réservation — Rosini Transfert",
          body: `Bonjour ${clientName},\n\nVotre réservation est confirmée !\n\n📍 Trajet : ${departure} → ${arrival}\n📅 Date : ${departureDate} à ${departureTime}\n🚗 Véhicule : ${vehicleType}\n📏 Distance : ${distanceKm} km\n💰 Montant payé : CHF ${amount}\n\nNous vous attendrons à l'heure convenue. En cas de questions, contactez-nous à taxirosini@gmail.com.\n\nMerci de votre confiance,\nL'équipe Rosini Transfert`,
        });
        console.log("Confirmation email sent to client:", clientEmail);
      } catch (err) {
        console.error("Failed to send client email:", err.message);
      }
    }

    // Notification email to taxirosini@gmail.com
    try {
      const base44 = createClientFromRequest(req);
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: "taxirosini@gmail.com",
        subject: `🚖 Nouvelle réservation — ${clientName}`,
        body: `Nouvelle réservation reçue !\n\n👤 Client : ${clientName}\n📧 Email : ${clientEmail}\n📍 Trajet : ${departure} → ${arrival}\n📅 Date : ${departureDate} à ${departureTime}\n🚗 Véhicule : ${vehicleType}\n📏 Distance : ${distanceKm} km\n💰 Montant : CHF ${amount}\n\nConnectez-vous au tableau de bord pour voir tous les détails.`,
      });
      console.log("Notification email sent to taxirosini@gmail.com");
    } catch (err) {
      console.error("Failed to send notification email:", err.message);
    }

    // Update booking payment status
    try {
      const base44 = createClientFromRequest(req);
      const bookings = await base44.asServiceRole.entities.Booking.filter({ client_email: clientEmail, payment_status: "pending" });
      if (bookings.length > 0) {
        await base44.asServiceRole.entities.Booking.update(bookings[0].id, { payment_status: "paid" });
        console.log("Booking marked as paid:", bookings[0].id);
      }
    } catch (err) {
      console.error("Failed to update booking status:", err.message);
    }
  }

  return Response.json({ received: true });
});