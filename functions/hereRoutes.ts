Deno.serve(async (req) => {
  try {
    const { departure, arrival } = await req.json();
    
    if (!departure || !arrival) {
      return Response.json({ error: 'Coordenadas de partida e chegada obrigatórias' }, { status: 400 });
    }

    const apiKey = Deno.env.get('HERE_API_KEY');
    const url = `https://router.hereapi.com/v8/routes?transportMode=car&origin=${departure.lat},${departure.lng}&destination=${arrival.lat},${arrival.lng}&return=polyline,summary&apiKey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const summary = route.sections[0].summary;
      
      const distance_km = Math.round(summary.length / 1000 * 100) / 100;
      const duration_minutes = Math.round(summary.duration / 60);

      // Extract polyline if available
      let polyline = null;
      if (route.sections[0].polyline) {
        polyline = route.sections[0].polyline;
      }

      return Response.json({
        distance_km,
        estimated_time_minutes: duration_minutes,
        polyline,
        route: {
          distance: summary.length,
          duration: summary.duration
        }
      });
    }

    return Response.json({ error: 'Rota não encontrada' }, { status: 404 });
  } catch (error) {
    console.error('HERE Routes error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});