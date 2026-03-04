import { create as createJWT, verify as verifyJWT } from 'npm:djwt@3.0.2';

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'rosini-secret-admin-key';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { email, password, token } = body;

    // Setup JWT key
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    // If token provided, verify it
    if (token) {
      try {
        const payload = await verifyJWT(token, key);
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
          return Response.json({ valid: false, error: 'Token expired' }, { status: 401 });
        }
        return Response.json({ valid: true, admin_email: payload.admin_email });
      } catch (err) {
        console.error('Token verification failed:', err.message);
        return Response.json({ valid: false, error: 'Invalid token' }, { status: 401 });
      }
    }

    // Email/password login
    if (!email || !password) {
      return Response.json({ success: false, error: 'Email and password required' }, { status: 400 });
    }

    const ADMIN_EMAIL = 'vladimir@rosini.online';
    const ADMIN_PASSWORD_HASH = 'c7ad44cb7466d7460ebf74a4ec26e9cef0c41f267573c1347f0574d1d82596e9';

    if (email.toLowerCase() !== ADMIN_EMAIL) {
      return Response.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const enc = new TextEncoder();
    const data = enc.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('Attempted login with:', email);
    console.log('Password match:', computedHash === ADMIN_PASSWORD_HASH);

    if (computedHash !== ADMIN_PASSWORD_HASH) {
      return Response.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const jwt = await createJWT(
      { alg: 'HS256', typ: 'JWT' },
      { 
        admin_email: ADMIN_EMAIL, 
        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) 
      },
      key
    );

    return Response.json({ 
      success: true, 
      token: jwt, 
      admin_email: ADMIN_EMAIL 
    });
  } catch (error) {
    console.error('Auth error:', error.message);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});