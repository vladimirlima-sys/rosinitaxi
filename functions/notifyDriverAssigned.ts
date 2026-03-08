import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    // Only process update events
    if (event.type !== 'update') {
      return Response.json({ success: true });
    }

    // Only trigger when driver_id is newly assigned or changed
    const newDriverId = data?.driver_id;
    const oldDriverId = old_data?.driver_id;

    if (!newDriverId || newDriverId === oldDriverId) {
      return Response.json({ success: true });
    }

    // Fetch driver details
    const drivers = await base44.asServiceRole.entities.Driver.list('', 200);
    const driver = drivers.find(d => d.id === newDriverId);

    if (!driver?.phone) {
      console.log(`Driver ${newDriverId} has no phone — skipping SMS`);
      return Response.json({ success: true });
    }

    const booking = data;
    const vehicleLabel = booking.vehicle_type === 'comfort' ? 'Confort' : 'Standard';
    const payStatus = booking.payment_status === 'paid' ? '✅ Payé en ligne' : '⚠️ À encaisser sur place';

    const message = `🚗 *Rosini Transports*\nNouvelle course assignée !\n\n👤 Client: ${booking.client_name}${booking.client_phone ? '\n📞 Tél: ' + booking.client_phone : ''}\n📅 Date: ${booking.departure_date} à ${booking.departure_time}\n📍 Départ: ${booking.departure_point}\n🏁 Arrivée: ${booking.arrival_point}\n🚘 Véhicule: ${vehicleLabel}\n👥 Passagers: ${booking.passengers || 1}\n💰 Prix: CHF ${booking.total_price} — ${payStatus}${booking.flight_number ? '\n✈️ Vol: ' + booking.flight_number : ''}${booking.special_notes ? '\n📝 Notes: ' + booking.special_notes : ''}`;

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_WHATSAPP_FROM');

    const auth = btoa(`${accountSid}:${authToken}`);
    const driverPhone = driver.phone.replace(/\s/g, '');
    const to = driverPhone.startsWith('whatsapp:') ? driverPhone : `whatsapp:${driverPhone}`;
    const from = fromNumber?.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ From: from, To: to, Body: message }).toString(),
    });

    const result = await res.json();
    if (!res.ok) {
      console.error('Twilio error:', result);
    } else {
      console.log(`Driver WhatsApp sent to ${driver.name} (${driver.phone}) — SID: ${result.sid}`);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('notifyDriverAssigned error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});