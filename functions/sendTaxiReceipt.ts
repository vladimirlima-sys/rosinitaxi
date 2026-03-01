import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const stripe = await import('npm:stripe@17.0.0').then(m => new m.default(Deno.env.get('STRIPE_SECRET_KEY')));

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { sessionId } = body;

    // Get session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'paid') {
      return Response.json({ error: 'Invalid session or payment not completed' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const { clientName, distance, duration, vehicleType, totalPrice } = session.metadata;

    // Generate receipt HTML
    const receiptHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reçu Rosini Transfert</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #F5C300; padding-bottom: 20px; }
    .header h1 { margin: 0; font-size: 36px; letter-spacing: 4px; color: #000; font-weight: 300; }
    .header p { margin: 5px 0 0 0; color: #666; font-size: 12px; letter-spacing: 2px; }
    .receipt-number { margin-bottom: 30px; text-align: right; color: #999; font-size: 12px; }
    .client-info { margin-bottom: 30px; background: #f9f9f9; padding: 15px; border-radius: 5px; }
    .client-info p { margin: 8px 0; color: #333; }
    .client-info strong { color: #000; }
    .details { margin-bottom: 30px; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #666; }
    .detail-value { font-weight: bold; color: #000; }
    .summary { margin-top: 30px; padding-top: 20px; border-top: 2px solid #F5C300; }
    .total-row { display: flex; justify-content: space-between; font-size: 24px; font-weight: bold; color: #F5C300; margin: 15px 0; }
    .footer { margin-top: 40px; text-align: center; color: #999; font-size: 11px; }
    .vehicle-type { background: #f0f0f0; padding: 8px 12px; border-radius: 4px; display: inline-block; font-size: 12px; margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ROSINI</h1>
      <p>TRANSFERT PROFESSIONNEL</p>
    </div>

    <div class="receipt-number">
      Reçu #${sessionId.substring(0, 8).toUpperCase()}
    </div>

    <div class="client-info">
      <p><strong>Client:</strong> ${clientName}</p>
      <p><strong>Email:</strong> ${session.customer_email}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <div class="details">
      <div class="detail-row">
        <span class="detail-label">Type de véhicule:</span>
        <span class="detail-value"><span class="vehicle-type">${vehicleType === 'comfort' ? 'COMFORT' : 'STANDARD'}</span></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Distance parcourue:</span>
        <span class="detail-value">${distance} km</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Durée du trajet:</span>
        <span class="detail-value">${duration}</span>
      </div>
    </div>

    <div class="summary">
      <div class="detail-row">
        <span class="detail-label">Tarif (CHF):</span>
        <span class="detail-value">${totalPrice}</span>
      </div>
      <div class="total-row">
        <span>TOTAL:</span>
        <span>CHF ${totalPrice}</span>
      </div>
    </div>

    <div class="footer">
      <p>Merci pour votre confiance!</p>
      <p>Rosini Transfert · Service de transport professionnel</p>
      <p style="margin-top: 20px; color: #ccc; font-size: 10px;">Ce reçu est généré automatiquement après confirmation du paiement</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email via Core integration
    await base44.integrations.Core.SendEmail({
      to: session.customer_email,
      subject: 'Reçu Rosini Transfert',
      body: receiptHtml,
      from_name: 'Rosini Transfert',
    });

    // Create booking record for Finance tracking
    await base44.asServiceRole.entities.Booking.create({
      client_name: clientName,
      client_email: session.customer_email,
      departure_point: 'Taxímetro',
      arrival_point: 'Taxímetro',
      departure_date: new Date().toISOString().split('T')[0],
      departure_time: new Date().toISOString().split('T')[1].substring(0, 5),
      vehicle_type: vehicleType === 'comfort' ? 'comfort' : 'economic',
      distance_km: parseFloat(distance),
      total_price: parseFloat(totalPrice),
      payment_status: 'paid',
      payment_method: 'cash',
      notes: `Trajet au taximètre | Durée: ${duration} | Session: ${sessionId.substring(0, 8)}`,
    });

    return Response.json({ success: true, message: 'Receipt sent successfully' });
  } catch (error) {
    console.error('Send receipt error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});