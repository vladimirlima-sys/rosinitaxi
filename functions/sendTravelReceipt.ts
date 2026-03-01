import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 11px; color: #999; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ROSINI TRANSFERT</h1>
      <p>Comprovativo de Viagem</p>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">Detalhes da Viagem</div>
        <div class="detail-row">
          <span class="label">Origem:</span>
          <span class="value">${departure || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="label">Destino:</span>
          <span class="value">${arrival || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="label">Distância:</span>
          <span class="value">${distance ? distance.toFixed(2) + ' km' : 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="label">Data:</span>
          <span class="value">${dateStr}</span>
        </div>
        <div class="detail-row">
          <span class="label">Hora:</span>
          <span class="value">${timeStr}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Método de Pagamento</div>
        <div class="detail-row">
          <span class="label">Método:</span>
          <span class="value">${methodLabel}</span>
        </div>
      </div>

      <div class="amount">CHF ${amount.toFixed(2)}</div>

      <div class="section">
        <p style="font-size: 12px; color: #999; text-align: center; margin: 20px 0;">
          Obrigado por usar ROSINI TRANSFERT. Este comprovativo constitui prova do pagamento da sua viagem.
        </p>
      </div>
    </div>

    <div class="footer">
      <p>ROSINI TRANSFERT | Comprovativo Digital</p>
      <p>Este email foi gerado automaticamente. Não responda a este email.</p>
    </div>
  </div>
</body>
</html>
    `;

    await base44.integrations.Core.SendEmail({
      to: clientEmail,
      subject: 'Comprovativo de Viagem - ROSINI TRANSFERT',
      body: emailBody
    });

    console.log('Travel receipt sent to:', clientEmail);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error sending travel receipt:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});