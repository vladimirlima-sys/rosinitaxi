import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { clientEmail, amount, paymentMethod, distance, departure, arrival } = await req.json();

    if (!clientEmail || !amount || !paymentMethod) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const methodLabel = {
      'card': 'Carte Bancaire',
      'twint': 'TWINT',
      'cash': 'Espèces'
    }[paymentMethod] || paymentMethod;

    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f0f0; color: #333; }
    .wrapper { background: #f0f0f0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    
    /* Header */
    .header { background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px 30px; text-align: center; position: relative; overflow: hidden; }
    .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: #F5C300; }
    .header h1 { font-size: 32px; font-weight: 700; color: #F5C300; margin: 0; letter-spacing: 2px; }
    .header p { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 8px; }
    
    /* Content */
    .content { padding: 40px 30px; }
    
    /* Section */
    .section { margin-bottom: 30px; }
    .section-title { font-size: 10px; font-weight: 700; color: #000; text-transform: uppercase; letter-spacing: 1.5px; padding-bottom: 12px; border-bottom: 2px solid #F5C300; margin-bottom: 15px; }
    
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #666; font-weight: 500; }
    .detail-value { color: #000; font-weight: 600; }
    
    /* Highlight section */
    .highlight-box { background: #fafafa; border-left: 4px solid #F5C300; padding: 20px; margin: 25px 0; }
    .highlight-title { font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .highlight-value { font-size: 32px; font-weight: 700; color: #000; letter-spacing: 1px; }
    .highlight-currency { font-size: 16px; margin-right: 5px; }
    
    /* Company info */
    .company-info { background: #f9f9f9; padding: 15px; border-radius: 4px; margin-top: 25px; }
    .company-name { font-size: 12px; font-weight: 700; color: #000; margin-bottom: 8px; letter-spacing: 0.5px; }
    .company-detail { font-size: 11px; color: #666; line-height: 1.6; }
    
    /* Footer */
    .footer { background: #1a1a1a; color: #999; padding: 25px 30px; text-align: center; font-size: 10px; line-height: 1.6; }
    .footer-check { color: #F5C300; font-weight: 600; margin-bottom: 10px; }
    
    /* Responsive */
    @media (max-width: 600px) {
      .header h1 { font-size: 24px; }
      .highlight-value { font-size: 24px; }
      .content { padding: 25px 20px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1>ROSINI</h1>
        <p>Transports de Personnes</p>
      </div>
      
      <!-- Content -->
      <div class="content">
        <!-- Trip Details -->
        <div class="section">
          <div class="section-title">Détails de la Course</div>
          <div class="detail-row">
            <span class="detail-label">Date & Heure</span>
            <span class="detail-value">${dateStr} à ${timeStr}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Distance parcourue</span>
            <span class="detail-value">${distance ? distance.toFixed(2) + ' km' : 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Méthode de paiement</span>
            <span class="detail-value">${methodLabel}</span>
          </div>
        </div>
        
        <!-- Amount -->
        <div class="highlight-box">
          <div class="highlight-title">Montant Total</div>
          <div class="highlight-value"><span class="highlight-currency">CHF</span>${amount.toFixed(2)}</div>
        </div>
        
        <!-- Company Info -->
        <div class="company-info">
          <div class="company-name">✓ ROSINI TRANSPORTS DE PERSONNES SARL</div>
          <div class="company-detail">
            CHE-264.039.709<br>
            Chemin des Bulesses 16<br>
            1814 La Tour-de-Peilz, Suisse<br><br>
            Tél: <strong>+41 77 249 22 45</strong><br>
            Email: <strong>info@rosini.online</strong>
          </div>
        </div>
        
        <!-- Thank you -->
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f0f0f0; text-align: center;">
          <p style="font-size: 12px; color: #666; line-height: 1.8;">
            Merci d'avoir choisi ROSINI TRANSPORTS.<br>
            <strong>Ce reçu constitue la preuve de votre paiement.</strong>
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <div class="footer-check">✓ Paiement Confirmé</div>
        <div>Reçu généré automatiquement</div>
        <div style="margin-top: 10px; font-size: 9px; color: #666;">
          Cet email a été généré automatiquement. Merci de ne pas répondre directement.
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    // Send email HTML only (no PDF)
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    
    const boundary = 'boundary_' + Date.now();
    const emailRaw = `From: no-reply@rosini.online\r\n` +
      `To: ${clientEmail}\r\n` +
      `Subject: ROSINI TRANSPORTS - Reçu de Course\r\n` +
      `MIME-Version: 1.0\r\n` +
      `Content-Type: text/html; charset=UTF-8\r\n` +
      `Content-Transfer-Encoding: 8bit\r\n` +
      `\r\n` +
      `${emailBody}`;
    
    // Use TextEncoder to handle Unicode characters properly
    const encoder = new TextEncoder();
    const emailBytes = encoder.encode(emailRaw);
    const emailBase64 = btoa(String.fromCharCode(...emailBytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: emailBase64
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gmail API error response:', errText);
      throw new Error(`Gmail API error: ${response.status} ${response.statusText} - ${errText}`);
    }

    console.log('Travel receipt sent to:', clientEmail);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error sending travel receipt:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});