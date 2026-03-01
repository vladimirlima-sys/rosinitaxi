import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { amount, paymentMethod } = await req.json();

    if (!amount || !paymentMethod) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().slice(0, 5);

    const booking = await base44.entities.Booking.create({
      client_name: 'Taximètre',
      client_email: 'taximeter@rosini.local',
      departure_point: 'Taximètre',
      arrival_point: 'Taximètre',
      departure_date: today,
      departure_time: time,
      vehicle_type: 'economic',
      distance_km: 0,
      total_price: amount,
      passengers: 1,
      payment_status: paymentMethod === 'card' ? 'paid' : 'pending',
      payment_method: paymentMethod === 'card' ? 'stripe' : (paymentMethod === 'twint' ? 'twint' : 'cash'),
      notes: 'Paiement depuis le taximètre'
    });

    console.log('Taximeter payment registered:', booking);
    return Response.json({ success: true, booking });
  } catch (error) {
    console.error('Error registering taximeter payment:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});