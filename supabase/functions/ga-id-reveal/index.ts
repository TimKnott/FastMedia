// Temporary helper: returns the GA4 Measurement ID (a public, non-sensitive value
// that is embedded in every page's source) so it can be installed in index.html.
Deno.serve(() => {
  const id = Deno.env.get('GOOGLE_ANALYTICS_MEASUREMENT_ID') ?? '';
  return new Response(JSON.stringify({ id }), { headers: { 'Content-Type': 'application/json' } });
});
