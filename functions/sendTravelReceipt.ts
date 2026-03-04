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
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px; }
    .header { background: #F5C300; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; color: #000; }
    .header p { margin: 5px 0 0 0; font-size: 12px; color: #333; text-transform: uppercase; letter-spacing: 1px; }
    .content { background: white; padding: 30px; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
    .detail-row:last-child { border-bottom: none; }
    .label { font-weight: bold; color: #666; }
    .value { color: #333; }
    .amount { font-size: 28px; font-weight: bold; color: #F5C300; text-align: center; padding: 20px 0; }
    .status { font-size: 14px; font-weight: bold; color: #333; text-align: center; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 11px; color: #999; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #000;">ROSINI TRANSPORTS</h1>
      <p>Reçu de Course</p>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">Détails de la Course</div>
        <div class="detail-row">
          <span class="label">Distance:</span>
          <span class="value">${distance ? distance.toFixed(2) + ' km' : 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="label">Date:</span>
          <span class="value">${dateStr}</span>
        </div>
        <div class="detail-row">
          <span class="label">Heure:</span>
          <span class="value">${timeStr}</span>
        </div>
      </div>

      <div class="amount">CHF ${amount.toFixed(2)}</div>
      
      <div class="status">Paiement effectué</div>

      <div class="section" style="margin-top: 30px;">
        <p style="font-size: 12px; color: #999; text-align: center; margin: 20px 0;">
          Merci d'avoir utilisé ROSINI TRANSPORTS DE PERSONNES. Ce reçu constitue la preuve de votre paiement.
        </p>
      </div>
    </div>

    <div class="footer">
    <p>ROSINI TRANSPORTS DE PERSONNES | Reçu Numérique</p>
    <p>CHE-264.039.709 | Chemin des Bulesses 16, 1814 La Tour-de-Peilz</p>
    <p>Cet email a été généré automatiquement. Merci de ne pas répondre à cet email.</p>
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
    
    // Section 2: Payment
    yPos += 5;
    doc.setLineWidth(0.5);
    doc.line(15, yPos, w - 15, yPos);
    
    yPos += 8;
    doc.setFont('Arial', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    doc.text('PAIEMENT', 15, yPos);
    
    yPos += 8;
    doc.setFont('Arial', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Méthode:', 15, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(methodLabel, 45, yPos);
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
    
    // Footer
    yPos = h - 20;
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
    doc.text('Rosini Transports de Personnes | CHE-264.039.709', w / 2, yPos, { align: 'center' });
    
    yPos += 4;
    doc.text('Chemin des Bulesses 16 | 1814 La Tour-de-Peilz | Suisse', w / 2, yPos, { align: 'center' });
    
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