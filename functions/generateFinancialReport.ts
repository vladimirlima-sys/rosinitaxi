import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const data = await req.json();
    const { selectedMonth, monthLabel, monthBookings, grandTotal, paymentMethods, monthExpenses, totalExpenses, netResult, totalTaxes } = data;

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

    // Header avec infos de l'entreprise
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('ROSINI', 20, 20);
    doc.setFontSize(9);
    doc.text('Entreprise de Transport Privé', 20, 28);
    doc.text('Adresse: Route de Lausanne 123, 1700 Fribourg', 20, 33);
    doc.text('Numéro de Registre: CHE-123.456.789 TVA | Téléphone: +41 26 123 45 67', 20, 38);

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

    doc.text(`Nombre de courses : ${monthBookings.length}`, 25, y);
    y += 6;
    doc.text(`Total brut : CHF ${grandTotal.toFixed(2)}`, 25, y);
    y += 7;
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('Détail par mode de paiement :', 25, y);
    y += 5;
    
    doc.setFont(undefined, 'normal');
    doc.text(`  • Stripe : CHF ${paymentMethods.stripe.total.toFixed(2)} (${paymentMethods.stripe.count} transactions)`, 28, y);
    y += 5;
    doc.text(`  • TWINT : CHF ${paymentMethods.twint.total.toFixed(2)} (${paymentMethods.twint.count} transactions)`, 28, y);
    y += 5;
    doc.text(`  • Espèces : CHF ${paymentMethods.cash.total.toFixed(2)} (${paymentMethods.cash.count} transactions)`, 28, y);
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
    doc.text(`RÉSULTAT NET : CHF ${(grandTotal - totalExpenses - totalTaxes).toFixed(2)}`, 25, y);

    // Détail des courses
    doc.addPage();
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('DÉTAIL DES COURSES', 20, 10);
    
    y = 25;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('Date', 20, y);
    doc.text('Client', 50, y);
    doc.text('Trajet', 95, y);
    doc.text('Mode', 160, y);
    doc.text('CHF', 185, y);
    y += 6;
    doc.line(20, y, 200, y);
    y += 4;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    monthBookings.forEach(b => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(new Date(b.departure_date || b.created_date).toLocaleDateString('fr-FR'), 20, y);
      doc.text((b.client_name || '').substring(0, 25), 50, y);
      const trajet = ((b.departure_point || '').split(',')[0] + ' → ' + (b.arrival_point || '').split(',')[0]).substring(0, 55);
      doc.text(trajet, 95, y);
      doc.text(b.payment_method === 'stripe' ? 'Stripe' : b.payment_method === 'twint' ? 'TWINT' : 'Espèces', 160, y);
      doc.text(`${(b.total_price || 0).toFixed(2)}`, 185, y);
      y += 4;
    });

    const pdfBytes = doc.output('arraybuffer');
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));

    // Salvar relatório no banco de dados
    await base44.asServiceRole.entities.FinancialReport.create({
      month: selectedMonth,
      month_label: monthLabel,
      total_revenue: grandTotal,
      total_expenses: totalExpenses,
      total_taxes: totalTaxes,
      net_result: grandTotal - totalExpenses - totalTaxes,
      num_bookings: monthBookings.length,
      pdf_data: pdfBase64
    });

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=rapport-financier-${selectedMonth}.pdf`
      }
    });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});