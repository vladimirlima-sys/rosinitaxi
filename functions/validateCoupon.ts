import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { code, email } = await req.json();

    if (!code) return Response.json({ error: 'Código obrigatório.' }, { status: 400 });
    if (!email) return Response.json({ error: 'Email obrigatório.' }, { status: 400 });

    const coupons = await base44.entities.Coupon.filter({ code: code.trim().toUpperCase() });
    if (!coupons || coupons.length === 0) {
      return Response.json({ error: 'Cupão inválido.' }, { status: 404 });
    }

    const coupon = coupons[0];

    if (!coupon.is_active) {
      return Response.json({ error: 'Este cupão está desativado.' }, { status: 400 });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return Response.json({ error: 'Este cupão expirou.' }, { status: 400 });
    }

    const usedEmails = coupon.used_by_emails || [];
    if (usedEmails.includes(email.toLowerCase().trim())) {
      return Response.json({ error: 'Este cupão já foi utilizado com este email.' }, { status: 400 });
    }

    return Response.json({
      valid: true,
      coupon_id: coupon.id,
      discount_percentage: coupon.discount_percentage,
      code: coupon.code,
    });
  } catch (err) {
    console.error('validateCoupon error:', err.message);
    return Response.json({ error: 'Erro interno.' }, { status: 500 });
  }
});