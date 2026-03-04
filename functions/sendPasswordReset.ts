import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return Response.json({ success: false, error: 'Email obrigatório' }, { status: 400 });
    }

    // Find driver credential
    const creds = await base44.asServiceRole.entities.DriverCredential.filter({
      email: email.toLowerCase(),
      status: 'active'
    });

    if (creds.length === 0) {
      return Response.json({ success: false, error: 'Email não encontrado' }, { status: 404 });
    }

    const cred = creds[0];

    // Generate temporary password (8 characters)
    const tempPassword = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Hash the temporary password
    const enc = new TextEncoder();
    const data = enc.encode(tempPassword);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Update credential with new password
    await base44.asServiceRole.entities.DriverCredential.update(cred.id, {
      password_hash: passwordHash
    });

    // Send email with new password
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe - Rosini Transfert',
      body: `Bonjour ${cred.driver_name},\n\nVoici votre nouveau mot de passe temporaire:\n\n${tempPassword}\n\nVeuillez utiliser ce mot de passe pour vous connecter, puis le modifier dans les paramètres.\n\nCordialement,\nRosini Transfert`
    });

    return Response.json({ success: true, message: 'Email de réinitialisation envoyé' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    return Response.json({ 
      success: false, 
      error: 'Erreur lors de l\'envoi de l\'email' 
    }, { status: 500 });
  }
});