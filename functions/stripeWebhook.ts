import Stripe from 'npm:stripe@14.21.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

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

    const base44 = createClientFromRequest(req);

    // ── Handle price adjustment payment ──────────────────────────────────────
    if (meta.adjustment_type === 'price_increase') {
      const bookingId = meta.booking_id;
      const newPrice = parseFloat(meta.new_price);
      
      try {
        // Update booking with new price
        await base44.asServiceRole.entities.Booking.update(bookingId, {
          total_price: newPrice,
          stripe_payment_intent_id: session.payment_intent || null,
        });
        console.log(`Booking ${bookingId} updated with new price: CHF ${newPrice}`);
      } catch (err) {
        console.error(`Failed to update booking ${bookingId}:`, err.message);
      }

      return Response.json({ received: true });
    }

    // ── Original booking creation flow ───────────────────────────────────────
    const clientName = meta.client_name || "Client";
    const clientEmail = session.customer_email || meta.client_email;
    const clientPhone = meta.client_phone || '';
    const departure = meta.departure || "";
    const arrival = meta.arrival || "";
    const departureDate = meta.departure_date || "";
    const departureTime = meta.departure_time || "";
    const vehicleType = meta.vehicle_type || 'economic';
    const distanceKm = parseFloat(meta.distance_km || "0");
    const amount = (session.amount_total / 100).toFixed(2);
    const isShortNotice = meta.is_short_notice === 'true';
    const language = meta.language || 'fr';
    const flightNumber = meta.flight_number || '';
    const passengers = parseInt(meta.passengers || '1');
    const notes = meta.notes || '';
    const driverId = meta.driver_id || '';
    const driverName = meta.driver_name || '';
    const additionalStopsRaw = meta.additional_stops || '';
    const additionalStops = additionalStopsRaw ? additionalStopsRaw.split('||').filter(s => s) : [];

    // ── Create booking now that payment is confirmed ─────────────────────────
    let booking = null;
    try {
      const bookingData = {
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        departure_point: departure,
        arrival_point: arrival,
        departure_date: departureDate,
        departure_time: departureTime,
        flight_number: flightNumber,
        vehicle_type: vehicleType,
        distance_km: distanceKm,
        total_price: parseFloat(amount),
        passengers: passengers,
        notes: notes,
        additional_stops: additionalStops,
        payment_status: 'paid',
        payment_method: 'stripe',
        stripe_payment_intent_id: session.payment_intent || null,
        confirmation_sent: true,
        language: language,
      };

      // Add driver if pre-selected
      if (driverId) {
        bookingData.driver_id = driverId;
        bookingData.driver_name = driverName;
      }

      booking = await base44.asServiceRole.entities.Booking.create(bookingData);
      console.log("Booking created with paid status:", booking.id);

      // Mark coupon as used by this email
      const couponId = meta.coupon_id || '';
      if (couponId && clientEmail) {
        try {
          const coupons = await base44.asServiceRole.entities.Coupon.filter({ id: couponId });
          if (coupons && coupons.length > 0) {
            const coupon = coupons[0];
            const usedEmails = coupon.used_by_emails || [];
            const normalizedEmail = clientEmail.toLowerCase().trim();
            if (!usedEmails.includes(normalizedEmail)) {
              await base44.asServiceRole.entities.Coupon.update(couponId, {
                used_by_emails: [...usedEmails, normalizedEmail],
                used_count: (coupon.used_count || 0) + 1,
              });
              console.log("Coupon", couponId, "used by", normalizedEmail);
            }
          }
        } catch (couponErr) {
          console.error("Failed to mark coupon as used:", couponErr.message);
        }
      }
    } catch (err) {
      console.error("Failed to create booking:", err.message);
    }

    // ── Send emails via sendBookingConfirmation ──────────────────────────────
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
        distance_km: distanceKm,
        total_price: parseFloat(amount),
        passengers: passengers,
        notes: notes,
        payment_method: 'stripe',
        language: language,
        skip_client_email: isShortNotice,
        booking_id: booking?.id || null,
      });
      console.log("Emails sent for:", clientEmail);
    } catch (err) {
      console.error("Failed to send emails:", err.message);
    }

    // ── WhatsApp notification ────────────────────────────────────────────────
    try {
      await base44.asServiceRole.functions.invoke('sendWhatsApp', {
        type: 'payment_confirmed',
        booking: {
          client_name: clientName,
          client_phone: clientPhone,
          departure_point: departure,
          arrival_point: arrival,
          departure_date: departureDate,
          departure_time: departureTime,
          vehicle_type: vehicleType,
          total_price: amount,
        }
      });
      console.log("WhatsApp payment_confirmed sent");
    } catch (waErr) {
      console.error("WhatsApp notification failed:", waErr.message);
    }
  }

  return Response.json({ received: true });
});