import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  const phoneRegex = /^\+?[\d\s\-()]{7,}$/;
  return phoneRegex.test(phone);
}

function validateBooking(data) {
  const errors = [];

  if (!data.client_name || data.client_name.trim().length < 2) {
    errors.push('Nome do cliente deve ter pelo menos 2 caracteres');
  }
  if (!validateEmail(data.client_email)) {
    errors.push('Email inválido');
  }
  if (!validatePhone(data.client_phone)) {
    errors.push('Telefone inválido');
  }
  if (!data.departure_point || !data.arrival_point) {
    errors.push('Pontos de partida e chegada são obrigatórios');
  }
  if (!data.departure_date || !/^\d{4}-\d{2}-\d{2}$/.test(data.departure_date)) {
    errors.push('Data inválida (YYYY-MM-DD)');
  }
  if (!data.total_price || data.total_price <= 0) {
    errors.push('Preço deve ser maior que 0');
  }

  return errors;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const bookingData = await req.json();

    // Validate booking
    const validationErrors = validateBooking(bookingData);
    if (validationErrors.length > 0) {
      return Response.json({ error: validationErrors.join('; ') }, { status: 400 });
    }

    // Create booking with validated data
    const booking = await base44.asServiceRole.entities.Booking.create({
      ...bookingData,
      client_name: bookingData.client_name.trim(),
      client_email: bookingData.client_email.toLowerCase(),
      payment_status: 'pending',
      created_date: new Date().toISOString()
    });

    console.log(`Booking created: ${booking.id}`);
    return Response.json({ success: true, booking_id: booking.id });
  } catch (error) {
    console.error('Booking creation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});