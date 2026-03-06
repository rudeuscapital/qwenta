import { query, queryOne } from "./db.js";

export interface SessionUser {
  id: number;
  wallet: string;
  ens?: string;
  tier: string;
}

// Cookie name for session
export const SESSION_COOKIE = "qwenta_session";
export const SESSION_SECRET = import.meta.env.SESSION_SECRET ?? "change-me-in-production-min-32-chars!!";

// Simple signed session using base64 + HMAC-like approach
export async function createSessionToken(user: SessionUser): Promise<string> {
  const payload = JSON.stringify({ ...user, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  const encoded = Buffer.from(payload).toString("base64url");
  // Simple HMAC using crypto
  const { createHmac } = await import("crypto");
  const sig = createHmac("sha256", SESSION_SECRET).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const [encoded, sig] = token.split(".");
    if (!encoded || !sig) return null;
    const { createHmac } = await import("crypto");
    const expected = createHmac("sha256", SESSION_SECRET).update(encoded).digest("base64url");
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString());
    if (payload.exp < Date.now()) return null;
    return payload as SessionUser;
  } catch { return null; }
}

export async function getOrCreateUser(walletAddress: string, ensName?: string): Promise<SessionUser> {
  const addr = walletAddress.toLowerCase();
  let user = await queryOne<{ id: number; wallet_address: string; ens_name: string; tier: string }>(
    "SELECT id, wallet_address, ens_name, tier FROM users WHERE wallet_address = $1", [addr]
  );
  if (!user) {
    [user] = await query<{ id: number; wallet_address: string; ens_name: string; tier: string }>(
      "INSERT INTO users (wallet_address, ens_name) VALUES ($1, $2) RETURNING id, wallet_address, ens_name, tier",
      [addr, ensName ?? null]
    );
    // Auto-create default watchlist & portfolio
    await query("INSERT INTO watchlists (user_id, name) VALUES ($1, 'My Watchlist')", [user!.id]);
    await query("INSERT INTO portfolios (user_id, name) VALUES ($1, 'Main Portfolio')", [user!.id]);
  } else {
    await query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id]);
  }
  return { id: user!.id, wallet: user!.wallet_address, ens: user!.ens_name, tier: user!.tier };
}

export async function getSessionFromRequest(request: Request): Promise<SessionUser | null> {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (!match) return null;
  return verifySessionToken(decodeURIComponent(match[1]));
}
