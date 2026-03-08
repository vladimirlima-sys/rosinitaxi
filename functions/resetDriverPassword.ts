import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, password } = await req.json();

    const hash = await hashPassword(password);
    console.log(`Hash for ${email}: ${hash}`);

    const creds = await base44.asServiceRole.entities.DriverCredential.filter({ email });
    if (!creds.length) return Response.json({ error: 'Not found' }, { status: 404 });

    await base44.asServiceRole.entities.DriverCredential.update(creds[0].id, { password_hash: hash });

    return Response.json({ success: true, hash });
  } catch (error) {
    console.error(error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});