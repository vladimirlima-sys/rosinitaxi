import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import * as bcrypt from 'npm:bcrypt@5.1.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admins can create driver credentials
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await req.json();
    const { driver_id, driver_name, email, password, allowed_pages } = body;

    if (!driver_id || !email || !password) {
      return Response.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
    }

    if (password.length < 8) {
      return Response.json({ error: 'Senha deve ter no mínimo 8 caracteres' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await base44.asServiceRole.entities.DriverCredential.filter({
      email: email.toLowerCase()
    });

    if (existing.length > 0) {
      return Response.json({ error: 'Email já cadastrado' }, { status: 400 });
    }

    // Hash password with bcrypt
    const password_hash = await bcrypt.hash(password, 10);

    // Create credential
    const credential = await base44.asServiceRole.entities.DriverCredential.create({
      driver_id,
      driver_name,
      email: email.toLowerCase(),
      password_hash,
      status: 'active',
      allowed_pages: allowed_pages || ['ActiveTrips', 'CompletedTrips', 'Earnings']
    });

    return Response.json({
      success: true,
      credential_id: credential.id,
      message: 'Credencial criada com sucesso'
    });
  } catch (error) {
    console.error('Create credential error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});