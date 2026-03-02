Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const departure = body.departure;
    const arrival = body.arrival;
    const mode = body.mode || 'car';
    
    if (!departure || !arrival) {
      return Response.json({ error: 'departure and arrival are required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('HERE_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'HERE_API_KEY not configured' }, { status: 500 });
    }

    const url = `https://router.hereapi.com/v8/routes?transportMode=${mode}&origin=${departure.lat},${departure.lng}&destination=${arrival.lat},${arrival.lng}&return=polyline,summary&apikey=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('HERE API error:', data);
      return Response.json({ error: 'HERE API error', details: data }, { status: response.status });
    }

    if (!data.routes || data.routes.length === 0) {
      return Response.json({ error: 'No route found', distance_km: 0, estimated_time_minutes: 0 }, { status: 200 });
    }

    const route = data.routes[0];
    const summary = route.sections[0]?.summary || {};
    const distance_km = Math.round(summary.length / 1000);
    const estimated_time_minutes = Math.round(summary.duration / 60);
    
    // Decode polyline
    const polyline = route.sections[0]?.polyline || '';

    return Response.json({
      distance_km,
      estimated_time_minutes,
      route: polyline
    });
  } catch (error) {
    console.error('Routes error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});