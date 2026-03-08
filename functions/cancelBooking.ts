import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { booking_id } = await req.json();

    if (!booking_id) {
      return Response.json({ error: 'booking_id is required' }, { status: 400 });
    }

    // Fetch the booking
    const booking = await base44.asServiceRole.entities.Booking.get(booking_id);
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.payment_status === 'cancelled' || booking.payment_status === 'refunded') {
      return Response.json({ error: 'Booking is already cancelled' }, { status: 400 });
    }

    // Check if eligible for refund: Stripe payment + departure is more than 24h away
    let refundIssued = false;
    let refundMessage = '';

    if (booking.payment_method === 'stripe' && booking.stripe_payment_intent_id && booking.departure_date && booking.departure_time) {
      const departureDateTime = new Date(`${booking.departure_date}T${booking.departure_time}:00`);
      const now = new Date();
      const hoursUntilDeparture = (departureDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      console.log(`Hours until departure: ${hoursUntilDeparture}`);

      if (hoursUntilDeparture > 24) {
        // Issue full refund via Stripe
        try {
          const refund = await stripe.refunds.create({
            payment_intent: booking.stripe_payment_intent_id,
          });
          console.log('Refund issued:', refund.id, 'Status:', refund.status);
          refundIssued = true;
          refundMessage = `Remboursement de CHF ${booking.total_price} effectué (${refund.id})`;
        } catch (refundErr) {
          console.error('Stripe refund failed:', refundErr.message);
          return Response.json({ error: `Refund failed: ${refundErr.message}` }, { status: 500 });
        }
      } else {
        console.log('Less than 24h until departure — no refund issued');
        refundMessage = 'Moins de 24h avant le départ — aucun remboursement';
      }
    }

    // Update booking status
    await base44.asServiceRole.entities.Booking.update(booking_id, {
      payment_status: refundIssued ? 'refunded' : 'cancelled'
    });

    // Calculate hours until departure
    const departureDateTime = new Date(`${booking.departure_date}T${booking.departure_time}:00`);
    const now = new Date();
    const hoursUntilDeparture = (departureDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Send cancellation email to CLIENT
    try {
      console.log('Sending cancellation email to client...');
      const clientEmailResult = await base44.asServiceRole.functions.invoke('sendCancellationEmail', {
        client_name: booking.client_name,
        client_email: booking.client_email,
        booking_id: booking_id,
        departure_point: booking.departure_point,
        arrival_point: booking.arrival_point,
        departure_date: booking.departure_date,
        departure_time: booking.departure_time,
        total_price: booking.total_price,
        refund_issued: refundIssued,
        refund_amount: booking.total_price,
        hours_until_departure: hoursUntilDeparture,
        language: booking.language || 'fr',
        cancelled_by: 'company'
      });
      console.log('Cancellation email sent to client:', clientEmailResult.data);
    } catch (clientEmailErr) {
      console.error('Failed to send cancellation email to client:', clientEmailErr.message);
    }

    // Send cancellation notification email to COMPANY
    try {
      console.log('Sending cancellation email to company...');
      const accessToken = (await base44.asServiceRole.connectors.getConnection('gmail')).accessToken;
      const subject = `❌ Annulation — ${booking.client_name} | ${booking.departure_point} → ${booking.arrival_point} | ${booking.departure_date}`;
      const cleanPhone = (booking.client_phone || '').replace(/\D/g, '');
      const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : null;
      const htmlBody = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="color:#F5C300;font-size:28px;font-weight:700;letter-spacing:4px;margin:0;">ROSINI</h1>
    <p style="color:#F5C300;font-size:11px;letter-spacing:3px;margin:4px 0 0;">TRANSFERT</p>
  </div>
  <div style="background:#111;border:1px solid #F5C300;border-radius:12px;padding:32px;">
    <h2 style="color:#F5C300;font-size:20px;font-weight:600;margin:0 0 24px;">❌ Réservation annulée</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <tr><td style="padding:7px 0;color:#888;width:40%;">Client</td><td style="padding:7px 0;color:#fff;">${booking.client_name}</td></tr>
      <tr><td style="padding:7px 0;color:#888;">Email</td><td style="padding:7px 0;color:#fff;">${booking.client_email}</td></tr>
      <tr><td style="padding:7px 0;color:#888;">Téléphone</td><td style="padding:7px 0;color:#fff;">${booking.client_phone || '—'}</td></tr>
      ${waLink ? `<tr><td style="padding:7px 0;color:#888;">WhatsApp</td><td style="padding:7px 0;"><a href="${waLink}" style="display:inline-block;background:#25D366;color:#fff;font-weight:bold;padding:5px 14px;border-radius:6px;text-decoration:none;font-size:12px;">💬 Contacter</a></td></tr>` : ''}
      <tr><td colspan="2" style="padding:10px 0;"><hr style="border:none;border-top:1px solid #333;margin:0;"></td></tr>
      <tr><td style="padding:7px 0;color:#888;">Trajet</td><td style="padding:7px 0;color:#fff;">${booking.departure_point} → ${booking.arrival_point}</td></tr>
      <tr><td style="padding:7px 0;color:#888;">Date</td><td style="padding:7px 0;color:#fff;">${booking.departure_date} à ${booking.departure_time}</td></tr>
      <tr><td style="padding:7px 0;color:#888;">Montant</td><td style="padding:7px 0;color:#F5C300;font-weight:bold;">CHF ${booking.total_price}</td></tr>
      <tr><td style="padding:7px 0;color:#888;">Paiement</td><td style="padding:7px 0;color:#fff;">${booking.payment_method}</td></tr>
      <tr><td colspan="2" style="padding:10px 0;"><hr style="border:none;border-top:1px solid #333;margin:0;"></td></tr>
      <tr><td style="padding:7px 0;color:#888;">Remboursement</td><td style="padding:7px 0;color:${refundIssued ? '#4ade80' : '#f87171'};font-weight:bold;">${refundIssued ? `✅ ${refundMessage}` : `❌ ${refundMessage || 'Aucun remboursement'}`}</td></tr>
    </table>
  </div>
  <p style="color:#444;text-align:center;font-size:11px;margin-top:24px;">© ${new Date().getFullYear()} Rosini Transfert — Notification automatique</p>
</div></body></html>`;

      const emailMessage = `To: info@rosini.online\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${htmlBody}`;
      const encodedEmail = btoa(emailMessage);

      const gmailResponse = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: encodedEmail })
      });

      if (!gmailResponse.ok) {
        throw new Error(`Gmail error: ${gmailResponse.status}`);
      }
      console.log('Cancellation email sent to company');
    } catch (emailErr) {
      console.error('Failed to send cancellation email to company (non-critical):', emailErr.message);
    }

    return Response.json({ success: true, refund_issued: refundIssued });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});