import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { client_name, client_email, client_phone, departure_point, arrival_point, departure_date, departure_time, flight_number, vehicle_type, distance_km, total_price, passengers, notes } = body;

    const vehicleLabel = vehicle_type === 'economic' ? 'Standard' : 'Confort';
    const flightInfo = flight_number ? `<tr><td style="padding:6px 0;color:#888;">Vol</td><td style="padding:6px 0;color:#fff;">${flight_number}</td></tr>` : '';
    const notesInfo = notes ? `<tr><td style="padding:6px 0;color:#888;">Notes</td><td style="padding:6px 0;color:#fff;">${notes}</td></tr>` : '';

    const clientEmailBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#C9A96E;font-size:28px;font-weight:300;letter-spacing:4px;margin:0;">ROSINI</h1>
      <p style="color:#C9A96E;font-size:11px;letter-spacing:3px;margin:4px 0 0;">TRANSFERT</p>
    </div>

    <div style="background:#111;border:1px solid #222;border-radius:12px;padding:32px;margin-bottom:24px;">
      <h2 style="color:#fff;font-size:20px;font-weight:300;margin:0 0 8px;">✅ Réservation confirmée</h2>
      <p style="color:#888;margin:0 0 24px;">Merci ${client_name}, votre transfer est confirmé.</p>

      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#888;">Trajet</td><td style="padding:6px 0;color:#fff;">${departure_point} → ${arrival_point}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">Date</td><td style="padding:6px 0;color:#fff;">${departure_date} à ${departure_time}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">Véhicule</td><td style="padding:6px 0;color:#fff;">${vehicleLabel}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">Passagers</td><td style="padding:6px 0;color:#fff;">${passengers || 1}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">Distance</td><td style="padding:6px 0;color:#fff;">${distance_km} km</td></tr>
        ${flightInfo}
        ${notesInfo}
        <tr><td colspan="2" style="padding:12px 0;"><hr style="border:none;border-top:1px solid #333;margin:0;"></td></tr>
        <tr><td style="padding:6px 0;color:#888;font-weight:bold;">Total payé</td><td style="padding:6px 0;color:#C9A96E;font-size:18px;font-weight:bold;">CHF ${total_price}</td></tr>
      </table>
    </div>

    <div style="text-align:center;padding:24px;background:#111;border:1px solid #222;border-radius:12px;">
      <p style="color:#888;margin:0 0 4px;font-size:13px;">Des questions ? Contactez-nous</p>
      <a href="mailto:taxirosini@gmail.com" style="color:#C9A96E;text-decoration:none;">taxirosini@gmail.com</a>
    </div>

    <p style="color:#444;text-align:center;font-size:11px;margin-top:24px;">© ${new Date().getFullYear()} Rosini Transfert. Tous droits réservés.</p>
  </div>
</body>
</html>`;

    const adminEmailBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#C9A96E;font-size:28px;font-weight:300;letter-spacing:4px;margin:0;">ROSINI</h1>
      <p style="color:#C9A96E;font-size:11px;letter-spacing:3px;margin:4px 0 0;">TRANSFERT</p>
    </div>

    <div style="background:#111;border:1px solid #C9A96E33;border-radius:12px;padding:32px;">
      <h2 style="color:#C9A96E;font-size:20px;font-weight:300;margin:0 0 8px;">🔔 Nouvelle réservation reçue</h2>
      <p style="color:#888;margin:0 0 24px;">Un nouveau client a effectué une réservation.</p>

      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#888;">Client</td><td style="padding:6px 0;color:#fff;">${client_name}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">Email</td><td style="padding:6px 0;color:#fff;">${client_email}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">Téléphone</td><td style="padding:6px 0;color:#fff;">${client_phone || 'Non renseigné'}</td></tr>
        <tr><td colspan="2" style="padding:12px 0;"><hr style="border:none;border-top:1px solid #333;margin:0;"></td></tr>
        <tr><td style="padding:6px 0;color:#888;">Trajet</td><td style="padding:6px 0;color:#fff;">${departure_point} → ${arrival_point}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">Date</td><td style="padding:6px 0;color:#fff;">${departure_date} à ${departure_time}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">Véhicule</td><td style="padding:6px 0;color:#fff;">${vehicleLabel}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">Passagers</td><td style="padding:6px 0;color:#fff;">${passengers || 1}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">Distance</td><td style="padding:6px 0;color:#fff;">${distance_km} km</td></tr>
        ${flightInfo}
        ${notesInfo}
        <tr><td colspan="2" style="padding:12px 0;"><hr style="border:none;border-top:1px solid #333;margin:0;"></td></tr>
        <tr><td style="padding:6px 0;color:#888;font-weight:bold;">Montant encaissé</td><td style="padding:6px 0;color:#C9A96E;font-size:18px;font-weight:bold;">CHF ${total_price}</td></tr>
      </table>
    </div>

    <p style="color:#444;text-align:center;font-size:11px;margin-top:24px;">© ${new Date().getFullYear()} Rosini Transfert — Notification automatique</p>
  </div>
</body>
</html>`;

    // Send confirmation email to client
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: client_email,
      subject: `✅ Réservation confirmée — ${departure_point} → ${arrival_point}`,
      body: clientEmailBody,
      from_name: 'Rosini Transfert',
    });

    // Send notification email to admin
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'taxirosini@gmail.com',
      subject: `🔔 Nouvelle réservation — ${client_name} | ${departure_point} → ${arrival_point} | CHF ${total_price}`,
      body: adminEmailBody,
      from_name: 'Rosini Transfert',
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error sending confirmation emails:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});