Deno.serve(async (req) => {
  try {
    const { searchText, lang = 'fr' } = await req.json();
    
    if (!searchText) {
      return Response.json({ error: 'searchText is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('HERE_API_KEY');
    if (!apiKey) {
      console.error('HERE_API_KEY not configured');
      return Response.json({ error: 'HERE_API_KEY not configured' }, { status: 500 });
    }

    const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(searchText)}&apikey=${apiKey}&limit=5&lang=${lang}`;
    
    console.log('[hereGeocoding] Fetching:', searchText);
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('[hereGeocoding] HERE API error:', JSON.stringify(data));
      return Response.json({ error: 'HERE API error', details: data }, { status: response.status });
    }

    console.log('[hereGeocoding] Items found:', data.items?.length || 0);

    const results = (data.items || []).map(item => ({
      id: item.id,
      address: item.address.label,
      lat: item.position.lat,
      lng: item.position.lng
    }));

    return Response.json({ results });
  } catch (error) {
    console.error('[hereGeocoding] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});