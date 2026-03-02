import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { driverId, month, year } = await req.json();

    // Fetch driver info
    const drivers = await base44.entities.Driver.filter({ id: driverId });
    if (!drivers || drivers.length === 0) {
      return Response.json({ error: 'Chauffeur introuvable' }, { status: 404 });
    }

    const driverData = drivers[0];

    // Fetch company settings
    const companySettings = await base44.entities.CompanySettings.list();
    const company = companySettings.length > 0 ? companySettings[0] : null;

    // Fetch payroll settings
    const payrollSettings = await base44.entities.DriverPayrollSettings.filter({ driver_id: driverId });
    if (!payrollSettings || payrollSettings.length === 0) {
      return Response.json({ error: 'Paramètres de salaire introuvables' }, { status: 404 });
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

    const monthNames = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    // Header with company info
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('ROSINI', 20, 20);
    
    if (company) {
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.text(company.company_address || '', 20, 26);
      doc.text(`CHE: ${company.registration_number || ''}`, 20, 30);
      doc.text(`Tél: ${company.phone || ''} | Email: ${company.email || ''}`, 20, 34);
    }
    
    doc.line(20, 36, 190, 36);
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('BULLETIN DE SALAIRE', 20, 45);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Période: ${monthNames[month]} ${year}`, 20, 52);
    doc.text(`Date d'émission: ${new Date().toLocaleDateString('fr-CH')}`, 20, 58);
    
    doc.line(20, 62, 190, 62);

    let y = 70;

    // Employee info section
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('INFORMATIONS DU CHAUFFEUR', 20, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Nom: ${driverData.name || 'N/A'}`, 25, y);
    y += 6;
    doc.text(`Email: ${driverData.email || 'N/A'}`, 25, y);
    y += 6;
    doc.text(`Téléphone: ${driverData.phone || 'N/A'}`, 25, y);
    y += 6;
    doc.text(`Adresse: ${driverData.address || 'N/A'}`, 25, y);
    y += 6;
    doc.text(`Numéro AVS: ${driverData.avs_number || 'N/A'}`, 25, y);
    y += 6;
    doc.text(`Véhicule: ${driverData.vehicle || 'N/A'}`, 25, y);
    y += 6;
    doc.text(`Permis: ${driverData.license_number || 'N/A'}`, 25, y);
    y += 14;

    // Income section
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('REVENUS', 20, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Nombre de trajets: ${monthBookings.length}`, 25, y);
    y += 6;
    doc.text(`Taux horaire: CHF ${settings.hourly_rate?.toFixed(2) || '0.00'}/h`, 25, y);
    y += 6;
    doc.text(`Total brut: CHF ${grossAmount.toFixed(2)}`, 25, y, { fontStyle: 'bold' });
    y += 14;

    // Deductions section with detailed breakdown
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('DÉDUCTIONS SOCIALES', 20, y);
    y += 8;
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    
    const deductions = [
      { label: 'AVS (Assurance-Vieillesse)', percentage: settings.avs_percentage, amount: avsAmount },
      { label: 'AI (Assurance-Invalidité)', percentage: settings.ai_percentage, amount: aiAmount },
      { label: 'APG (Assurance-Placement Gratuit)', percentage: settings.apg_percentage, amount: apgAmount },
      { label: 'AC (Assurance-Chômage)', percentage: settings.ac_percentage, amount: acAmount },
      { label: 'LAA (Assurance-Accidents)', percentage: settings.laa_percentage, amount: laaAmount },
      { label: 'LPP (Prévoyance Professionnelle)', percentage: settings.lpp_percentage, amount: lppAmount },
      { label: 'Impôt à la Source', percentage: settings.impot_source_percentage, amount: impotAmount }
    ];

    deductions.forEach(ded => {
      if (ded.percentage > 0) {
        doc.text(`${ded.label} (${ded.percentage}%): CHF ${ded.amount.toFixed(2)}`, 25, y);
        y += 5;
      }
    });

    y += 3;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(`Total déductions: CHF ${totalDeductions.toFixed(2)}`, 25, y);
    y += 14;

    // Summary section with box
    doc.setFillColor(240, 240, 240);
    doc.rect(20, y - 2, 170, 24, 'F');
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('RÉSUMÉ', 20, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total brut: CHF ${grossAmount.toFixed(2)}`, 25, y);
    y += 6;
    doc.text(`Total déductions: CHF ${totalDeductions.toFixed(2)}`, 25, y);
    y += 10;
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text(`SALAIRE NET: CHF ${netAmount.toFixed(2)}`, 25, y);

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