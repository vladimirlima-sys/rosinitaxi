import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    // For create: only notify if driver_id is already set
    // For update: only notify if driver_id changed
    const newDriverId = data?.driver_id;
    const oldDriverId = old_data?.driver_id;

    if (!newDriverId) {
      return Response.json({ success: true });
    }

    if (event.type === 'update' && newDriverId === oldDriverId) {
      return Response.json({ success: true });
    }

    // Fetch driver details
    const drivers = await base44.asServiceRole.entities.Driver.list('', 200);
    const driver = drivers.find(d => d.id === newDriverId);

    if (!driver) {
      console.log(`Driver ${newDriverId} not found`);
      return Response.json({ success: true });
    }

    const booking = data;
    const vehicleLabel = booking.vehicle_type === 'comfort' ? 'Confort' : 'Standard';
    const payStatus = booking.payment_status === 'paid' ? '✅ Payé en ligne' : '⚠️ À encaisser sur place';

    const message = `🚗 *Rosini Transports*\nNouvelle course assignée !\n\n👤 Client: ${booking.client_name}${booking.client_phone ? '\n📞 Tél: ' + booking.client_phone : ''}\n📅 Date: ${booking.departure_date} à ${booking.departure_time}\n📍 Départ: ${booking.departure_point}\n🏁 Arrivée: ${booking.arrival_point}\n🚘 Véhicule: ${vehicleLabel}\n👥 Passagers: ${booking.passengers || 1}\n💰 Prix: CHF ${booking.total_price} — ${payStatus}${booking.flight_number ? '\n✈️ Vol: ' + booking.flight_number : ''}${booking.special_notes ? '\n📝 Notes: ' + booking.special_notes : ''}`;

    // ─── SMS via Twilio ─────────────────────────────────────────────────────
    if (driver.phone) {
      const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const fromNumber = Deno.env.get('TWILIO_WHATSAPP_FROM');
      const auth = btoa(`${accountSid}:${authToken}`);
      const driverPhone = driver.phone.replace(/\s/g, '').replace(/^whatsapp:/, '');

      const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ From: fromNumber.replace(/^whatsapp:/, ''), To: driverPhone, Body: message }).toString(),
      });

      const twilioResult = await twilioRes.json();
      if (!twilioRes.ok) {
        console.error('Twilio SMS error:', JSON.stringify(twilioResult));
      } else {
        console.log(`Driver SMS sent to ${driver.name} (${driver.phone}) — SID: ${twilioResult.sid}`);
      }
    } else {
      console.log(`Driver ${driver.name} has no phone — skipping SMS`);
    }

    // ─── Email via Gmail ────────────────────────────────────────────────────
    if (driver.email) {
      try {
        const { accessToken } = await base44.asServiceRole.connectors.getConnection("gmail");
        const subject = `=?UTF-8?B?${btoa(unescape(encodeURIComponent('🚗 Nouvelle course — ' + booking.departure_date + ' ' + booking.departure_time)))}?=`;
        const fromName = `=?UTF-8?B?${btoa(unescape(encodeURIComponent('Rosini Transports')))}?=`;
        const isPaid = booking.payment_status === 'paid';

        const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:580px;margin:0 auto;padding:32px 16px;">
  <div style="background:#000;border-top:4px solid #F5C300;border-radius:12px 12px 0 0;padding:24px 32px;">
    <p style="margin:0;color:#F5C300;font-size:24px;font-weight:900;letter-spacing:4px;">ROSINI</p>
    <p style="margin:4px 0 0;color:#F5C300;font-size:10px;letter-spacing:2px;opacity:0.7;">TRANSPORTS ET LOCATIONS SÀRL</p>
    <p style="margin:14px 0 0;color:#ffffff;font-size:16px;font-weight:bold;">🚗 Nouvelle course assignée</p>
    <p style="margin:4px 0 0;color:#aaa;font-size:13px;">Bonjour ${driver.name}, une nouvelle course vous a été attribuée.</p>
  </div>
  <div style="background:#111;border-left:1px solid #222;border-right:1px solid #222;padding:0;">
    <table style="width:100%;border-collapse:collapse;">
      <tr><td colspan="2" style="padding:0;"><div style="background:#F5C300;padding:8px 12px;"><span style="color:#000;font-size:11px;font-weight:bold;letter-spacing:1.5px;">CLIENT</span></div></td></tr>
      <tr><td style="padding:9px 12px;color:#999;font-size:13px;width:40%;">Nom</td><td style="padding:9px 12px;color:#fff;font-size:13px;">${booking.client_name}</td></tr>
      ${booking.client_phone ? `<tr><td style="padding:9px 12px;color:#999;font-size:13px;">Téléphone</td><td style="padding:9px 12px;color:#fff;font-size:13px;">${booking.client_phone}</td></tr>` : ''}
      <tr><td colspan="2" style="padding:0;"><div style="background:#F5C300;padding:8px 12px;"><span style="color:#000;font-size:11px;font-weight:bold;letter-spacing:1.5px;">TRAJET</span></div></td></tr>
      <tr><td style="padding:9px 12px;color:#999;font-size:13px;">Date</td><td style="padding:9px 12px;color:#F5C300;font-size:15px;font-weight:bold;">${booking.departure_date} à ${booking.departure_time}</td></tr>
      <tr><td style="padding:9px 12px;color:#999;font-size:13px;">Départ</td><td style="padding:9px 12px;color:#fff;font-size:13px;">${booking.departure_point}</td></tr>
      <tr><td style="padding:9px 12px;color:#999;font-size:13px;">Arrivée</td><td style="padding:9px 12px;color:#fff;font-size:13px;">${booking.arrival_point}</td></tr>
      <tr><td style="padding:9px 12px;color:#999;font-size:13px;">Véhicule</td><td style="padding:9px 12px;color:#fff;font-size:13px;">${vehicleLabel}</td></tr>
      <tr><td style="padding:9px 12px;color:#999;font-size:13px;">Passagers</td><td style="padding:9px 12px;color:#fff;font-size:13px;">${booking.passengers || 1}</td></tr>
      ${booking.flight_number ? `<tr><td style="padding:9px 12px;color:#999;font-size:13px;">Vol</td><td style="padding:9px 12px;color:#fff;font-size:13px;">${booking.flight_number}</td></tr>` : ''}
      ${booking.special_notes ? `<tr><td style="padding:9px 12px;color:#999;font-size:13px;">Notes</td><td style="padding:9px 12px;color:#fff;font-size:13px;">${booking.special_notes}</td></tr>` : ''}
      <tr><td colspan="2" style="padding:0;"><div style="background:#F5C300;padding:8px 12px;"><span style="color:#000;font-size:11px;font-weight:bold;letter-spacing:1.5px;">PAIEMENT</span></div></td></tr>
      <tr><td style="padding:9px 12px;color:#999;font-size:13px;">Montant</td><td style="padding:9px 12px;"><span style="color:#F5C300;font-size:20px;font-weight:bold;">CHF ${booking.total_price}</span> <span style="margin-left:8px;background:${isPaid ? '#F5C300' : '#ff6b00'};color:#000;font-size:10px;font-weight:bold;padding:3px 8px;border-radius:4px;">${isPaid ? 'PAYÉ EN LIGNE ✓' : 'À ENCAISSER ⚠️'}</span></td></tr>
      <tr><td colspan="2" style="height:12px;"></td></tr>
    </table>
  </div>
  <div style="background:#000;border:1px solid #333;border-radius:0 0 12px 12px;margin-top:2px;padding:16px 32px;text-align:center;">
    <p style="margin:0;color:#aaa;font-size:12px;">Questions ? Contactez-nous :</p>
    <a href="tel:+41772492245" style="color:#F5C300;font-size:14px;font-weight:bold;text-decoration:none;">+41 77 249 22 45</a>
    <p style="margin:8px 0 0;color:#444;font-size:10px;">© ${new Date().getFullYear()} Rosini Transports et Locations Sàrl</p>
  </div>
</div>
</body>
</html>`;

        const rawEmail = [
          `From: ${fromName} <rosinitransportsetlications@gmail.com>`,
          `To: ${driver.email}`,
          `Subject: ${subject}`,
          `MIME-Version: 1.0`,
          `Content-Type: text/html; charset=UTF-8`,
          ``,
          htmlBody,
        ].join('\r\n');

        const encodedEmail = btoa(unescape(encodeURIComponent(rawEmail)))
          .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ raw: encodedEmail }),
        });

        if (!gmailRes.ok) {
          const err = await gmailRes.text();
          console.error('Gmail error for driver:', err);
        } else {
          console.log(`Driver email sent to ${driver.name} (${driver.email})`);
        }
      } catch (emailErr) {
        console.error('Driver email failed:', emailErr.message);
      }
    } else {
      console.log(`Driver ${driver.name} has no email — skipping email`);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('notifyDriverAssigned error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});