import { jsPDF } from 'npm:jspdf@4.0.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { bookingId } = await req.json();

    if (!bookingId) {
      return Response.json({ error: 'Missing bookingId' }, { status: 400 });
    }

    // Get booking data
    const booking = await base44.asServiceRole.entities.Booking.get(bookingId);
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Header - Logo/Title
    doc.setFontSize(24);
    doc.setTextColor(34, 34, 34);
    doc.text('ROSINI', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('TRANSPORTS DE PERSONNES', margin, yPosition);
    yPosition += 12;

    // Separator
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    // Receipt title
    doc.setFontSize(16);
    doc.setTextColor(34, 34, 34);
    doc.text('RECIBO DE RESERVA', margin, yPosition);
    yPosition += 10;

    // Booking ID and date
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Referência: ${booking.id.substring(0, 8).toUpperCase()}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Data: ${new Date().toLocaleDateString('pt-PT')}`, margin, yPosition);
    yPosition += 10;

    // Client info
    doc.setFontSize(11);
    doc.setTextColor(34, 34, 34);
    doc.text('INFORMAÇÕES DO CLIENTE', margin, yPosition);
    yPosition += 7;

    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(`Nome: ${booking.client_name}`, margin + 5, yPosition);
    yPosition += 5;
    doc.text(`Email: ${booking.client_email}`, margin + 5, yPosition);
    yPosition += 5;
    doc.text(`Telefone: ${booking.client_phone}`, margin + 5, yPosition);
    yPosition += 10;

    // Trip details
    doc.setFontSize(11);
    doc.setTextColor(34, 34, 34);
    doc.text('DETALHES DA VIAGEM', margin, yPosition);
    yPosition += 7;

    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(`De: ${booking.departure_point}`, margin + 5, yPosition);
    yPosition += 5;
    doc.text(`Para: ${booking.arrival_point}`, margin + 5, yPosition);
    yPosition += 5;
    doc.text(`Data: ${booking.departure_date}`, margin + 5, yPosition);
    yPosition += 5;
    doc.text(`Hora: ${booking.departure_time}`, margin + 5, yPosition);
    yPosition += 5;
    
    const vehicleLabel = booking.vehicle_type === 'economic' ? 'Económico' : 'Conforto';
    doc.text(`Tipo de Veículo: ${vehicleLabel}`, margin + 5, yPosition);
    yPosition += 5;
    doc.text(`Passageiros: ${booking.passengers}`, margin + 5, yPosition);
    yPosition += 10;

    // Pricing breakdown
    doc.setFontSize(11);
    doc.setTextColor(34, 34, 34);
    doc.text('RESUMO FINANCEIRO', margin, yPosition);
    yPosition += 7;

    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    const baseFare = booking.total_price - (booking.extras_price || 0);
    doc.text(`Tarifa Base: CHF ${baseFare.toFixed(2)}`, margin + 5, yPosition);
    yPosition += 5;

    if (booking.extras_price > 0) {
      doc.text(`Extras: CHF ${booking.extras_price.toFixed(2)}`, margin + 5, yPosition);
      yPosition += 5;
    }

    // Total - highlighted
    doc.setFontSize(12);
    doc.setTextColor(34, 34, 34);
    doc.setFont(undefined, 'bold');
    doc.text(`Total: CHF ${booking.total_price.toFixed(2)}`, margin + 5, yPosition);
    doc.setFont(undefined, 'normal');
    yPosition += 8;

    // Payment info
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const paymentMethod = {
      stripe: 'Cartão de Crédito (Stripe)',
      cash: 'Dinheiro',
      twint: 'TWINT'
    }[booking.payment_method] || booking.payment_method;
    doc.text(`Método de Pagamento: ${paymentMethod}`, margin + 5, yPosition);
    yPosition += 5;

    const statusLabel = {
      paid: 'Pago',
      pending: 'Pendente',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado'
    }[booking.payment_status] || booking.payment_status;
    doc.text(`Status: ${statusLabel}`, margin + 5, yPosition);
    yPosition += 10;

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Esta é uma reserva confirmada. Guarde este recibo para sua segurança.', margin, pageHeight - 15);
    doc.text('Para mais informações: info@rosini.online', margin, pageHeight - 10);

    // Convert to base64
    const pdfBytes = doc.output('arraybuffer');
    const pdfBase64 = btoa(String.fromCharCode.apply(null, new Uint8Array(pdfBytes)));

    return Response.json({ success: true, pdf: pdfBase64 });
  } catch (error) {
    console.error('Error generating receipt:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});