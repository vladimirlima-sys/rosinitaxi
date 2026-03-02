import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { driverId, month, year, grossAmount } = await req.json();

        // Fetch driver data
        const driverData = await base44.asServiceRole.entities.Driver.get(driverId);
        
        // Fetch company settings
        const companySettings = await base44.asServiceRole.entities.CompanySettings.list();
        const company = companySettings[0] || {};

        // Fetch payroll settings for this driver
        const payrollSettingsList = await base44.asServiceRole.entities.DriverPayrollSettings.filter({ driver_id: driverId });
        const payrollSettings = payrollSettingsList[0] || {};

        // Fetch tax settings
        const taxSettingsList = await base44.asServiceRole.entities.TaxSettings.list();
        const taxSettings = taxSettingsList[0] || {};

        // Create PDF
        const doc = new jsPDF('p', 'mm', 'A4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Use black and white theme
        doc.setTextColor(0, 0, 0);
        
        // === HEADER ===
        let y = 15;
        
        // Company name and info
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(company.company_name || 'ROSINI', 20, y);
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        y += 6;
        if (company.company_address) doc.text(company.company_address, 20, y);
        y += 4;
        if (company.registration_number) doc.text(`CHE: ${company.registration_number}`, 20, y);
        y += 4;
        if (company.phone) doc.text(`Tél: ${company.phone}`, 20, y);

        // Title on right
        y = 15;
        doc.setFontSize(13);
        doc.setFont(undefined, 'bold');
        const monthName = new Date(year, month - 1).toLocaleString('fr-CH', { month: 'long', year: 'numeric' }).charAt(0).toUpperCase() + 
                         new Date(year, month - 1).toLocaleString('fr-CH', { month: 'long', year: 'numeric' }).slice(1);
        doc.text(`Bulletin de salaire`, pageWidth - 20, y, { align: 'right' });
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(monthName, pageWidth - 20, y + 6, { align: 'right' });

        // === EMPLOYEE SECTION ===
        y = 40;
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Collaborateur', 20, y);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        y += 6;
        doc.text(driverData.name || 'N/A', 20, y);
        y += 5;
        if (driverData.address) doc.text(driverData.address, 20, y);
        y += 5;
        if (driverData.avs_number) doc.text(`Numéro AVS: ${driverData.avs_number}`, 20, y);

        // === SALARY CALCULATION ===
        y = 40;
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Période', pageWidth - 80, y);
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        y += 6;
        const daysInMonth = new Date(year, month, 0).getDate();
        doc.text(`01.${String(month).padStart(2, '0')}.${year} - ${daysInMonth}.${String(month).padStart(2, '0')}.${year}`, pageWidth - 80, y);

        // === SEPARATOR LINE ===
        y = 65;
        doc.setDrawColor(200, 200, 200);
        doc.line(20, y, pageWidth - 20, y);

        // === INCOME SECTION ===
        y = 72;
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Rémunérations', 20, y);

        // Table header
        y += 8;
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.text('Description', 20, y);
        doc.text('Montant', pageWidth - 40, y, { align: 'right' });

        // Draw header line
        doc.setDrawColor(220, 220, 220);
        doc.line(20, y + 1, pageWidth - 20, y + 1);

        // Salary row
        y += 7;
        doc.setFont(undefined, 'normal');
        doc.text('Salaire brut', 20, y);
        doc.text(`CHF ${grossAmount.toFixed(2)}`, pageWidth - 40, y, { align: 'right' });

        // === DEDUCTIONS SECTION ===
        y += 12;
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Déductions', 20, y);

        // Deductions from tax settings
        const deductions = [
            { name: 'Cotisation AVS/AI/APG', rate: (payrollSettings.avs_percentage || taxSettings.avs_percentage || 5.15) + (payrollSettings.ai_percentage || taxSettings.ai_percentage || 0.8) + (payrollSettings.apg_percentage || taxSettings.apg_percentage || 0) },
            { name: 'Cotisation AC', rate: payrollSettings.ac_percentage || taxSettings.ac_percentage || 1.1 },
            { name: 'Cotisation LAA', rate: payrollSettings.laa_percentage || taxSettings.laa_percentage || 1.3 },
            { name: 'Cotisation LPP', rate: payrollSettings.lpp_percentage || taxSettings.lpp_percentage || 7.7 },
            { name: 'Impôt à la source', rate: payrollSettings.impot_source_percentage || taxSettings.impot_source_percentage || 0 }
        ];

        let totalDeductions = 0;

        // Table header
        y += 8;
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.text('Description', 20, y);
        doc.text('Taux', 90, y);
        doc.text('Montant', pageWidth - 40, y, { align: 'right' });

        // Draw header line
        doc.setDrawColor(220, 220, 220);
        doc.line(20, y + 1, pageWidth - 20, y + 1);

        // Deduction rows
        deductions.forEach((deduction) => {
            y += 6;
            const amount = (grossAmount * deduction.rate) / 100;
            totalDeductions += amount;
            
            doc.setFont(undefined, 'normal');
            doc.setFontSize(8);
            doc.text(deduction.name, 20, y);
            doc.text(`${deduction.rate.toFixed(2)}%`, 90, y);
            doc.text(`CHF ${amount.toFixed(2)}`, pageWidth - 40, y, { align: 'right' });
        });

        // === TOTALS SECTION ===
        y += 12;
        doc.setDrawColor(200, 200, 200);
        doc.line(20, y, pageWidth - 20, y);
        
        y += 6;
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Total déductions', 20, y);
        doc.text(`CHF ${totalDeductions.toFixed(2)}`, pageWidth - 40, y, { align: 'right' });

        const netAmount = grossAmount - totalDeductions;

        y += 8;
        doc.setFillColor(240, 240, 240);
        doc.rect(20, y - 4, pageWidth - 40, 8);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Montant net à verser', 20, y);
        doc.text(`CHF ${netAmount.toFixed(2)}`, pageWidth - 40, y, { align: 'right' });

        // === FOOTER ===
        const footerY = pageHeight - 15;
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        
        // Left side - Date and city
        const today = new Date();
        const dateStr = `${today.getDate()}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
        doc.text(`${company.company_address?.split(',')[0] || 'Lausanne'}, le ${dateStr}`, 20, footerY);
        
        // Right side - Company name and CHE
        doc.setFont(undefined, 'bold');
        doc.text(company.company_name || 'ROSINI', pageWidth - 20, footerY, { align: 'right' });
        if (company.registration_number) {
            doc.setFont(undefined, 'normal');
            doc.text(`CHE: ${company.registration_number}`, pageWidth - 20, footerY + 4, { align: 'right' });
        }

        // Return PDF
        const pdfBytes = doc.output('arraybuffer');
        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=bulletin_salaire_${driverData.name?.replace(/\s+/g, '_')}_${month}_${year}.pdf`
            }
        });
    } catch (error) {
        console.error('Error generating payslip:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});