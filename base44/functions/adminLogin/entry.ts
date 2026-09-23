Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { email, password, token } = body;

    const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'rosini-secret-key';
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    // Verify token if provided
    if (token) {
      try {
        const payload = await verifyToken(token, key);
        return Response.json({ valid: true });
      } catch {
        return Response.json({ valid: false });
      }
    }

    // Login with email/password
    if (!email || !password) {
      return Response.json({ success: false, error: 'Email e senha obrigatórios' }, { status: 400 });
    }

    // Simple comparison
    const ADMIN_EMAIL = 'vladimir@rosini.online';
    const ADMIN_PASSWORD = 'Sophia051009@';

    if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Create JWT token
      const expiryTime = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);
      const jwt = await createToken(
        { admin_email: ADMIN_EMAIL, exp: expiryTime },
        key
      );

      return Response.json({ 
        success: true, 
        token: jwt, 
        admin_email: ADMIN_EMAIL 
      });
    }

    return Response.json({ success: false, error: 'Credenciais inválidas' }, { status: 401 });

  } catch (error) {
    console.error('Auth error:', error.message);
    return Response.json({ 
      success: false, 
      error: 'Erro no servidor: ' + error.message 
    }, { status: 500 });
  }
});

async function createToken(payload, key) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerEncoded = btoa(JSON.stringify(header));
  const payloadEncoded = btoa(JSON.stringify(payload));
  const message = `${headerEncoded}.${payloadEncoded}`;
  
  const msgBuffer = new TextEncoder().encode(message);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, msgBuffer);
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureEncoded = btoa(String.fromCharCode.apply(null, signatureArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return `${message}.${signatureEncoded}`;
}

async function verifyToken(token, key) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token');
  
  const message = `${parts[0]}.${parts[1]}`;
  const msgBuffer = new TextEncoder().encode(message);
  const signatureBuffer = Uint8Array.from(atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  
  const isValid = await crypto.subtle.verify('HMAC', key, signatureBuffer, msgBuffer);
  if (!isValid) throw new Error('Invalid signature');
  
  const payload = JSON.parse(atob(parts[1]));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }
  
  return payload;
}