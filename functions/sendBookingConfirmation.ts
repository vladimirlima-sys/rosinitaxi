import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();

        const { data, event } = body;

        // Only process on create events
        if (event?.type !== 'create') {
            return Response.json({ ok: true, skipped: true });
        }

        const booking = data;

        if (!booking || !booking.client_email) {
            return Response.json({ error: 'No booking data or email' }, { status: 400 });
        }

        const vehicleLabel = booking.vehicle_type === 'economic' ? 'Économique' : 'Confort';
        const price = booking.total_price ? `CHF ${booking.total_price}` : 'À confirmer';

        // Email to client
        const clientBody = `
Bonjour ${booking.client_name},

Votre réservation Rosini Transfert est confirmée !

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉTAILS DE VOTRE TRANSFERT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Trajet : ${booking.departure_point} → ${booking.arrival_point}
📅 Date : ${booking.departure_date}
🕐 Heure : ${booking.departure_time}
🚗 Véhicule : ${vehicleLabel}
👥 Passagers : ${booking.passengers || 1}
${booking.flight_number ? `✈️  Vol : ${booking.flight_number}` : ''}
${booking.distance_km ? `📏 Distance : ${booking.distance_km} km` : ''}
💰 Total : ${price}
${booking.notes ? `📝 Notes : ${booking.notes}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pour toute question, contactez-nous :
📧 taxirosini@gmail.com

Merci pour votre confiance,
L'équipe Rosini Transfert
        `.trim();

        // Email to driver/admin
        const adminBody = `
Nouvelle réservation reçue !

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLIENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nom : ${booking.client_name}
Email : ${booking.client_email}
Téléphone : ${booking.client_phone || 'Non renseigné'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRANSFERT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Trajet : ${booking.departure_point} → ${booking.arrival_point}
Date : ${booking.departure_date}
Heure : ${booking.departure_time}
Véhicule : ${vehicleLabel}
Passagers : ${booking.passengers || 1}
${booking.flight_number ? `Vol : ${booking.flight_number}` : ''}
${booking.distance_km ? `Distance : ${booking.distance_km} km` : ''}
Total : ${price}
${booking.notes ? `Notes : ${booking.notes}` : ''}
        `.trim();

        // Send both emails in parallel
        await Promise.all([
            base44.asServiceRole.integrations.Core.SendEmail({
                to: booking.client_email,
                subject: `✅ Réservation confirmée — Rosini Transfert | ${booking.departure_point} → ${booking.arrival_point}`,
                body: clientBody,
                from_name: 'Rosini Transfert',
            }),
            base44.asServiceRole.integrations.Core.SendEmail({
                to: 'taxirosini@gmail.com',
                subject: `🚗 Nouvelle réservation — ${booking.client_name} | ${booking.departure_date} ${booking.departure_time}`,
                body: adminBody,
                from_name: 'Rosini Transfert',
            }),
        ]);

        console.log(`Confirmation emails sent for booking by ${booking.client_name}`);
        return Response.json({ ok: true });
    } catch (error) {
        console.error('Error sending confirmation emails:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});