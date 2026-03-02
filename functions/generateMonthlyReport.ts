import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get current month in YYYY-MM format
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const selectedMonth = `${year}-${month}`;

    // Check if report already exists for this month
    const existingReports = await base44.asServiceRole.entities.FinancialReport.filter({ month: selectedMonth });
    if (existingReports.length > 0) {
      console.log(`Report already exists for ${selectedMonth}`);
      return Response.json({ message: 'Report already exists for this month' }, { status: 200 });
    }

    // Fetch bookings and expenses for the month
    const monthBookings = await base44.asServiceRole.entities.Booking.filter({
      payment_status: { $in: ['paid', 'pending'] }
    });

    const filteredBookings = monthBookings.filter(b => {
      const bookingDate = new Date(b.departure_date || b.created_date);
      const bookingYear = bookingDate.getFullYear();
      const bookingMonth = String(bookingDate.getMonth() + 1).padStart(2, '0');
      const bookingMonthStr = `${bookingYear}-${bookingMonth}`;
      return bookingMonthStr === selectedMonth;
    });

    const monthExpenses = await base44.asServiceRole.entities.Expense.filter({
      month: selectedMonth
    });

    // Calculate totals
    const grandTotal = filteredBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Calculate taxes
    const taxSettings = await base44.asServiceRole.entities.TaxSettings.list();
    const settings = taxSettings.length > 0 ? taxSettings[0] : {};

    const totalTaxPercentage = (settings.avs_percentage || 0) + (settings.ai_percentage || 0) + 
                               (settings.ac_percentage || 0) + (settings.impot_cantonal_percentage || 0) + 
                               (settings.impot_communal_percentage || 0);
    const totalTaxes = grandTotal * (totalTaxPercentage / 100);
    const netResult = grandTotal - totalExpenses - totalTaxes;

    // Group payment methods
    const paymentMethods = {
      stripe: { total: 0, count: 0 },
      twint: { total: 0, count: 0 },
      cash: { total: 0, count: 0 }
    };

    filteredBookings.forEach(b => {
      const method = b.payment_method || 'cash';
      if (paymentMethods[method]) {
        paymentMethods[method].total += b.total_price || 0;
        paymentMethods[method].count += 1;
      }
    });

    // Fetch company settings
    const companySettings = await base44.asServiceRole.entities.CompanySettings.list();
    const company = companySettings.length > 0 ? companySettings[0] : {
      company_name: 'ROSINI',
      company_address: 'Route de Lausanne 123, 1700 Fribourg',
      registration_number: 'CHE-123.456.789 TVA',
      phone: '+41 26 123 45 67'
    };

    // Generate PDF
    const doc = new jsPDF();

    const EXPENSE_CATEGORIES = [
      { value: 'carburant', label: 'Carburant' },
      { value: 'assurance', label: 'Assurance voiture' },
      { value: 'peage', label: 'Péage' },
      { value: 'telephone', label: 'Téléphone' },
      { value: 'internet', label: 'Internet' },
      { value: 'entretien', label: 'Entretien / Réparation' },
      { value: 'autre', label: 'Autre' },
    ];

    const getCategoryLabel = (val) => EXPENSE_CATEGORIES.find(c => c.value === val)?.label || val;

    // Format month label
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const monthLabel = `${monthNames[parseInt(month) - 1]} ${year}`;

    // Header
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text(company.company_name, 20, 20);
    doc.setFontSize(9);
    doc.text('Entreprise de Transport Privé', 20, 28);
    doc.text(`Adresse: ${company.company_address}`, 20, 33);
    doc.text(`Numéro de Registre: ${company.registration_number} | Téléphone: ${company.phone}`, 20, 38);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('Rapport Financier Mensuel', 20, 58);
    doc.setFontSize(10);
    doc.text(`Période : ${monthLabel}`, 20, 66);
    doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, 20, 72);

    let y = 85;

    // REVENUS
    doc.setFillColor(240, 240, 240);
    doc.rect(20, y - 5, 170, 8, 'F');
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('ENTRÉES (REVENUS)', 20, y);
    y += 12;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);

    doc.text(`Número de cursos : ${filteredBookings.length}`, 25, y);
    y += 6;
    doc.text(`Total bruto : CHF ${grandTotal.toFixed(2)}`, 25, y);
    y += 7;
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('Detalhe por modo de pagamento :', 25, y);
    y += 5;
    
    doc.setFont(undefined, 'normal');
    doc.text(`  • Stripe : CHF ${paymentMethods.stripe.total.toFixed(2)} (${paymentMethods.stripe.count} transações)`, 28, y);
    y += 5;
    doc.text(`  • TWINT : CHF ${paymentMethods.twint.total.toFixed(2)} (${paymentMethods.twint.count} transações)`, 28, y);
    y += 5;
    doc.text(`  • Espèces : CHF ${paymentMethods.cash.total.toFixed(2)} (${paymentMethods.cash.count} transações)`, 28, y);
    y += 12;

    // DÉPENSES
    doc.setFillColor(240, 240, 240);
    doc.rect(20, y - 5, 170, 8, 'F');
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('SORTIES (DÉPENSES)', 20, y);
    y += 10;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);

    if (monthExpenses.length === 0) {
      doc.text('Aucune dépense enregistrée', 25, y);
      y += 6;
    } else {
      monthExpenses.forEach(exp => {
        const label = getCategoryLabel(exp.category);
        const desc = exp.description ? ` (${exp.description})` : '';
        doc.text(`  • ${label}: CHF ${(exp.amount || 0).toFixed(2)}${desc}`, 25, y);
        y += 5;
        if (y > 260) { doc.addPage(); y = 20; }
      });
    }

    y += 2;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(`Total dépenses : CHF ${totalExpenses.toFixed(2)}`, 25, y);
    y += 10;

    // IMPOSTOS
    doc.setFillColor(240, 240, 240);
    doc.rect(20, y - 5, 170, 8, 'F');
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('IMPOSTOS & DÉDUCTIONS', 20, y);
    y += 10;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text(`Montant total à déduire : CHF ${totalTaxes.toFixed(2)}`, 25, y);
    y += 12;

    // RÉSUMÉ FINAL
    doc.setFillColor(0, 0, 0);
    doc.rect(20, y - 5, 170, 55, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('RÉSUMÉ FINAL', 25, y);
    y += 8;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Total revenus ........................... CHF ${grandTotal.toFixed(2)}`, 25, y);
    y += 6;
    doc.text(`Total dépenses .......................... CHF ${totalExpenses.toFixed(2)}`, 25, y);
    y += 6;
    doc.text(`Total impostos ........................... CHF ${totalTaxes.toFixed(2)}`, 25, y);
    y += 8;
    doc.setFontSize(11);
    doc.text(`RÉSULTAT NET : CHF ${netResult.toFixed(2)}`, 25, y);

    const pdfBytes = doc.output('arraybuffer');
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));

    // Save report to database
    await base44.asServiceRole.entities.FinancialReport.create({
      month: selectedMonth,
      month_label: monthLabel,
      total_revenue: grandTotal,
      total_expenses: totalExpenses,
      total_taxes: totalTaxes,
      net_result: netResult,
      num_bookings: filteredBookings.length,
      pdf_data: pdfBase64
    });

    console.log(`Financial report generated for ${monthLabel}`);
    return Response.json({ success: true, month: monthLabel }, { status: 200 });
  } catch (error) {
    console.error('Error generating report:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});