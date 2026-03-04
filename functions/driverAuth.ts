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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { code, token } = body;

    // Verify token
    if (token) {
      try {
        const payload = await verifyJWT(token, key);
        
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
          return Response.json({ error: 'Token expired' }, { status: 401 });
        }

        return Response.json({ 
          valid: true,
          driver_id: payload.driver_id,
          driver_name: payload.driver_name
        });
      } catch (error) {
        console.error('Verify error:', error);
        return Response.json({ error: 'Invalid token' }, { status: 401 });
      }
    }

    // Login with code
    if (!code || code.trim().length < 2) {
      return Response.json({ error: 'Code invalide' }, { status: 400 });
    }

    const drivers = await base44.asServiceRole.entities.Driver.filter({
      status: 'active'
    });
    
    const driver = drivers.find(d => 
      d.id === code.trim() || 
      d.name.toLowerCase().includes(code.trim().toLowerCase())
    );

    if (!driver) {
      return Response.json({ error: 'Chauffeur non trouvé' }, { status: 404 });
    }

    const jwt = await createJWT(
      { alg: 'HS256', typ: 'JWT' },
      { 
        driver_id: driver.id,
        driver_name: driver.name,
        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
      },
      key
    );

    return Response.json({ 
      success: true, 
      token: jwt,
      driver: { id: driver.id, name: driver.name }
    });
  } catch (error) {
    console.error('Auth error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});