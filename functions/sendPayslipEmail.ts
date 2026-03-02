import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { payslipId, driverEmail, driverName, month, year } = await req.json();

    const monthNames = [
      '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const monthLabel = monthNames[month];

    // Send email via Base44 integration
    await base44.integrations.Core.SendEmail({
      to: driverEmail,
      subject: `Ficha de Salário - ${monthLabel} ${year}`,
      body: `
Olá ${driverName},

Em anexo encontra a sua ficha de salário referente a ${monthLabel} de ${year}.

Por favor, revise os detalhes e entre em contacto caso tenha dúvidas.

Cordialmente,
ROSINI
      `
    });

    return Response.json({ 
      success: true, 
      message: 'Email enviado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});