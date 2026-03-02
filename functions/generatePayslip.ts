import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { driverId, month, year } = await req.json();

    // Fetch driver info
    const driver = await base44.entities.Driver.list({ id: driverId }, undefined, 1);
    if (!driver || driver.length === 0) {
      return Response.json({ error: 'Motorista não encontrado' }, { status: 404 });
    }

    const driverData = driver[0];

    // Fetch payroll settings
    const payrollSettings = await base44.entities.DriverPayrollSettings.filter({ driver_id: driverId }, undefined, 1);
    if (!payrollSettings || payrollSettings.length === 0) {
      return Response.json({ error: 'Configurações de salário não encontradas' }, { status: 404 });
    }

    const settings = payrollSettings[0];

    // Fetch bookings for the month
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const allBookings = await base44.entities.Booking.list();
    const monthBookings = allBookings.filter(b => {
      const bookingMonth = b.departure_date ? b.departure_date.substring(0, 7) : b.created_date.substring(0, 7);
      return bookingMonth === monthStr && b.driver_id === driverId && b.payment_status === 'paid';
    });

    // Calculate totals
    const grossAmount = monthBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
    
    // Calculate deductions
    const avsAmount = (grossAmount * settings.avs_percentage) / 100;
    const aiAmount = (grossAmount * settings.ai_percentage) / 100;
    const apgAmount = (grossAmount * settings.apg_percentage) / 100;
    const acAmount = (grossAmount * settings.ac_percentage) / 100;
    const laaAmount = (grossAmount * settings.laa_percentage) / 100;
    const lppAmount = (grossAmount * settings.lpp_percentage) / 100;
    const impotAmount = (grossAmount * settings.impot_source_percentage) / 100;
    
    const totalDeductions = avsAmount + aiAmount + apgAmount + acAmount + laaAmount + lppAmount + impotAmount;
    const netAmount = grossAmount - totalDeductions;

    // Generate PDF
    const { jsPDF } = await import('npm:jspdf@4.0.0');
    const doc = new jsPDF();

    const monthNames = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    // Header
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('ROSINI', 20, 20);
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('FICHA DE SALÁRIO', 20, 32);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Período: ${monthNames[month]} de ${year}`, 20, 42);
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-PT')}`, 20, 49);
    
    doc.line(20, 52, 190, 52);

    let y = 62;

    // Employee info
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('INFORMAÇÕES DO MOTORISTA', 20, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Nome: ${driverData.name}`, 25, y);
    y += 6;
    doc.text(`Email: ${driverData.email || 'N/A'}`, 25, y);
    y += 6;
    doc.text(`Telefone: ${driverData.phone || 'N/A'}`, 25, y);
    y += 12;

    // Income section
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('RENDIMENTOS', 20, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Número de corridas: ${monthBookings.length}`, 25, y);
    y += 6;
    doc.text(`Total Bruto: CHF ${grossAmount.toFixed(2)}`, 25, y);
    y += 12;

    // Deductions section
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('DEDUÇÕES', 20, y);
    y += 8;
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    
    const deductions = [
      { label: 'AVS', amount: avsAmount },
      { label: 'AI', amount: aiAmount },
      { label: 'APG', amount: apgAmount },
      { label: 'AC', amount: acAmount },
      { label: 'LAA', amount: laaAmount },
      { label: 'LPP', amount: lppAmount },
      { label: 'Impôt à la Source', amount: impotAmount }
    ];

    deductions.forEach(ded => {
      if (ded.amount > 0) {
        doc.text(`${ded.label}: CHF ${ded.amount.toFixed(2)}`, 25, y);
        y += 5;
      }
    });

    y += 2;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Deduções: CHF ${totalDeductions.toFixed(2)}`, 25, y);
    y += 10;

    // Summary section
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('RESUMO', 20, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Bruto: CHF ${grossAmount.toFixed(2)}`, 25, y);
    y += 6;
    doc.text(`Total Deduções: CHF ${totalDeductions.toFixed(2)}`, 25, y);
    y += 8;
    
    doc.setFont(undefined, 'bold');
    doc.text(`SALÁRIO LÍQUIDO: CHF ${netAmount.toFixed(2)}`, 25, y);

    const pdfBytes = doc.output('arraybuffer');
    
    // Upload PDF file
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const file = new File([blob], `payslip-${driverId}-${month}-${year}.pdf`, { type: 'application/pdf' });
    
    const uploadResponse = await base44.integrations.Core.UploadFile({ file });
    
    // Save payslip record
    await base44.asServiceRole.entities.PayslipRecord.create({
      driver_id: driverId,
      driver_name: driverData.name,
      month: month,
      year: year,
      gross_amount: grossAmount,
      net_amount: netAmount,
      total_deductions: totalDeductions,
      pdf_url: uploadResponse.file_url,
      driver_email: driverData.email,
      sent_to_driver: false
    });
    
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=ficha-salario-${month}-${year}.pdf`
      }
    });
  } catch (error) {
    console.error('Erro ao gerar ficha de salário:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});