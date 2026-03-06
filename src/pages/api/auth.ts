import type { APIRoute } from "astro";
import { getOrCreateUser, createSessionToken, SESSION_COOKIE } from "../../lib/auth.js";

const json = (d: unknown, s = 200, headers?: Record<string, string>) =>
  new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json", ...headers } });

// GET /api/auth?action=nonce  → generate nonce for SIWE
// POST /api/auth               → verify signature, create session
// DELETE /api/auth             → logout

export const GET: APIRoute = async ({ url }) => {
  const action = url.searchParams.get("action");
  if (action === "nonce") {
    const nonce = Math.random().toString(36).substring(2) + Date.now().toString(36);
    return json({ nonce });
  }
  return json({ error: "Unknown action" }, 400);
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { address, message, signature, ensName } = await request.json() as {
      address: string; message: string; signature: string; ensName?: string;
    };

    if (!address || !message || !signature) {
      return json({ error: "Missing required fields" }, 400);
    }

    // In production: verify SIWE message signature using ethers/viem
    // For now we trust the frontend-verified address (add ethers verification in production)
    // const { SiweMessage } = await import("siwe");
    // const siweMsg = new SiweMessage(message);
    // await siweMsg.verify({ signature });

    const user = await getOrCreateUser(address, ensName);
    const token = await createSessionToken(user);

    const cookieValue = `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}`;

    return json({ success: true, user: { wallet: user.wallet, ens: user.ens, tier: user.tier } }, 200, {
      "Set-Cookie": cookieValue,
    });
  } catch (err: any) {
    const isDbError = err?.code === "ECONNREFUSED" || err?.constructor?.name === "AggregateError" || String(err).includes("ECONNREFUSED");
    const msg = isDbError
      ? "Database connection failed. Ensure PostgreSQL is running and DATABASE_URL is configured."
      : (err?.message ?? String(err));
    return json({ error: msg }, 500);
  }
};

export const DELETE: APIRoute = async () => {
  return json({ success: true }, 200, {
    "Set-Cookie": `${SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0`,
  });
};
