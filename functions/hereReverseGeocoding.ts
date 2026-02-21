Deno.serve(async (req) => {
  try {
    const { lat, lng } = await req.json();
    
    if (!lat || !lng) {
      return Response.json({ error: 'Latitude e longitude obrigatórias' }, { status: 400 });
    }

    const apiKey = Deno.env.get('HERE_API_KEY');
    const url = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${lat},${lng}&apiKey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const address = data.items[0].address.label;
      return Response.json({ address });
    }

    return Response.json({ address: '' });
  } catch (error) {
    console.error('HERE Reverse Geocoding error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});