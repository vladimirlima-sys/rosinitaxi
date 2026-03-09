import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { coupon_id, booking_id, email } = await req.json();

    if (!coupon_id) return Response.json({ error: 'coupon_id obrigatório.' }, { status: 400 });
    if (!email) return Response.json({ error: 'email obrigatório.' }, { status: 400 });

    const coupons = await base44.entities.Coupon.filter({ id: coupon_id });
    if (!coupons || coupons.length === 0) {
      return Response.json({ error: 'Cupão não encontrado.' }, { status: 404 });
    }

    const coupon = coupons[0];
    const usedEmails = coupon.used_by_emails || [];
    const normalizedEmail = email.toLowerCase().trim();

    if (usedEmails.includes(normalizedEmail)) {
      return Response.json({ error: 'Email já utilizou este cupão.' }, { status: 400 });
    }

    await base44.entities.Coupon.update(coupon_id, {
      used_by_emails: [...usedEmails, normalizedEmail],
      used_count: (coupon.used_count || 0) + 1,
    });

    console.log(`Coupon ${coupon_id} used by ${normalizedEmail} for booking ${booking_id}`);
    return Response.json({ success: true });
  } catch (err) {
    console.error('useCoupon error:', err.message);
    return Response.json({ error: 'Erro interno.' }, { status: 500 });
  }
});