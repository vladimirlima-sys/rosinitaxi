import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    const { pageName } = body;

    if (!pageName) {
      return Response.json({ error: 'pageName is required' }, { status: 400 });
    }

    // Generate or retrieve session ID from request
    const sessionId = body.sessionId || crypto.randomUUID();
    const today = new Date().toISOString().split('T')[0];

    // Create page view record
    const pageView = await base44.asServiceRole.entities.PageView.create({
      page_name: pageName,
      user_session_id: sessionId,
      timestamp: Date.now(),
      date: today,
      user_agent: req.headers.get('user-agent') || 'unknown',
      referrer: body.referrer || null
    });

    return Response.json({ 
      success: true, 
      sessionId,
      pageViewId: pageView.id 
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});