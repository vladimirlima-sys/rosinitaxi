import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { jsPDF } from 'npm:jspdf@4.0.0';

// Replace accented characters not supported by helvetica
function s(text) {
  if (!text && text !== 0) return '';
  return String(text)
    .replace(/[àâä]/g, 'a').replace(/[ÀÂÄÄ]/g, 'A')
    .replace(/[éèêë]/g, 'e').replace(/[ÉÈÊË]/g, 'E')
    .replace(/[îï]/g, 'i').replace(/[ÎÏ]/g, 'I')
    .replace(/[ôö]/g, 'o').replace(/[ÔÖ]/g, 'O')
    .replace(/[ùûü]/g, 'u').replace(/[ÙÛÜ]/g, 'U')
    .replace(/[ç]/g, 'c').replace(/[Ç]/g, 'C')
    .replace(/[°]/g, 'o')
    .replace(/[×]/g, 'x')
    .replace(/[–—]/g, '-');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { payslip_id } = body;

    if (!payslip_id) {
      return Response.json({ error: 'Missing payslip_id' }, { status: 400 });
    }

    const payslips = await base44.asServiceRole.entities.Payslip.filter({ id: payslip_id });
    if (!payslips || payslips.length === 0) {
      return Response.json({ error: 'Payslip not found' }, { status: 404 });
    }
    const p = payslips[0];

    const companyList = await base44.asServiceRole.entities.CompanySettings.list();
    const company = companyList[0] || {};

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210;
    const margin = 15;
    let y = 15;

    const line = () => { doc.setDrawColor(0); doc.setLineWidth(0.3); doc.line(margin, y, W - margin, y); y += 2; };
    const gap = (n = 4) => { y += n; };

    // Header
    doc.setFillColor(0, 0, 0);
    doc.rect(margin, y, W - margin * 2, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(s(company.company_name || 'Rosini Transports et locations SArl'), margin + 4, y + 7);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(s(company.company_address || ''), margin + 4, y + 12.5);
    doc.text(`CHE: ${s(company.registration_number || '')} | Tel: ${s(company.phone || '')}`, margin + 4, y + 16.5);
    y += 22;

    // Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('BULLETIN DE SALAIRE', W / 2, y, { align: 'center' });
    gap(2);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Periode: ${s(p.month_label)}`, W / 2, y, { align: 'center' });
    gap(6);
    line();

    // Employee section
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('EMPLOYE', margin, y);
    gap(5);
    doc.setFont('helvetica', 'normal');
    const col2 = W / 2 + 5;
    doc.text(`Nom: ${s(p.driver_name)}`, margin, y);
    doc.text(`Adresse: ${s(p.driver_address || '-')}`, col2, y);
    gap(5);
    doc.text(`No AVS: ${s(p.driver_avs || '-')}`, margin, y);
    gap(5);
    line();

    // Salary details
    doc.setFont('helvetica', 'bold');
    doc.text('DETAIL DU SALAIRE', margin, y);
    gap(5);

    const row = (label, value, bold = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.text(s(label), margin, y);
      doc.text(typeof value === 'number' ? `CHF ${value.toFixed(2)}` : value, W - margin, y, { align: 'right' });
      gap(5);
    };

    row('Salaire brut', p.salary_brut, true);
    if (p.heures_travaillees) row(`Heures travaillees: ${p.heures_travaillees}h x CHF ${p.taux_horaire || 0}`, '');
    gap(2);
    line();

    // Deductions
    doc.setFont('helvetica', 'bold');
    doc.text('DEDUCTIONS (part employe)', margin, y);
    gap(5);

    const deductRow = (label, pct, amount) => {
      if (!amount) return;
      doc.setFont('helvetica', 'normal');
      doc.text(`${s(label)} (${pct}%)`, margin + 3, y);
      doc.text(`- CHF ${amount.toFixed(2)}`, W - margin, y, { align: 'right' });
      gap(5);
    };

    deductRow('AVS (Assurance-Vieillesse et Survivants)', p.avs_percentage, p.avs_amount);
    deductRow('AI (Assurance-Invalidite)', p.ai_percentage, p.ai_amount);
    deductRow('APG (Allocations pour perte de gain)', p.apg_percentage, p.apg_amount);
    deductRow('AC (Assurance-Chomage)', p.ac_percentage, p.ac_amount);
    deductRow('AF (Allocations Familiales)', p.af_percentage, p.af_amount);
    deductRow('PC (Prestations Complementaires)', p.pc_percentage, p.pc_amount);
    deductRow('Contribution Frais Administratifs', p.cont_frais_admin_percentage, p.cont_frais_admin_amount);
    deductRow('Impot a la source', p.impot_source_percentage, p.impot_source_amount);
    if (p.other_deductions_amount) deductRow('Autres deductions', p.other_deductions_percentage, p.other_deductions_amount);

    gap(2);
    line();
    row('Total deductions', p.total_deductions);
    line();

    // Net salary
    doc.setFillColor(0, 0, 0);
    doc.rect(margin, y, W - margin * 2, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('SALAIRE NET A PAYER', margin + 4, y + 6.5);
    doc.text(`CHF ${p.salary_net.toFixed(2)}`, W - margin - 4, y + 6.5, { align: 'right' });
    y += 14;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);

    if (p.notes) {
      gap(4);
      doc.setFont('helvetica', 'italic');
      doc.text(`Notes: ${p.notes}`, margin, y);
      gap(5);
    }

    gap(6);
    line();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Signature employeur: _______________________________', margin, y);
    doc.text('Signature employé: _______________________________', col2, y);

    const pdfB64 = doc.output('datauristring');
    const pdfBytes = doc.output('arraybuffer');

    // Save PDF to entity
    await base44.asServiceRole.entities.Payslip.update(p.id, { pdf_data: pdfB64 });

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=fiche-salaire-${p.month_label?.replace(/ /g, '-')}.pdf`,
      },
    });
  } catch (error) {
    console.error('Error generating payslip PDF:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});