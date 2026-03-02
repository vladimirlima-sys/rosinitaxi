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

    // Calculate gross amount
    const grossAmount = monthBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
    
    // Calculate deductions
    const avsAiApg = (grossAmount * (settings.avs_percentage + settings.ai_percentage + settings.apg_percentage)) / 100;
    const lpcFam = (grossAmount * 0.06) / 100; // LPC/Fam (VD)
    const ac = (grossAmount * settings.ac_percentage) / 100;
    const aanp = (grossAmount * 2.114) / 100; // AANP code A1
    const lpp = (grossAmount * settings.lpp_percentage) / 100;
    const impot = (grossAmount * settings.impot_source_percentage) / 100;
    
    const totalDeductions = avsAiApg + lpcFam + ac + aanp + lpp + impot;
    const netAmount = grossAmount - totalDeductions;

    // Generate PDF using professional layout
    const { jsPDF } = await import('npm:jspdf@4.0.0');
    const doc = new jsPDF();

    const monthNames = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const monthName = monthNames[month];

    // === HEADER ===
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(company?.company_name || 'ROSINI', 20, 12);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(company?.company_address || '', 20, 16);
    
    // Right side header
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Tél.', 160, 12);
    doc.text('1004 Lausanne', 160, 16);

    // === TITLE ===
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Bulletin de salaire ${monthName} ${year}`, 20, 22);
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`Imprimé le ${new Date().toLocaleDateString('fr-CH')} Page 1 / 1`, 160, 22);

    // === EMPLOYEE NAME ===
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(driverData.name || 'N/A', 20, 28);

    // === EMPLOYEE ADDRESS (right side) ===
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('Monsieur', 120, 28);
    doc.text(driverData.name || 'N/A', 120, 32);
    doc.text(driverData.address || '', 120, 36);
    doc.text('1205 Genève', 120, 40);

    // === SALARY INFO ===
    doc.setFontSize(9);
    doc.text(`Numéro assurance sociale: ${driverData.avs_number || 'N/A'}`, 20, 35);
    doc.text(`Période de salaire: 01.${String(month).padStart(2, '0')}.${year} - ${new Date(year, month, 0).getDate()}.${String(month).padStart(2, '0')}.${year}`, 20, 39);

    // === INCOME TABLE ===
    let y = 48;
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    
    // Header row
    doc.rect(20, y - 5, 170, 6);
    doc.text('GS', 22, y);
    doc.text('Texte', 35, y);
    doc.text('Déterminant', 70, y);
    doc.text('Taux/Qté', 95, y);
    doc.text('AVS', 115, y);
    doc.text('LAA', 135, y);
    doc.text('BRUT', 155, y);

    y += 8;
    doc.setFont(undefined, 'normal');
    
    // Salaire mensuel
    doc.text('1000.', 22, y);
    doc.text('Salaire mensuel', 35, y);
    doc.text(grossAmount.toFixed(2), 70, y, { align: 'right' });
    doc.text('8.333333', 95, y, { align: 'right' });
    doc.text(grossAmount.toFixed(2), 115, y, { align: 'right' });
    doc.text(grossAmount.toFixed(2), 135, y, { align: 'right' });
    doc.text(grossAmount.toFixed(2), 155, y, { align: 'right' });
    
    y += 6;
    doc.text('1200.', 22, y);
    doc.text('13e salaire', 35, y);
    
    y += 6;
    doc.setFont(undefined, 'bold');
    doc.text('Totaux', 35, y);
    doc.text(grossAmount.toFixed(2), 70, y, { align: 'right' });
    doc.text(grossAmount.toFixed(2), 115, y, { align: 'right' });
    doc.text(grossAmount.toFixed(2), 135, y, { align: 'right' });
    doc.text(grossAmount.toFixed(2), 155, y, { align: 'right' });

    // === DEDUCTIONS TABLE ===
    y += 12;
    doc.setFont(undefined, 'bold');
    
    // Header row
    doc.rect(20, y - 5, 170, 6);
    doc.text('GS', 22, y);
    doc.text('Déductions', 35, y);
    doc.text('Déterminant', 70, y);
    doc.text('Taux/Qté', 95, y);
    doc.text('Pt 9 cert. sal.', 120, y);
    doc.text('Charges soc.', 145, y);
    doc.text('Valeur', 160, y);

    y += 8;
    doc.setFont(undefined, 'normal');
    
    // Cotisation AVS/AI/APG
    doc.text('5010.', 22, y);
    doc.text('Cotisation AVS/AI/APG', 35, y);
    doc.text(grossAmount.toFixed(2), 70, y, { align: 'right' });
    doc.text('5.30', 95, y, { align: 'right' });
    doc.text((avsAiApg * -1).toFixed(2), 120, y, { align: 'right' });
    doc.text((avsAiApg * -1).toFixed(2), 145, y, { align: 'right' });
    doc.text((avsAiApg * -1).toFixed(2), 160, y, { align: 'right' });
    
    y += 6;
    doc.text('5016.', 22, y);
    doc.text('Contribution LPC/Fam (VD)', 35, y);
    doc.text(grossAmount.toFixed(2), 70, y, { align: 'right' });
    doc.text('0.06', 95, y, { align: 'right' });
    doc.text((lpcFam * -1).toFixed(2), 160, y, { align: 'right' });
    
    y += 6;
    doc.text('5020.', 22, y);
    doc.text('Cotisation AC', 35, y);
    doc.text(grossAmount.toFixed(2), 70, y, { align: 'right' });
    doc.text('1.10', 95, y, { align: 'right' });
    doc.text((ac * -1).toFixed(2), 120, y, { align: 'right' });
    doc.text((ac * -1).toFixed(2), 145, y, { align: 'right' });
    doc.text((ac * -1).toFixed(2), 160, y, { align: 'right' });
    
    y += 6;
    doc.text('5025.1', 22, y);
    doc.text('Cotisation AANP (code A1)', 35, y);
    doc.text(grossAmount.toFixed(2), 70, y, { align: 'right' });
    doc.text('2.114', 95, y, { align: 'right' });
    doc.text((aanp * -1).toFixed(2), 120, y, { align: 'right' });
    doc.text((aanp * -1).toFixed(2), 145, y, { align: 'right' });
    doc.text((aanp * -1).toFixed(2), 160, y, { align: 'right' });
    
    y += 6;
    doc.text('5050.', 22, y);
    doc.text('Cotisation LPP', 35, y);
    doc.text((grossAmount * 0.53).toFixed(2), 70, y, { align: 'right' });
    doc.text('7.00', 95, y, { align: 'right' });
    doc.text((lpp * -1).toFixed(2), 160, y, { align: 'right' });
    
    y += 6;
    doc.text('5060.', 22, y);
    doc.text('Retenue impôt à la source (GE-A0N)', 35, y);
    doc.text(grossAmount.toFixed(2), 70, y, { align: 'right' });
    doc.text('6.37', 95, y, { align: 'right' });
    doc.text((impot * -1).toFixed(2), 160, y, { align: 'right' });
    
    y += 8;
    doc.setFont(undefined, 'bold');
    doc.text('Totaux', 35, y);
    doc.text((totalDeductions * -1).toFixed(2), 120, y, { align: 'right' });
    doc.text((totalDeductions * -1).toFixed(2), 145, y, { align: 'right' });
    doc.text((totalDeductions * -1).toFixed(2), 160, y, { align: 'right' });

    // === NET AMOUNT BOX ===
    y += 10;
    doc.setFillColor(240, 240, 240);
    doc.rect(120, y - 4, 70, 8, 'F');
    doc.setFont(undefined, 'bold');
    doc.text('Montant versé', 125, y);
    doc.text(netAmount.toFixed(2), 175, y, { align: 'right' });

    // === FOOTER ===
    y = 270;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`Lausanne, le ${new Date().toLocaleDateString('fr-CH').split(' ')[0]} ${monthName} ${year}`, 20, y);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(company?.company_name || 'ROSINI', 160, y);

    const pdfBytes = doc.output('arraybuffer');
    
    // Upload PDF file
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const file = new File([blob], `bulletin-salaire-${driverId}-${month}-${year}.pdf`, { type: 'application/pdf' });
    
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
        'Content-Disposition': `attachment; filename=bulletin-salaire-${month}-${year}.pdf`
      }
    });
  } catch (error) {
    console.error('Erro ao gerar ficha de salário:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});