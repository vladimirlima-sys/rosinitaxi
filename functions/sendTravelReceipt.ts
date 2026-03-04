import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { jsPDF } from 'npm:jspdf@4.0.0';

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

    // Generate PDF with modern black & white design
    const doc = new jsPDF('p', 'mm', 'a4');
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    
    // Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, w, h, 'F');
    
    // Top accent bar
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, w, 3, 'F');
    
    // Header
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont('Arial', 'bold');
    doc.text('ROSINI', w / 2, 15, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont('Arial', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('TRANSPORTS DE PERSONNES', w / 2, 20, { align: 'center' });
    
    // Divider
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(15, 24, w - 15, 24);
    
    // Receipt header
    let yPos = 32;
    doc.setFontSize(11);
    doc.setFont('Arial', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('REÇU DE COURSE', 15, yPos);
    
    doc.setFontSize(8);
    doc.setFont('Arial', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(`Émis le ${dateStr} à ${timeStr}`, w - 15, yPos, { align: 'right' });
    
    // Section 1: Trip details
    yPos = 42;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(15, yPos - 2, w - 15, yPos - 2);
    
    doc.setFontSize(9);
    doc.setFont('Arial', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text('DÉTAILS DE LA COURSE', 15, yPos);
    
    yPos += 8;
    doc.setFont('Arial', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    
    if (departure) {
      doc.text('Départ:', 15, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(departure, 45, yPos);
      yPos += 7;
      doc.setTextColor(100, 100, 100);
    }
    
    if (arrival) {
      doc.text('Arrivée:', 15, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(arrival, 45, yPos);
      yPos += 7;
      doc.setTextColor(100, 100, 100);
    }
    
    if (distance) {
      doc.text('Distance:', 15, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(`${distance.toFixed(2)} km`, 45, yPos);
      yPos += 7;
      doc.setTextColor(100, 100, 100);
    }
    
    // Section 2: Payment Details
    yPos += 5;
    doc.setLineWidth(0.5);
    doc.line(15, yPos, w - 15, yPos);
    
    yPos += 8;
    doc.setFont('Arial', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    doc.text('DÉTAILS DE PAIEMENT', 15, yPos);
    
    yPos += 8;
    doc.setFont('Arial', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Méthode:', 15, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(methodLabel, 45, yPos);
    yPos += 7;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Distance:', 15, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(distance ? `${distance.toFixed(2)} km` : 'N/A', 45, yPos);
    yPos += 7;
    
    // Amount box
    yPos += 3;
    doc.setFillColor(245, 245, 245);
    doc.rect(15, yPos, w - 30, 18, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('Arial', 'normal');
    doc.text('MONTANT TOTAL', 20, yPos + 5);
    
    doc.setFontSize(22);
    doc.setFont('Arial', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`CHF ${amount.toFixed(2)}`, w - 20, yPos + 12, { align: 'right' });
    
    // Footer with complete company info
    yPos = h - 28;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(15, yPos, w - 15, yPos);
    
    yPos += 5;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('Arial', 'normal');
    doc.text('✓ Paiement confirmé', w / 2, yPos, { align: 'center' });
    
    yPos += 5;
    doc.setFontSize(7);
    doc.setFont('Arial', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('ROSINI TRANSPORTS DE PERSONNES SARL', w / 2, yPos, { align: 'center' });
    
    yPos += 4;
    doc.setFont('Arial', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('CHE-264.039.709', w / 2, yPos, { align: 'center' });
    
    yPos += 3;
    doc.text('Chemin des Bulesses 16 | 1814 La Tour-de-Peilz | Suisse', w / 2, yPos, { align: 'center' });
    
    yPos += 3;
    doc.text('Tél: +41 77 249 22 45 | info@rosini.online', w / 2, yPos, { align: 'center' });
    
    const pdfBytes = doc.output('arraybuffer');
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
    
    // Send email with PDF attachment
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    
    const boundary = 'boundary_' + Date.now();
    const emailRaw = `From: no-reply@rosini.online\r\n` +
      `To: ${clientEmail}\r\n` +
      `Subject: ROSINI TRANSPORTS\r\n` +
      `MIME-Version: 1.0\r\n` +
      `Content-Type: multipart/mixed; boundary="${boundary}"\r\n` +
      `\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: text/html; charset=UTF-8\r\n` +
      `Content-Transfer-Encoding: 8bit\r\n` +
      `\r\n` +
      `${emailBody}\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: application/pdf; name="recu.pdf"\r\n` +
      `Content-Disposition: attachment; filename="recu.pdf"\r\n` +
      `Content-Transfer-Encoding: base64\r\n` +
      `\r\n` +
      `${pdfBase64}\r\n` +
      `--${boundary}--`;
    
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