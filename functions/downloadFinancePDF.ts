Deno.serve(async (req) => {
  try {
    const data = await req.json();
    const { selectedMonth, monthLabel, monthBookings, grandTotal, paymentMethods, monthExpenses, totalExpenses, netResult, totalTaxes } = data;

    const { jsPDF } = await import('npm:jspdf@4.0.0');
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

    // Header
    doc.setFontSize(20);
    doc.text('ROSINI', 20, 20);
    doc.setFontSize(14);
    doc.text('Rapport Financier Mensuel', 20, 30);
    doc.setFontSize(11);
    doc.text(`Période : ${monthLabel}`, 20, 38);
    doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, 20, 45);
    doc.line(20, 48, 190, 48);

    let y = 58;

    // REVENUS
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('ENTRÉES (REVENUS)', 20, y);
    y += 8;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);

    // Détail des courses
    doc.text(`Nombre de courses : ${monthBookings.length}`, 25, y);
    y += 6;
    doc.text(`Total brut : CHF ${grandTotal.toFixed(2)}`, 25, y);
    y += 6;
    doc.setFontSize(9);
    doc.text(`  - Stripe : CHF ${paymentMethods.stripe.total.toFixed(2)} (${paymentMethods.stripe.count} transactions)`, 28, y);
    y += 5;
    doc.text(`  - TWINT : CHF ${paymentMethods.twint.total.toFixed(2)} (${paymentMethods.twint.count} transactions)`, 28, y);
    y += 5;
    doc.text(`  - Espèces : CHF ${paymentMethods.cash.total.toFixed(2)} (${paymentMethods.cash.count} transactions)`, 28, y);
    y += 12;

    // DÉPENSES
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('SORTIES (DÉPENSES)', 20, y);
    y += 8;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);

    if (monthExpenses.length === 0) {
      doc.text('Aucune dépense enregistrée', 25, y);
      y += 6;
    } else {
      monthExpenses.forEach(exp => {
        const label = getCategoryLabel(exp.category);
        const desc = exp.description ? ` (${exp.description})` : '';
        doc.text(`  - ${label}: CHF ${(exp.amount || 0).toFixed(2)}${desc}`, 25, y);
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
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('IMPOSTOS & DÉDUCTIONS', 20, y);
    y += 8;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text(`Montant total à déduire : CHF ${totalTaxes.toFixed(2)}`, 25, y);
    y += 12;

    // RÉSUMÉ FINAL
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('RÉSUMÉ FINAL', 20, y);
    y += 8;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Total revenus : CHF ${grandTotal.toFixed(2)}`, 25, y);
    y += 6;
    doc.text(`Total dépenses : CHF ${totalExpenses.toFixed(2)}`, 25, y);
    y += 6;
    doc.text(`Total impostos : CHF ${totalTaxes.toFixed(2)}`, 25, y);
    y += 8;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text(`RÉSULTAT NET : CHF ${(grandTotal - totalExpenses - totalTaxes).toFixed(2)}`, 25, y);

    // Détail des courses (page suivante si nécessaire)
    if (y > 240 || monthBookings.length > 0) {
      doc.addPage();
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('DÉTAIL DES COURSES', 20, 20);
      
      y = 30;
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
      monthBookings.forEach(b => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(new Date(b.departure_date || b.created_date).toLocaleDateString('fr-FR'), 20, y);
        doc.text((b.client_name || '').substring(0, 25), 50, y);
        const trajet = ((b.departure_point || '').split(',')[0] + ' → ' + (b.arrival_point || '').split(',')[0]).substring(0, 55);
        doc.text(trajet, 95, y);
        doc.text(b.payment_method === 'stripe' ? 'Stripe' : b.payment_method === 'twint' ? 'TWINT' : 'Espèces', 160, y);
        doc.text(`${(b.total_price || 0).toFixed(2)}`, 185, y);
        y += 5;
      });
    }

    const pdfBytes = doc.output('arraybuffer');
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