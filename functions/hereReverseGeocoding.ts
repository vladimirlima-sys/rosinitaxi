Deno.serve(async (req) => {
  try {
    const { lat, lng } = await req.json();
    
    if (!lat || !lng) {
      return Response.json({ error: 'lat and lng are required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('HERE_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'HERE_API_KEY not configured' }, { status: 500 });
    }

    const url = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${lat},${lng}&apikey=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('HERE API error:', data);
      return Response.json({ error: 'HERE API error', details: data }, { status: response.status });
    }

    const address = data.items?.[0]?.address?.label || 'Unknown location';
    
    return Response.json({ address });
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});