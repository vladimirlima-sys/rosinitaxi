import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

async function hashPassword(password) {
  const enc = new TextEncoder();
  const data = enc.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json({ success: false, error: 'Email e senha obrigatórios' }, { status: 400 });
    }

    // Get all driver credentials
    const creds = await base44.asServiceRole.entities.DriverCredential.filter({
      email: email.toLowerCase(),
      status: 'active'
    });

    if (creds.length === 0) {
      return Response.json({ success: false, error: 'Email ou senha incorretos' }, { status: 401 });
    }

    const cred = creds[0];
    
    // Verify password
    const computedHash = await hashPassword(password);
    if (computedHash !== cred.password_hash) {
      return Response.json({ success: false, error: 'Email ou senha incorretos' }, { status: 401 });
    }

    // Get driver info
    const drivers = await base44.asServiceRole.entities.Driver.filter({ id: cred.driver_id });
    const driver = drivers[0] || { id: cred.driver_id, name: cred.driver_name };

    return Response.json({ 
      success: true, 
      driver: { 
        id: driver.id || cred.driver_id, 
        name: driver.name || cred.driver_name
      },
      allowed_pages: cred.allowed_pages || ['ActiveTrips', 'CompletedTrips', 'Earnings']
    });
  } catch (error) {
    console.error('Auth error:', error.message);
    return Response.json({ 
      success: false, 
      error: 'Erro no servidor' 
    }, { status: 500 });
  }
});