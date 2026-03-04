import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { create as createJWT, verify as verifyJWT } from 'npm:djwt@3.0.2';

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'rosini-default-secret-2026';
const encoder = new TextEncoder();
const key = await crypto.subtle.importKey(
  'raw',
  encoder.encode(JWT_SECRET),
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['sign', 'verify']
);

// Simple password verification using Deno's crypto
async function verifyPassword(password, hash) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return computedHash === hash;
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { email, password, token } = body;

    // Verify existing token
    if (token) {
      try {
        const payload = await verifyJWT(token, key);
        
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
          return Response.json({ error: 'Token expirado' }, { status: 401 });
        }

        return Response.json({ 
          valid: true,
          admin_email: payload.admin_email
        });
      } catch (error) {
        console.error('Verify error:', error);
        return Response.json({ error: 'Token inválido' }, { status: 401 });
      }
    }

    // Login with email and password
    if (!email || !password) {
      return Response.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
    }

    // Admin credentials - using SHA-256 hash
    const ADMIN_EMAIL = 'admin@rosini.online';
    const ADMIN_PASSWORD_HASH = 'c7ad44cb7466d7460ebf74a4ec26e9cef0c41f267573c1347f0574d1d82596e9'; // SHA256 of "Sophia051009@"

    if (email.toLowerCase() !== ADMIN_EMAIL) {
      return Response.json({ error: 'Email ou senha incorretos' }, { status: 401 });
    }

    // Verify password
    const passwordMatch = await verifyPassword(password, ADMIN_PASSWORD_HASH);
    if (!passwordMatch) {
      return Response.json({ error: 'Email ou senha incorretos' }, { status: 401 });
    }

    // Create JWT token
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
    console.error('Auth error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});