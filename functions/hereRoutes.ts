Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const departure = body.departure;
    const arrival = body.arrival;

    if (!departure || !arrival) {
      return Response.json({ error: 'departure and arrival are required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('HERE_API_KEY');
    if (!apiKey) {
      console.error('[hereRoutes] HERE_API_KEY not configured');
      return Response.json({ error: 'HERE_API_KEY not configured' }, { status: 500 });
    }

    const url = `https://router.hereapi.com/v8/routes?transportMode=car&origin=${departure.lat},${departure.lng}&destination=${arrival.lat},${arrival.lng}&return=polyline,summary&apikey=${apiKey}`;

    console.log('[hereRoutes] Requesting route from', departure, 'to', arrival);
    const response = await fetch(url);
    const text = await response.text();
    console.log('[hereRoutes] Status:', response.status, 'Body:', text.substring(0, 500));

    if (!response.ok) {
      console.error('[hereRoutes] HERE API error:', text);
      return Response.json({ error: 'HERE API error', details: text }, { status: response.status });
    }

    const data = JSON.parse(text);

    if (!data.routes || data.routes.length === 0) {
      console.warn('[hereRoutes] No route found');
      return Response.json({ error: 'No route found', distance_km: 0, estimated_time_minutes: 0 }, { status: 200 });
    }

    const route = data.routes[0];
    const summary = route.sections[0]?.summary || {};
    const distance_km = Math.round((summary.length || 0) / 1000);
    const estimated_time_minutes = Math.round((summary.duration || 0) / 60);
    const polyline = route.sections[0]?.polyline || '';

    console.log('[hereRoutes] Result:', { distance_km, estimated_time_minutes });

    return Response.json({ distance_km, estimated_time_minutes, route: polyline });
  } catch (error) {
    console.error('[hereRoutes] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});