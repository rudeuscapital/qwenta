import type { APIRoute } from "astro";
import { getSessionFromRequest } from "../../lib/auth.js";

export const GET: APIRoute = async ({ request }) => {
  const user = await getSessionFromRequest(request);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  return new Response(JSON.stringify({ user }), { headers: { "Content-Type": "application/json" } });
};
