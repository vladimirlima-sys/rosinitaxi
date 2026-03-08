import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const {
      amount, currency, client_name, client_email, client_phone,
      departure, arrival, vehicle_type, distance_km,
      departure_date, departure_time, origin, is_short_notice,
      flight_number, passengers, notes, language,
      driver_id, driver_name, additional_stops
    } = await req.json();

    if (!amount || amount <= 0) throw new Error('Invalid amount');
    if (!client_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client_email)) throw new Error('Invalid email');
    if (!client_name || client_name.trim().length < 2) throw new Error('Invalid name');

    const validCurrencies = ['usd', 'eur', 'chf', 'gbp'];
    const normalizedCurrency = (currency || 'chf').toLowerCase();
    if (!validCurrencies.includes(normalizedCurrency)) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: client_email,
      line_items: [
        {
          price_data: {
            currency: normalizedCurrency,
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: `Rosini Transfert — ${vehicle_type === 'economic' ? 'Standard' : 'Confort'}`,
              description: `${departure} → ${arrival} | ${distance_km} km | ${departure_date} à ${departure_time}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}?booking=success`,
      cancel_url: `${origin}?booking=cancel`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        client_name,
        client_email,
        client_phone: client_phone || '',
        departure,
        arrival,
        vehicle_type,
        distance_km: String(distance_km),
        departure_date,
        departure_time,
        flight_number: flight_number || '',
        passengers: String(passengers || 1),
        notes: notes || '',
        language: language || 'fr',
        driver_id: driver_id || '',
        driver_name: driver_name || '',
        is_short_notice: is_short_notice ? 'true' : 'false',
        additional_stops: Array.isArray(additional_stops) ? additional_stops.filter(s => s).join('||') : '',
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});