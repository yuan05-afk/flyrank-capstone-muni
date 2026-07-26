import { NextRequest } from "next/server";

export const SESSION_COOKIE = "muni_session";

export function requireDemoAuth(request: NextRequest): Response | null {
  const expected = process.env.DEMO_API_KEY || "muni_demo_key_001";
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  const headerKey =
    request.headers.get("x-demo-key") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (cookie === expected || headerKey === expected) return null;
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
