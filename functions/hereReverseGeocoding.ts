Deno.serve(async (req) => {
  try {
    const { lat, lng } = await req.json();
    
    if (lat === undefined || lat === null || lng === undefined || lng === null) {
      return Response.json({ error: 'lat and lng are required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('HERE_API_KEY');
    if (!apiKey) {
      console.error('[hereReverseGeocoding] HERE_API_KEY not configured');
      return Response.json({ error: 'HERE_API_KEY not configured' }, { status: 500 });
    }

    const url = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${lat},${lng}&apikey=${apiKey}&lang=fr`;
    
    console.log(`[hereReverseGeocoding] Fetching for lat=${lat}, lng=${lng}`);
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('[hereReverseGeocoding] HERE API error:', JSON.stringify(data));
      return Response.json({ error: 'HERE API error', details: data }, { status: response.status });
    }

    const address = data.items?.[0]?.address?.label || null;
    console.log('[hereReverseGeocoding] Address found:', address);
    
    return Response.json({ address });
  } catch (error) {
    console.error('[hereReverseGeocoding] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});