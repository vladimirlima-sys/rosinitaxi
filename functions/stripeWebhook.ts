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
    const clientPhone = meta.client_phone || '';
    const departure = meta.departure || "";
    const arrival = meta.arrival || "";
    const departureDate = meta.departure_date || "";
    const departureTime = meta.departure_time || "";
    const vehicleType = meta.vehicle_type || 'economic';
    const distanceKm = meta.distance_km || "0";
    const amount = (session.amount_total / 100).toFixed(2);
    const isShortNotice = meta.is_short_notice === 'true';
    const language = meta.language || 'fr';
    const bookingId = meta.booking_id || null;
    const flightNumber = meta.flight_number || '';
    const passengers = meta.passengers || 1;
    const notes = meta.notes || '';

    const base44 = createClientFromRequest(req);

    // ── Update booking status ────────────────────────────────────────────────
    let booking = null;
    try {
      if (bookingId) {
        const found = await base44.asServiceRole.entities.Booking.filter({ id: bookingId });
        booking = found?.[0] || null;
      }
      if (!booking) {
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
        console.log("Booking marked as paid:", booking.id);
      }
    } catch (err) {
      console.error("Failed to update booking status:", err.message);
    }

    // ── Send emails via sendBookingConfirmation (handles translations + PDF) ─
    try {
      await base44.asServiceRole.functions.invoke('sendBookingConfirmation', {
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        departure_point: departure,
        arrival_point: arrival,
        departure_date: departureDate,
        departure_time: departureTime,
        flight_number: flightNumber,
        vehicle_type: vehicleType,
        distance_km: parseFloat(distanceKm),
        total_price: parseFloat(amount),
        passengers: parseInt(passengers),
        notes: notes,
        payment_method: 'stripe',
        language: language,
        skip_client_email: isShortNotice,
        booking_id: booking?.id || bookingId,
      });
      console.log("Emails sent via sendBookingConfirmation for:", clientEmail, "| lang:", language);
    } catch (err) {
      console.error("Failed to send emails:", err.message);
    }

  }

  return Response.json({ received: true });
});