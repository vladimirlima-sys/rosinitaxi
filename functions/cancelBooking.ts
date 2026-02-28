import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { booking_id } = await req.json();

    if (!booking_id) {
      return Response.json({ error: 'booking_id is required' }, { status: 400 });
    }

    // Fetch the booking
    const bookings = await base44.asServiceRole.entities.Booking.filter({ id: booking_id });
    if (!bookings || bookings.length === 0) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking = bookings[0];

    if (booking.payment_status === 'cancelled') {
      return Response.json({ error: 'Booking is already cancelled' }, { status: 400 });
    }

    // Update booking status to cancelled
    await base44.asServiceRole.entities.Booking.update(booking_id, {
      payment_status: 'cancelled'
    });

    // Send cancellation notification email to company
    try {
      const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');
      const subject = `❌ Annulation — ${booking.client_name} | ${booking.departure_point} → ${booking.arrival_point} | ${booking.departure_date}`;
      const htmlBody = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#c0392b;">❌ Réservation annulée</h2>
          <p><strong>Client:</strong> ${booking.client_name}</p>
          <p><strong>Email:</strong> ${booking.client_email}</p>
          <p><strong>Téléphone:</strong> ${booking.client_phone || '—'}</p>
          <p><strong>Trajet:</strong> ${booking.departure_point} → ${booking.arrival_point}</p>
          <p><strong>Date:</strong> ${booking.departure_date} à ${booking.departure_time}</p>
          <p><strong>Montant:</strong> CHF ${booking.total_price}</p>
          <p><strong>Méthode de paiement:</strong> ${booking.payment_method}</p>
        </div>
      `;

      const lines = [
        `From: taxirosini@gmail.com`,
        `To: info@rosini.online`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset="UTF-8"`,
        ``,
        htmlBody
      ];
      const emailMessage = lines.join('\r\n');
      const base64Message = btoa(unescape(encodeURIComponent(emailMessage)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

      await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: base64Message })
      });
      console.log('Cancellation email sent to company');
    } catch (emailErr) {
      console.error('Failed to send cancellation email (non-critical):', emailErr.message);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});