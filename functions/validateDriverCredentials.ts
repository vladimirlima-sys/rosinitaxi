import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function generateToken(driverId) {
  const timestamp = Date.now();
  return Buffer.from(JSON.stringify({ driverId, timestamp })).toString('base64');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json({ success: false, error: 'Email e senha obrigatórios' }, { status: 400 });
    }

    // Get all driver credentials - use list and filter in memory
    const allCreds = await base44.asServiceRole.entities.DriverCredential.list('', 1000);
    const creds = allCreds.filter(c => 
      c.email.toLowerCase() === email.toLowerCase() && c.status === 'active'
    );

    if (creds.length === 0) {
      return Response.json({ success: false, error: 'Email ou senha incorretos' }, { status: 401 });
    }

    const cred = creds[0];
    
    // Simple password comparison (stored as plaintext or bcrypt)
    const isValidPassword = password === cred.password_hash;
    if (!isValidPassword) {
      return Response.json({ success: false, error: 'Email ou senha incorretos' }, { status: 401 });
    }

    const token = generateToken(cred.driver_id);

    return Response.json({ 
      success: true, 
      driver: { 
        id: cred.driver_id, 
        name: cred.driver_name
      },
      token,
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