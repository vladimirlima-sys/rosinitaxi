import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const { booking_id, client_phone, client_name, departure_point, tracking_link, status } = await req.json();

    if (!booking_id || !client_phone || !status) {
      return Response.json(
        { error: 'Missing required fields: booking_id, client_phone, status' },
        { status: 400 }
      );
    }

    // Only send for en_route and arrived
    if (!['en_route', 'arrived'].includes(status)) {
      return Response.json({ success: true, skipped: true });
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

    // Format phone number
    let formattedPhone = client_phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    // Template configuration
    const templates = {
      'en_route': {
        sid: 'HX905b87dda9be5608efd829b75d588118',
        variables: [client_name || '', departure_point || '', tracking_link || '']
      },
      'arrived': {
        sid: 'HX57b573cd1d0f5875c54cc0b145c73281',
        variables: [client_name || '', departure_point || '']
      }
    };

    const template = templates[status];
    if (!template) {
      return Response.json({ success: true, skipped: true });
    }

    // Send WhatsApp template via Twilio
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const bodyParams = new URLSearchParams({
      'From': whatsappFrom,
      'To': formattedPhone,
      'ContentSid': template.sid
    });

    // Add template variables
    template.variables.forEach((variable, index) => {
      bodyParams.append(`ContentVariables`, JSON.stringify({ [index + 1]: variable }));
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: bodyParams.toString()
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Twilio error:', data);
      return Response.json(
        { error: 'Failed to send WhatsApp', details: data },
        { status: 500 }
      );
    }

    console.log('WhatsApp template sent:', data.sid);
    return Response.json({ success: true, message_sid: data.sid });

  } catch (error) {
    console.error('Error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});