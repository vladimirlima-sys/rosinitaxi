import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const stripe = await import('npm:stripe@17.0.0').then(m => new m.default(Deno.env.get('STRIPE_SECRET_KEY')));

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { amount, clientEmail, clientName, distance, duration, vehicleType, totalPrice } = body;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'chf',
            product_data: {
              name: `Trajet ${vehicleType === 'comfort' ? 'Comfort' : 'Standard'}`,
              description: `${distance} km | Durée: ${duration}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${Deno.env.get('BASE44_APP_URL')}/taximeter-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('BASE44_APP_URL')}/TaximeterDriver`,
      customer_email: clientEmail,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        clientName,
        distance,
        duration,
        vehicleType,
        totalPrice,
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});