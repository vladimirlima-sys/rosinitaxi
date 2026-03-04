import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Validate required fields
    if (!body.client_name || !body.client_email || !body.departure_point || !body.arrival_point || !body.departure_date || !body.departure_time || !body.vehicle_type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create booking with service role (bypasses RLS for public app)
    const booking = await base44.asServiceRole.entities.Booking.create({
      client_name: body.client_name,
      client_email: body.client_email,
      client_phone: body.client_phone || '',
      departure_point: body.departure_point,
      arrival_point: body.arrival_point,
      departure_date: body.departure_date,
      departure_time: body.departure_time,
      flight_number: body.flight_number || '',
      vehicle_type: body.vehicle_type,
      distance_km: body.distance_km || 0,
      total_price: body.total_price || 0,
      passengers: body.passengers || 1,
      extras: body.extras || [],
      extras_price: body.extras_price || 0,
      special_notes: body.special_notes || '',
      payment_status: body.payment_status || 'pending',
      payment_method: body.payment_method || 'stripe',
      notes: body.notes || '',
      language: body.language || 'fr',
      driver_id: body.driver_id || null,
      driver_name: body.driver_name || null
    });

    return Response.json({ id: booking.id, ...booking }, { status: 201 });
  } catch (error) {
    console.error('❌ Booking creation error:', error);
    return Response.json({ error: error.message || 'Failed to create booking' }, { status: 500 });
  }
});