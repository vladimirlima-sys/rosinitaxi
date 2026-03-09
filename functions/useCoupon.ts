import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { coupon_id, booking_id } = await req.json();

    if (!coupon_id) {
      return Response.json({ error: 'coupon_id requis' }, { status: 400 });
    }

    await base44.asServiceRole.entities.Coupon.update(coupon_id, {
      is_used: true,
      used_by_booking_id: booking_id || '',
      used_at: new Date().toISOString()
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('useCoupon error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});