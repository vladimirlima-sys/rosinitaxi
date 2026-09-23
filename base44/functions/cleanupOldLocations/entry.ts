import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Delete driver locations older than 7 days
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const oldLocations = await base44.asServiceRole.entities.DriverLocation.filter(
      { timestamp: { $lt: sevenDaysAgo } },
      '-timestamp',
      1000
    );

    if (oldLocations && oldLocations.length > 0) {
      for (const location of oldLocations) {
        await base44.asServiceRole.entities.DriverLocation.delete(location.id);
      }
      console.log(`Cleanup: Deleted ${oldLocations.length} old location records`);
    }

    return Response.json({ success: true, deleted: oldLocations?.length || 0 });
  } catch (error) {
    console.error('Cleanup error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});