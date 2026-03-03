import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const statusMessages = {
  en_route: {
    pt: { title: '🚗 Motorista está indo...', body: 'Seu motorista saiu em direção ao ponto de partida' },
    fr: { title: '🚗 Chauffeur en route...', body: 'Votre chauffeur se dirige vers le point de départ' },
    en: { title: '🚗 Driver on the way...', body: 'Your driver is heading to the pickup point' },
  },
  arrived: {
    pt: { title: '📍 Motorista chegou!', body: 'Seu motorista chegou ao ponto de partida. Prepare-se!' },
    fr: { title: '📍 Chauffeur arrivé!', body: 'Votre chauffeur est arrivé au point de départ. Préparez-vous!' },
    en: { title: '📍 Driver arrived!', body: 'Your driver has arrived at the pickup point. Get ready!' },
  },
  in_progress: {
    pt: { title: '⚡ Corrida iniciada', body: 'Sua corrida começou. Aproveite a viagem!' },
    fr: { title: '⚡ Trajet commencé', body: 'Votre trajet a commencé. Bon voyage!' },
    en: { title: '⚡ Trip started', body: 'Your trip has started. Enjoy the ride!' },
  },
  completed: {
    pt: { title: '✅ Corrida concluída', body: 'Obrigado por usar Rosini Transfert. Deixe uma avaliação!' },
    fr: { title: '✅ Trajet terminé', body: 'Merci d\'avoir utilisé Rosini Transfert. Laissez un avis!' },
    en: { title: '✅ Trip completed', body: 'Thank you for using Rosini Transfert. Leave a review!' },
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { booking_id, status } = await req.json();

    if (!booking_id || !status) {
      return Response.json({ error: 'Missing booking_id or status' }, { status: 400 });
    }

    // Fetch booking details
    const booking = await base44.asServiceRole.entities.Booking.get(booking_id);
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    const { client_email, client_phone, client_name, language = 'fr' } = booking;
    const messages = statusMessages[status]?.[language] || statusMessages[status]?.['fr'];

    if (!messages) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Send WhatsApp notification
    if (client_phone) {
      try {
        const formattedPhone = `whatsapp:+${client_phone.replace(/\D/g, '')}`;
        await base44.asServiceRole.functions.invoke('sendTwilio', {
          phone_number: formattedPhone,
          message: `${messages.title}\n${messages.body}`,
        });
        console.log(`WhatsApp sent to ${formattedPhone}`);
      } catch (waErr) {
        console.error('WhatsApp notification failed:', waErr.message);
      }
    }

    // Send Email notification
    if (client_email) {
      try {
        const emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">${messages.title}</h2>
            <p style="color: #666; font-size: 16px;">${messages.body}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">Rosini Transfert</p>
          </div>
        `;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: client_email,
          subject: messages.title,
          body: emailBody,
        });
        console.log(`Email sent to ${client_email}`);
      } catch (emailErr) {
        console.error('Email notification failed:', emailErr.message);
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in notifyRideStatusUpdate:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});