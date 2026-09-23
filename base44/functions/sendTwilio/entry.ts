import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { phone_number, message } = body;

    if (!phone_number || !message) {
      return Response.json({ success: false, error: 'Missing phone_number or message' }, { status: 400 });
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_WHATSAPP_FROM');

    if (!accountSid || !authToken || !fromNumber) {
      return Response.json({ success: false, error: 'Missing Twilio credentials' }, { status: 500 });
    }

    const auth = btoa(`${accountSid}:${authToken}`);

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'From': fromNumber,
        'To': phone_number,
        'Body': message,
      }).toString(),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error('Twilio error:', error);
      return Response.json({ success: false, error: error.message || 'Twilio API error', details: error }, { status: res.status });
    }

    const data = await res.json();
    console.log('WhatsApp message sent:', data.sid);

    return Response.json({ success: true, message_id: data.sid, status: data.status });
  } catch (error) {
    console.error('Error in sendTwilio:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});