import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { code } = await req.json();

    if (!code) {
      return Response.json({ error: 'Code requis' }, { status: 400 });
    }

    const coupons = await base44.asServiceRole.entities.Coupon.filter({ code: code.toUpperCase().trim() });

    if (!coupons || coupons.length === 0) {
      return Response.json({ error: 'Code invalide' }, { status: 404 });
    }

    const coupon = coupons[0];

    if (coupon.is_used) {
      return Response.json({ error: 'Ce coupon a déjà été utilisé' }, { status: 400 });
    }

    if (coupon.expires_at) {
      const today = new Date().toISOString().split('T')[0];
      if (today > coupon.expires_at) {
        return Response.json({ error: 'Ce coupon est expiré' }, { status: 400 });
      }
    }

    return Response.json({
      valid: true,
      coupon_id: coupon.id,
      discount_percentage: coupon.discount_percentage,
      code: coupon.code
    });
  } catch (error) {
    console.error('validateCoupon error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});