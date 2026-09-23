import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import nodemailer from 'npm:nodemailer@6.9.7';
import { google } from 'npm:googleapis@118.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { data } = body;

    if (!data) {
      return Response.json({ error: 'No booking data' }, { status: 400 });
    }

    const emailBody = `
Nova Reserva Recebida

Cliente: ${data.client_name}
Email: ${data.client_email}
Telefone: ${data.client_phone}

Trajeto:
Partida: ${data.departure_point}
Chegada: ${data.arrival_point}

Data: ${data.departure_date}
Hora: ${data.departure_time}
Distância: ${data.distance_km} km

Veículo: ${data.vehicle_type === 'comfort' ? 'COMFORT' : 'STANDARD'}
Passageiros: ${data.passengers}

Preço: CHF ${data.total_price}
Método de Pagamento: ${data.payment_method}
Status: ${data.payment_status}

${data.special_notes ? `Observações: ${data.special_notes}` : ''}

---
Reserva ID: ${data.id}
Data da Reserva: ${data.created_date}
    `.trim();

    // Get Gmail access token via OAuth connector
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    // Create nodemailer transporter with OAuth2
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: 'rosini.transfert@gmail.com',
        clientId: Deno.env.get('GMAIL_CLIENT_ID'),
        clientSecret: Deno.env.get('GMAIL_CLIENT_SECRET'),
        refreshToken: Deno.env.get('GMAIL_REFRESH_TOKEN'),
        accessToken: accessToken,
      },
    });

    await transporter.sendMail({
      from: 'Rosini Táxi <rosini.transfert@gmail.com>',
      to: 'info@rosini.online',
      subject: `Nova Reserva - ${data.client_name}`,
      text: emailBody,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error notifying company:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});