import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { create as createJWT, verify as verifyJWT } from 'npm:djwt@3.0.2';
import * as bcrypt from 'npm:bcrypt@5.1.1';

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'rosini-default-secret-2026';
const encoder = new TextEncoder();
const key = await crypto.subtle.importKey(
  'raw',
  encoder.encode(JWT_SECRET),
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['sign', 'verify']
);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { email, password, token } = body;

    // Verify existing token
    if (token) {
      try {
        const payload = await verifyJWT(token, key);
        
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
          return Response.json({ error: 'Token expirado' }, { status: 401 });
        }

        // Fetch full credential info
        const creds = await base44.asServiceRole.entities.DriverCredential.filter({
          driver_id: payload.driver_id,
          status: 'active'
        });

        if (creds.length === 0) {
          return Response.json({ error: 'Credencial não encontrada' }, { status: 404 });
        }

        const cred = creds[0];

        return Response.json({ 
          valid: true,
          driver_id: payload.driver_id,
          driver_name: payload.driver_name,
          allowed_pages: cred.allowed_pages || [],
          email: cred.email
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

    const creds = await base44.asServiceRole.entities.DriverCredential.filter({
      email: email.toLowerCase(),
      status: 'active'
    });

    if (creds.length === 0) {
      return Response.json({ error: 'Email ou senha incorretos' }, { status: 401 });
    }

    const cred = creds[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, cred.password_hash);
    if (!passwordMatch) {
      return Response.json({ error: 'Email ou senha incorretos' }, { status: 401 });
    }

    // Create JWT token
    const jwt = await createJWT(
      { alg: 'HS256', typ: 'JWT' },
      { 
        driver_id: cred.driver_id,
        driver_name: cred.driver_name,
        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
      },
      key
    );

    return Response.json({ 
      success: true, 
      token: jwt,
      driver: { 
        id: cred.driver_id, 
        name: cred.driver_name,
        email: cred.email
      },
      allowed_pages: cred.allowed_pages || []
    });
  } catch (error) {
    console.error('Auth error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});