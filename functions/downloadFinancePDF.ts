import { jsPDF } from 'npm:jspdf@4.0.0';

const EXPENSE_CATEGORIES = [
  { value: 'carburant', label: 'Carburant' },
  { value: 'assurance', label: 'Assurance voiture' },
  { value: 'peage', label: 'Péage' },
  { value: 'telephone', label: 'Téléphone' },
  { value: 'internet', label: 'Internet' },
  { value: 'entretien', label: 'Entretien / Réparation' },
  { value: 'autre', label: 'Autre' },
];

function getCategoryLabel(val) {
  return EXPENSE_CATEGORIES.find(c => c.value === val)?.label || val;
}

export async function downloadFinancePDF(data) {
  const { selectedMonth, monthLabel, monthBookings, grandTotal, paymentMethods, monthExpenses, totalExpenses, netResult } = data;
  
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.text('Rapport Financier Mensuel', 20, 20);
  doc.setFontSize(12);
  doc.text(`Période : ${monthLabel}`, 20, 30);
  doc.setFontSize(10);
  doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, 20, 38);

  // Revenues
  doc.setFontSize(14);
  doc.text('REVENUS', 20, 52);
  doc.setFontSize(10);
  doc.text(`Total des courses (${monthBookings.length} courses) : CHF ${grandTotal.toFixed(2)}`, 25, 62);
  doc.text(`  - Stripe : CHF ${paymentMethods.stripe.total.toFixed(2)} (${paymentMethods.stripe.count} transactions)`, 25, 70);
  doc.text(`  - TWINT : CHF ${paymentMethods.twint.total.toFixed(2)} (${paymentMethods.twint.count} transactions)`, 25, 78);
  doc.text(`  - Espèces : CHF ${paymentMethods.cash.total.toFixed(2)} (${paymentMethods.cash.count} transactions)`, 25, 86);

  // Expenses
  doc.setFontSize(14);
  doc.text('DÉPENSES', 20, 100);
  doc.setFontSize(10);
  let y = 110;
  if (monthExpenses.length === 0) {
    doc.text('Aucune dépense enregistrée', 25, y);
    y += 8;
  } else {
    monthExpenses.forEach(exp => {
      doc.text(`  - ${getCategoryLabel(exp.category)} : CHF ${(exp.amount || 0).toFixed(2)}${exp.description ? ' (' + exp.description + ')' : ''}`, 25, y);
      y += 8;
      if (y > 270) { doc.addPage(); y = 20; }
    });
  }
  doc.text(`Total dépenses : CHF ${totalExpenses.toFixed(2)}`, 25, y + 4);

  // Net result
  y += 18;
  doc.setFontSize(14);
  doc.text(`RÉSULTAT NET : CHF ${netResult.toFixed(2)}`, 20, y);

  // Courses detail
  y += 16;
  if (y > 240) { doc.addPage(); y = 20; }
  doc.setFontSize(14);
  doc.text('DÉTAIL DES COURSES', 20, y);
  y += 10;
  doc.setFontSize(9);
  doc.text('Date', 20, y);
  doc.text('Client', 45, y);
  doc.text('Trajet', 90, y);
  doc.text('Mode', 155, y);
  doc.text('CHF', 185, y);
  y += 6;
  doc.line(20, y, 200, y);
  y += 4;
  monthBookings.forEach(b => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(new Date(b.departure_date || b.created_date).toLocaleDateString('fr-FR'), 20, y);
    doc.text((b.client_name || '').substring(0, 20), 45, y);
    doc.text(((b.departure_point || '').split(',')[0] + ' → ' + (b.arrival_point || '').split(',')[0]).substring(0, 40), 90, y);
    doc.text(b.payment_method === 'stripe' ? 'Stripe' : b.payment_method === 'twint' ? 'TWINT' : 'Espèces', 155, y);
    doc.text(`${(b.total_price || 0).toFixed(2)}`, 185, y);
    y += 7;
  });

  doc.save(`rapport-financier-${selectedMonth}.pdf`);
}