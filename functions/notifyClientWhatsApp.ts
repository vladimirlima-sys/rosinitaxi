import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const { booking_id, client_phone, status, message } = await req.json();

    if (!booking_id || !client_phone || !status) {
      return Response.json(
        { error: 'Missing required fields: booking_id, client_phone, status' },
        { status: 400 }
      );
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const whatsappFrom = Deno.env.get('TWILIO_WHATSAPP_FROM');

    if (!accountSid || !authToken || !whatsappFrom) {
      return Response.json(
        { error: 'Twilio credentials not configured' },
        { status: 500 }
      );
    }

    // Format phone number (add +55 if Brazilian, or adjust as needed)
    let formattedPhone = client_phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    // Build WhatsApp message based on status
    const statusMessages = {
      'en_route': `Seu motorista já está a caminho para buscá-lo! 🚗\n\n${message || 'Tempo estimado: alguns minutos'}`,
      'arrived': `Seu motorista chegou ao local de partida! 📍\n\n${message || 'Por favor, se dirija ao veículo'}`,
      'completed': `Sua corrida foi finalizada com sucesso! ✅\n\n${message || 'Obrigado por usar Rosini Transfert'}`
    };

    const whatsappMessage = statusMessages[status] || message || 'Atualização sobre sua corrida';

    // Send WhatsApp via Twilio
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'From': whatsappFrom,
        'To': formattedPhone,
        'Body': whatsappMessage
      }).toString()
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Twilio error:', data);
      return Response.json(
        { error: 'Failed to send WhatsApp', details: data },
        { status: 500 }
      );
    }

    console.log('WhatsApp sent:', data.sid);
    return Response.json({ success: true, message_sid: data.sid });

  } catch (error) {
    console.error('Error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});