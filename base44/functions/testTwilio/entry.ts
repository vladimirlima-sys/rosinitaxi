Deno.serve(async (req) => {
  try {
    const { phone_number, message } = await req.json();

    if (!phone_number || !message) {
      return Response.json({ error: 'Missing phone_number or message' }, { status: 400 });
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const from = Deno.env.get('TWILIO_WHATSAPP_FROM');

    // Format phone number: ensure whatsapp: prefix
    const formattedTo = phone_number.includes('whatsapp:') ? phone_number : `whatsapp:+${phone_number.replace(/\D/g, '')}`;

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: from,
        To: formattedTo,
        Body: message
      }).toString(),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Twilio error:', result);
      return Response.json({
        success: false,
        error: result.message || 'Failed to send message',
        details: result
      }, { status: 400 });
    }

    console.log('WhatsApp message sent:', result.sid);
    return Response.json({
      success: true,
      message_id: result.sid,
      status: result.status,
      to: result.to
    });
  } catch (error) {
    console.error('Test error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});