Deno.serve(async (req) => {
  try {
    const { searchText, lang = 'pt' } = await req.json();
    
    if (!searchText) {
      return Response.json({ results: [] });
    }

    const apiKey = Deno.env.get('HERE_API_KEY');
    const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(searchText)}&apiKey=${apiKey}&limit=5`;

    const response = await fetch(url);
    const data = await response.json();

    const results = (data.items || []).map(item => ({
      address: item.address.label,
      lat: item.position.lat,
      lng: item.position.lng,
      id: item.id
    }));

    return Response.json({ results });
  } catch (error) {
    console.error('HERE Geocoding error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});