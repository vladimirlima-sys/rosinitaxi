import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const getStatusMessage = (status, lang = 'pt') => {
  const messages = {
    pt: {
      pending: {
        subject: 'Reserva Pendente - Aguardando Confirmação',
        title: 'Sua Reserva está Pendente',
        message: 'Sua reserva foi criada com sucesso, mas aguarda confirmação de pagamento.',
        action: 'Por favor, finalize o pagamento para confirmar sua reserva.'
      },
      paid: {
        subject: '✅ Reserva Confirmada - Pagamento Recebido',
        title: 'Reserva Confirmada!',
        message: 'Seu pagamento foi recebido e sua reserva está confirmada.',
        action: 'Guarde esta confirmação. Nosso motorista entrará em contato em breve.'
      },
      in_progress: {
        subject: '🚗 Sua Reserva está em Andamento',
        title: 'Transferência em Andamento',
        message: 'Seu motorista está a caminho. Prepare-se para partir!',
        action: 'Se tiver dúvidas, entre em contato conosco.'
      },
      completed: {
        subject: '✨ Transferência Concluída',
        title: 'Obrigado por usar nossos serviços!',
        message: 'Sua transferência foi concluída com sucesso.',
        action: 'Avalie sua experiência e deixe um comentário. Sua opinião é importante!'
      },
      cancelled: {
        subject: '❌ Reserva Cancelada',
        title: 'Reserva Cancelada',
        message: 'Sua reserva foi cancelada.',
        action: 'Se tiver dúvidas, entre em contato conosco.'
      }
    },
    fr: {
      pending: {
        subject: 'Réservation En Attente - En Attente de Confirmation',
        title: 'Votre Réservation est En Attente',
        message: 'Votre réservation a été créée avec succès, mais attend une confirmation de paiement.',
        action: 'Veuillez finaliser le paiement pour confirmer votre réservation.'
      },
      paid: {
        subject: '✅ Réservation Confirmée - Paiement Reçu',
        title: 'Réservation Confirmée!',
        message: 'Votre paiement a été reçu et votre réservation est confirmée.',
        action: 'Gardez cette confirmation. Notre chauffeur vous contactera bientôt.'
      },
      in_progress: {
        subject: '🚗 Votre Réservation est en Cours',
        title: 'Transfert en Cours',
        message: 'Votre chauffeur est en route. Préparez-vous à partir!',
        action: 'Si vous avez des questions, contactez-nous.'
      },
      completed: {
        subject: '✨ Transfert Terminé',
        title: 'Merci d\'avoir utilisé nos services!',
        message: 'Votre transfert a été complété avec succès.',
        action: 'Évaluez votre expérience et laissez un commentaire. Votre avis est important!'
      },
      cancelled: {
        subject: '❌ Réservation Annulée',
        title: 'Réservation Annulée',
        message: 'Votre réservation a été annulée.',
        action: 'Si vous avez des questions, contactez-nous.'
      }
    }
  };

  return messages[lang]?.[status] || messages['pt'][status];
};

const generateEmailHTML = (booking, statusInfo) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0A0A0A, #1a1a1a); color: #C9A96E; padding: 30px; border-radius: 8px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 300; }
    .content { padding: 30px; background: #f9f9f9; margin: 20px 0; border-radius: 8px; }
    .booking-details { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #C9A96E; border-radius: 4px; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-weight: 600; color: #666; }
    .detail-value { color: #333; }
    .footer { text-align: center; color: #999; font-size: 12px; padding: 20px; }
    .button { display: inline-block; background: #C9A96E; color: #0A0A0A; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin: 10px 0; }
    .status-pending { background: #fff3cd; color: #856404; }
    .status-paid { background: #d4edda; color: #155724; }
    .status-in_progress { background: #cce5ff; color: #004085; }
    .status-completed { background: #d4edda; color: #155724; }
    .status-cancelled { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚗 ROSINI Transfert</h1>
    </div>

    <div class="content">
      <h2 style="color: #0A0A0A; font-size: 20px; margin-top: 0;">${statusInfo.title}</h2>
      <p>${statusInfo.message}</p>
      <p><strong>${statusInfo.action}</strong></p>
      
      <div class="status-badge status-${booking.payment_status}">
        ${booking.payment_status === 'pending' ? '⏳ Pendente' : 
          booking.payment_status === 'paid' ? '✅ Confirmada' :
          booking.payment_status === 'cancelled' ? '❌ Cancelada' : 'Em Andamento'}
      </div>

      <div class="booking-details">
        <h3 style="margin-top: 0; color: #C9A96E;">Detalhes da Reserva</h3>
        <div class="detail-row">
          <span class="detail-label">Confirmação:</span>
          <span class="detail-value">#${booking.id.substring(0, 8).toUpperCase()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Passageiro:</span>
          <span class="detail-value">${booking.client_name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Data:</span>
          <span class="detail-value">${new Date(booking.departure_date).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Horário:</span>
          <span class="detail-value">${booking.departure_time}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Trajeto:</span>
          <span class="detail-value">${booking.departure_point} → ${booking.arrival_point}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Distância:</span>
          <span class="detail-value">${booking.distance_km} km</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Valor:</span>
          <span class="detail-value" style="color: #C9A96E; font-weight: 600;">CHF ${booking.total_price}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>ROSINI Transfert<br>
      Telefone: +41 79 650 53 47<br>
      © 2026 Todos os direitos reservados</p>
    </div>
  </div>
</body>
</html>
  `;
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    // Só processar eventos de update
    if (event.type !== 'update') {
      return Response.json({ success: true });
    }

    // Não enviar notificação se o status não mudou
    if (!data || !data.payment_status) {
      return Response.json({ success: true });
    }

    const booking = data;
    const status = booking.payment_status;

    // Determinar idioma baseado no e-mail (simplificado - assume PT por padrão)
    const lang = 'pt';
    const statusInfo = getStatusMessage(status, lang);

    // Gerar HTML do e-mail
    const emailHTML = generateEmailHTML(booking, statusInfo);

    // Enviar e-mail via Gmail connector
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');

    const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: btoa(
          `From: no-reply@rosini.online\r\n` +
          `To: ${booking.client_email}\r\n` +
          `Subject: ${statusInfo.subject}\r\n` +
          `MIME-Version: 1.0\r\n` +
          `Content-Type: text/html; charset=utf-8\r\n` +
          `\r\n` +
          emailHTML
        )
      })
    });

    if (!response.ok) {
      console.error('Gmail API error:', await response.text());
      return Response.json({ success: false, error: 'Failed to send email' }, { status: 500 });
    }

    return Response.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Notification error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});