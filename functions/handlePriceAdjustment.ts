import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.8.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-06-20',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { bookingId, oldPrice, newPrice, clientEmail, clientName } = body;

    // Fetch booking to get payment details
    const bookings = await base44.entities.Booking.filter({ id: bookingId });
    if (!bookings || bookings.length === 0) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking = bookings[0];
    const priceDiff = newPrice - oldPrice;

    if (priceDiff > 0) {
      // Price increased - charge the difference
      console.log(`Price increased by CHF ${priceDiff.toFixed(2)} for booking ${bookingId}`);
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'chf',
            product_data: {
              name: `Ajustement de tarif - ${booking.departure_point} → ${booking.arrival_point}`,
            },
            unit_amount: Math.round(priceDiff * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        customer_email: clientEmail,
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          booking_id: bookingId,
          adjustment_type: 'price_increase',
        },
        success_url: `${req.headers.get('origin')}/`,
        cancel_url: `${req.headers.get('origin')}/`,
      });

      return Response.json({
        type: 'charge',
        sessionId: session.id,
        amount: priceDiff,
        url: session.url,
      });
    } else if (priceDiff < 0) {
      // Price decreased - refund the difference
      console.log(`Price decreased by CHF ${Math.abs(priceDiff).toFixed(2)} for booking ${bookingId}`);
      
      const paymentIntentId = booking.stripe_payment_intent_id;
      if (!paymentIntentId) {
        return Response.json({
          type: 'refund_manual',
          message: 'No payment intent found - manual refund required',
          amount: Math.abs(priceDiff),
        });
      }

      // Create refund for the difference
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(Math.abs(priceDiff) * 100),
        metadata: {
          booking_id: bookingId,
          adjustment_type: 'price_decrease',
        },
      });

      console.log(`Refund created: ${refund.id} for CHF ${Math.abs(priceDiff).toFixed(2)}`);

      return Response.json({
        type: 'refund',
        refundId: refund.id,
        amount: Math.abs(priceDiff),
        status: refund.status,
      });
    }

    return Response.json({ type: 'no_change', message: 'Price unchanged' });
  } catch (error) {
    console.error('Price adjustment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});