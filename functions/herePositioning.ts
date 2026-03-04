import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { latitude, longitude, accuracy } = await req.json();

    if (!latitude || !longitude) {
      return Response.json(
        { error: 'latitude and longitude required' },
        { status: 400 }
      );
    }

    const hereApiKey = Deno.env.get('HERE_API_KEY');
    if (!hereApiKey) {
      return Response.json(
        { error: 'HERE_API_KEY not configured' },
        { status: 500 }
      );
    }

    // HERE Positioning API endpoint
    const url = `https://positioning.hereapi.com/v2/locate?apikey=${hereApiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gps: {
          lat: latitude,
          lng: longitude,
          accuracy: accuracy || 50,
          age: 0
        }
      })
    });

    if (!response.ok) {
      console.error('HERE Positioning error:', response.status);
      // Fallback to original coordinates if HERE fails
      return Response.json({
        latitude,
        longitude,
        accuracy,
        source: 'fallback'
      });
    }

    const data = await response.json();

    return Response.json({
      latitude: data.location.lat,
      longitude: data.location.lng,
      accuracy: data.location.accuracy || accuracy,
      source: 'here'
    });
  } catch (error) {
    console.error('Positioning error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});