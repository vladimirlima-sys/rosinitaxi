import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { amount, paymentMethod, clientEmail, distance, departure, arrival, driverId } = await req.json();

    if (!amount || !paymentMethod) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().slice(0, 5);

    // Fetch driver info if driverId is provided
    let driverName = 'Taximètre';
    if (driverId) {
      const drivers = await base44.entities.Driver.list();
      const driver = drivers.find(d => d.id === driverId);
      if (driver) driverName = driver.name;
    }

    const booking = await base44.entities.Booking.create({
      client_name: 'Taximètre',
      client_email: clientEmail || 'taximeter@rosini.local',
      departure_point: departure || 'Taximètre',
      arrival_point: arrival || 'Taximètre',
      departure_date: today,
      departure_time: time,
      vehicle_type: 'economic',
      distance_km: distance || 0,
      total_price: amount,
      passengers: 1,
      payment_status: 'paid',
      payment_method: paymentMethod === 'card' ? 'stripe' : (paymentMethod === 'twint' ? 'twint' : 'cash'),
      driver_id: driverId || null,
      driver_name: driverName,
      notes: 'Paiement depuis le taximètre'
    });

    // Send travel receipt if email is provided
    if (clientEmail) {
      try {
        await base44.functions.invoke('sendTravelReceipt', {
          clientEmail,
          amount,
          paymentMethod,
          distance,
          departure,
          arrival
        });
      } catch (emailError) {
        console.log('Email send failed, but payment registered:', emailError.message);
      }
    }

    console.log('Taximeter payment registered:', booking);
    return Response.json({ success: true, booking });
  } catch (error) {
    console.error('Error registering taximeter payment:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});