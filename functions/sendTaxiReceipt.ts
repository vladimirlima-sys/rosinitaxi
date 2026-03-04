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

    // Generate receipt HTML with modern black & white design
    const receiptDate = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    const receiptHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reçu Rosini Taximètre</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f0f0; padding: 20px; }
    .container { max-width: 650px; margin: 0 auto; background: white; padding: 50px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    
    .header { border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 35px; }
    .header-title { font-size: 32px; font-weight: 700; letter-spacing: 3px; color: #000; text-align: center; }
    .header-subtitle { font-size: 10px; letter-spacing: 2px; color: #666; text-align: center; margin-top: 5px; text-transform: uppercase; }
    
    .receipt-meta { display: flex; justify-content: space-between; margin-bottom: 30px; padding: 0; font-size: 9px; color: #999; }
    
    .section { margin-bottom: 30px; }
    .section-title { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; color: #000; text-transform: uppercase; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e0e0e0; }
    
    .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .detail-label { font-size: 11px; color: #888; }
    .detail-value { font-size: 11px; font-weight: 600; color: #000; }
    
    .amount-box { background: #fafafa; border: 1px solid #e0e0e0; padding: 20px; margin: 25px 0; text-align: right; }
    .amount-label { font-size: 9px; letter-spacing: 1px; color: #999; text-transform: uppercase; margin-bottom: 8px; }
    .amount-value { font-size: 36px; font-weight: 700; color: #000; letter-spacing: 1px; }
    .amount-currency { font-size: 18px; margin-right: 5px; }
    
    .status { text-align: center; margin: 20px 0; }
    .status-badge { display: inline-block; background: #f0f0f0; padding: 8px 20px; border-radius: 3px; font-size: 11px; font-weight: 600; color: #000; text-transform: uppercase; letter-spacing: 1px; }
    
    .footer { border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px; text-align: center; font-size: 8px; color: #bbb; line-height: 1.6; }
    .footer-company { font-weight: 600; margin-bottom: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-title">ROSINI</div>
      <div class="header-subtitle">Taximètre Professionnel</div>
    </div>
    
    <div class="receipt-meta">
      <div>Reçu #${sessionId.substring(0, 8).toUpperCase()}</div>
      <div>${receiptDate}</div>
    </div>
    
    <div class="section">
      <div class="section-title">Course</div>
      <div class="detail-row">
        <span class="detail-label">Type de véhicule</span>
        <span class="detail-value">${vehicleType === 'comfort' ? 'COMFORT' : 'STANDARD'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Distance parcourue</span>
        <span class="detail-value">${distance} km</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Durée du trajet</span>
        <span class="detail-value">${duration}</span>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Tarification</div>
      <div class="detail-row">
        <span class="detail-label">Tarif par km</span>
        <span class="detail-value">Selon tarif</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Total</span>
        <span class="detail-value">CHF ${totalPrice}</span>
      </div>
    </div>
    
    <div class="amount-box">
      <div class="amount-label">Tarif Total</div>
      <div class="amount-value"><span class="amount-currency">CHF</span>${totalPrice}</div>
    </div>
    
    <div class="status">
      <div class="status-badge">✓ Paiement Confirmé</div>
    </div>
    
    <div class="footer">
      <div class="footer-company">ROSINI TRANSPORTS DE PERSONNES SARL</div>
      <div>CHE-264.039.709 | Suisse</div>
      <div style="margin: 5px 0;">Chemin des Bulesses 16 · 1814 La Tour-de-Peilz</div>
      <div>Tél: +41 77 249 22 45 · info@rosini.online</div>
      <div style="margin-top: 10px; font-size: 7px;">Ce reçu a été généré automatiquement après le paiement de votre course.</div>
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