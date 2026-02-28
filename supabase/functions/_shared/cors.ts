const allowedOrigins = [
  "https://corex-infrastructure.com",
  "http://localhost:5173",
];

export function getCorsHeaders(req?: Request): Record<string, string> {
  const origin = req?.headers.get("Origin") || "";
  const allowed = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
  };
}

// Legacy static headers (prefer getCorsHeaders(req) for dynamic origin)
export const corsHeaders = getCorsHeaders();

export function corsResponse(req?: Request) {
  return new Response("ok", { headers: getCorsHeaders(req) });
}

export function jsonResponse(data: unknown, status = 200, req?: Request) {
  const headers = getCorsHeaders(req);
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

export function errorResponse(message: string, status = 400, req?: Request) {
  const headers = getCorsHeaders(req);
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}
