Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { lat, lng } = body;

    if (lat === undefined || lng === undefined) {
      return Response.json({ error: 'lat and lng are required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('HERE_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'HERE_API_KEY not configured' }, { status: 500 });
    }

    const url = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${lat},${lng}&lang=fr&apikey=${apiKey}`;
    console.log('[hereReverseGeocoding] URL:', url.replace(apiKey, '***'));

    const response = await fetch(url);
    const text = await response.text();
    console.log('[hereReverseGeocoding] Status:', response.status, 'Body:', text.substring(0, 500));

    if (!response.ok) {
      return Response.json({ error: `HERE API error ${response.status}`, details: text }, { status: 500 });
    }

    const data = JSON.parse(text);
    const item = data.items?.[0];
    
    if (!item) {
      return Response.json({ error: 'No address found', address: null });
    }

    // Build a clean address: Street + city
    const addr = item.address;
    const parts = [];
    if (addr.street) parts.push(addr.street);
    if (addr.houseNumber) parts[0] = (parts[0] || '') + ' ' + addr.houseNumber;
    if (addr.city) parts.push(addr.city);
    if (addr.postalCode) parts.push(addr.postalCode);
    if (addr.countryName) parts.push(addr.countryName);

    const address = addr.label || parts.filter(Boolean).join(', ');
    console.log('[hereReverseGeocoding] Found address:', address);

    return Response.json({ address, lat: item.position?.lat, lng: item.position?.lng });
  } catch (error) {
    console.error('[hereReverseGeocoding] Exception:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});