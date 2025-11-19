// app/healthz/route.js
export async function GET() {
  return Response.json(
    {
      ok: true,
      version: '1.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
