Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const searchText = body.searchText;
    const lang = body.lang || 'fr';

    if (!searchText) {
      return Response.json({ error: 'searchText is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('HERE_API_KEY');
    if (!apiKey) {
      console.error('HERE_API_KEY not configured');
      return Response.json({ error: 'HERE_API_KEY not configured' }, { status: 500 });
    }

    const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(searchText)}&apikey=${apiKey}&limit=5&lang=${lang}&in=countryCode:CHE,FRA,ITA,DEU,AUT,LIE`;

    console.log('[hereGeocoding] Fetching:', searchText);
    const response = await fetch(url);
    const text = await response.text();
    console.log('[hereGeocoding] Status:', response.status, 'Body:', text.substring(0, 300));

    if (!response.ok) {
      console.error('[hereGeocoding] HERE API error:', text);
      return Response.json({ error: 'HERE API error', details: text }, { status: response.status });
    }

    const data = JSON.parse(text);
    console.log('[hereGeocoding] Items found:', data.items?.length || 0);

    const results = (data.items || []).map(item => ({
      id: item.id,
      address: item.address.label,
      lat: item.position.lat,
      lng: item.position.lng,
    }));

    return Response.json({ results });
  } catch (error) {
    console.error('[hereGeocoding] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});