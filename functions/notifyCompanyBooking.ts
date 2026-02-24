import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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

    await base44.integrations.Core.SendEmail({
      to: 'info@taxirosini.com',
      subject: `Nova Reserva - ${data.client_name}`,
      body: emailBody,
      from_name: 'Rosini Táxi'
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error notifying company:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});