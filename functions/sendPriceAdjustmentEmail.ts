import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const translations = {
  fr: {
    subject: 'Ajustement de tarif - Confirmation requise',
    title: 'Modification du tarif de votre course',
    message: 'Votre course a été modifiée. Cliquez sur le lien ci-dessous pour confirmer le paiement supplémentaire.',
    old_price: 'Tarif initial',
    new_price: 'Nouveau tarif',
    difference: 'Montant supplémentaire',
    from_to: 'de {from} à {to}',
    button: 'Confirmer et payer',
    footer: 'Merci de votre confiance !',
  },
  pt: {
    subject: 'Ajuste de tarifa - Confirmação necessária',
    title: 'Modificação da tarifa de sua viagem',
    message: 'Sua viagem foi modificada. Clique no link abaixo para confirmar o pagamento adicional.',
    old_price: 'Tarifa inicial',
    new_price: 'Nova tarifa',
    difference: 'Valor adicional',
    from_to: 'de {from} para {to}',
    button: 'Confirmar e pagar',
    footer: 'Obrigado pela sua confiança!',
  },
  en: {
    subject: 'Price Adjustment - Confirmation Required',
    title: 'Your ride price has been adjusted',
    message: 'Your ride has been modified. Click the link below to confirm the additional payment.',
    old_price: 'Initial price',
    new_price: 'New price',
    difference: 'Additional amount',
    from_to: 'from {from} to {to}',
    button: 'Confirm and pay',
    footer: 'Thank you for your trust!',
  },
  de: {
    subject: 'Preisanpassung - Bestätigung erforderlich',
    title: 'Ihr Fahrtpreis wurde angepasst',
    message: 'Ihre Fahrt wurde geändert. Klicken Sie auf den Link unten, um die zusätzliche Zahlung zu bestätigen.',
    old_price: 'Anfänglicher Preis',
    new_price: 'Neuer Preis',
    difference: 'Zusätzlicher Betrag',
    from_to: 'von {from} nach {to}',
    button: 'Bestätigen und bezahlen',
    footer: 'Danke für Ihr Vertrauen!',
  },
  it: {
    subject: 'Adeguamento del prezzo - Conferma richiesta',
    title: 'Il prezzo del vostro viaggio è stato adeguato',
    message: 'Il vostro viaggio è stato modificato. Fate clic sul link sottostante per confermare il pagamento aggiuntivo.',
    old_price: 'Prezzo iniziale',
    new_price: 'Nuovo prezzo',
    difference: 'Importo aggiuntivo',
    from_to: 'da {from} a {to}',
    button: 'Conferma e paga',
    footer: 'Grazie per la vostra fiducia!',
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const {
      client_name,
      client_email,
      booking_id,
      old_price,
      new_price,
      difference,
      payment_url,
      departure_point,
      arrival_point,
      language = 'fr',
    } = body;

    const t = translations[language] || translations['fr'];

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #F5C300; padding: 20px; text-align: center; border-radius: 8px; }
            .header h1 { margin: 0; color: black; font-size: 24px; }
            .content { background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .price-box { background-color: white; border-left: 4px solid #F5C300; padding: 15px; margin: 15px 0; }
            .price-row { display: flex; justify-content: space-between; margin: 8px 0; }
            .price-label { font-weight: bold; }
            .price-amount { color: #F5C300; font-weight: bold; font-size: 18px; }
            .button { display: inline-block; background-color: #F5C300; color: black; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; font-size: 12px; color: #999; margin-top: 20px; }
            .route { color: #666; font-size: 14px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ROSINI</h1>
              <p style="margin: 5px 0; color: #666;">Transports de Personnes</p>
            </div>

            <div class="content">
              <p>Cher(e) ${client_name},</p>
              
              <p>${t.message}</p>

              <div class="route">
                <strong>${t.from_to.replace('{from}', departure_point).replace('{to}', arrival_point)}</strong>
              </div>

              <div class="price-box">
                <div class="price-row">
                  <span class="price-label">${t.old_price}:</span>
                  <span class="price-amount">CHF ${old_price.toFixed(2)}</span>
                </div>
                <div class="price-row">
                  <span class="price-label">${t.new_price}:</span>
                  <span class="price-amount" style="color: #d32f2f;">CHF ${new_price.toFixed(2)}</span>
                </div>
                <hr style="border: none; border-top: 1px solid #eee; margin: 10px 0;">
                <div class="price-row">
                  <span class="price-label">${t.difference}:</span>
                  <span class="price-amount">CHF ${difference.toFixed(2)}</span>
                </div>
              </div>

              <div style="text-align: center;">
                <a href="${payment_url}" class="button">${t.button}</a>
              </div>

              <p style="font-size: 12px; color: #999;">
                Si vous avez des questions, contactez-nous à info@rosini.online ou +41 77 249 22 45
              </p>
            </div>

            <div class="footer">
              <p>${t.footer}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Get Gmail access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    
    // Send via Gmail API
    const gmailBody = emailHtml;
    const encodedEmail = Buffer.from(`To: ${client_email}\r\nSubject: ${t.subject}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${gmailBody}`).toString('base64');
    
    const gmailResponse = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedEmail,
      }),
    });

    if (!gmailResponse.ok) {
      throw new Error(`Gmail API error: ${await gmailResponse.text()}`);
    }

    console.log(`Price adjustment email sent to ${client_email} for booking ${booking_id}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Send email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});