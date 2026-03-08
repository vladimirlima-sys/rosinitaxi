Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const departure = body.departure;
    const arrival = body.arrival;
    const via = body.via || []; // array of {lat, lng} for additional stops
    
    if (!departure || !arrival) {
      return Response.json({ error: 'departure and arrival are required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('HERE_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'HERE_API_KEY not configured' }, { status: 500 });
    }

    const viaParams = via.map(v => `&via=${v.lat},${v.lng}`).join('');
    const url = `https://router.hereapi.com/v8/routes?transportMode=car&origin=${departure.lat},${departure.lng}${viaParams}&destination=${arrival.lat},${arrival.lng}&return=polyline,summary&apikey=${apiKey}`;
    
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
    // Aggregate all sections (important when via waypoints are used)
    const totalLength = route.sections.reduce((sum, s) => sum + (s.summary?.length || 0), 0);
    const totalDuration = route.sections.reduce((sum, s) => sum + (s.summary?.duration || 0), 0);
    const distance_km = Math.round(totalLength / 1000);
    const estimated_time_minutes = Math.round(totalDuration / 60);
    
    // Polyline from first section
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