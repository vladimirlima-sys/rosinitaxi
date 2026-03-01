import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
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

    // Generate PDF
    const doc = new jsPDF();
    doc.setFont('Arial');
    
    // Header
    doc.setFillColor(245, 195, 0);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(24);
    doc.text('ROSINI TRANSPORTS DE PERSONNES', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Reçu de Course', 105, 30, { align: 'center' });
    
    // Content
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(11);
    let yPos = 50;
    
    doc.text('DÉTAILS DE LA COURSE', 20, yPos);
    yPos += 10;
    
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(10);
    if (distance) {
      doc.text(`Distance: ${distance.toFixed(2)} km`, 20, yPos);
      yPos += 8;
    }
    doc.text(`Date: ${dateStr}`, 20, yPos);
    yPos += 8;
    doc.text(`Heure: ${timeStr}`, 20, yPos);
    yPos += 15;
    
    // Amount
    doc.setFillColor(245, 245, 245);
    doc.rect(20, yPos, 170, 20, 'F');
    doc.setTextColor(245, 195, 0);
    doc.setFontSize(20);
    doc.setFont('Arial', 'bold');
    doc.text(`CHF ${amount.toFixed(2)}`, 105, yPos + 13, { align: 'center' });
    yPos += 25;
    
    // Status
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(11);
    doc.setFont('Arial', 'bold');
    doc.text('Paiement effectué', 105, yPos, { align: 'center' });
    yPos += 15;
    
    // Footer message
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.setFont('Arial', 'normal');
    doc.text('Merci d\'avoir utilisé ROSINI TRANSPORTS DE PERSONNES.', 105, yPos, { align: 'center' });
    doc.text('Ce reçu constitue la preuve de votre paiement.', 105, yPos + 5, { align: 'center' });
    
    // Bottom footer
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(8);
    doc.text('ROSINI TRANSPORTS DE PERSONNES | Reçu Numérique', 105, 275, { align: 'center' });
    doc.text('Numéro d\'enregistrement: CHE-264.039.709', 105, 280, { align: 'center' });
    doc.text('Chemin des Bulesses 16, 1814 La Tour-de-Peilz, Suisse', 105, 285, { align: 'center' });
    
    const pdfBytes = doc.output('arraybuffer');
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
    
    // Send email with PDF attachment
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');
    
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
    
    const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: btoa(emailRaw)
      })
    });

    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.statusText}`);
    }

    console.log('Travel receipt sent to:', clientEmail);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error sending travel receipt:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});