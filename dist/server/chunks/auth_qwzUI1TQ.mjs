import pg from 'pg';

const { Pool } = pg;
let pool = null;
function getDb() {
  if (!pool) {
    pool = new Pool({ connectionString: undefined                            , max: 10 });
    pool.on("error", (err) => console.error("PG pool error:", err));
  }
  return pool;
}
async function query(sql, params) {
  const result = await getDb().query(sql, params);
  return result.rows;
}
async function queryOne(sql, params) {
  const rows = await query(sql, params);
  return rows[0] ?? null;
}

const SESSION_COOKIE = "qwenta_session";
const SESSION_SECRET = "change-me-in-production-min-32-chars!!";
async function createSessionToken(user) {
  const payload = JSON.stringify({ ...user, exp: Date.now() + 7 * 24 * 60 * 60 * 1e3 });
  const encoded = Buffer.from(payload).toString("base64url");
  const { createHmac } = await import('crypto');
  const sig = createHmac("sha256", SESSION_SECRET).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}
async function verifySessionToken(token) {
  try {
    const [encoded, sig] = token.split(".");
    if (!encoded || !sig) return null;
    const { createHmac } = await import('crypto');
    const expected = createHmac("sha256", SESSION_SECRET).update(encoded).digest("base64url");
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
async function getOrCreateUser(walletAddress, ensName) {
  const addr = walletAddress.startsWith("0x") ? walletAddress.toLowerCase() : walletAddress;
  let user = await queryOne(
    "SELECT id, wallet_address, ens_name, tier FROM users WHERE wallet_address = $1",
    [addr]
  );
  if (!user) {
    [user] = await query(
      "INSERT INTO users (wallet_address, ens_name) VALUES ($1, $2) RETURNING id, wallet_address, ens_name, tier",
      [addr, ensName ?? null]
    );
    await query("INSERT INTO watchlists (user_id, name) VALUES ($1, 'My Watchlist')", [user.id]);
    await query("INSERT INTO portfolios (user_id, name) VALUES ($1, 'Main Portfolio')", [user.id]);
  } else {
    await query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id]);
  }
  return { id: user.id, wallet: user.wallet_address, ens: user.ens_name, tier: user.tier };
}
async function getSessionFromRequest(request) {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (!match) return null;
  return verifySessionToken(decodeURIComponent(match[1]));
}

export { SESSION_COOKIE as S, getSessionFromRequest as a, query as b, createSessionToken as c, getOrCreateUser as g, queryOne as q };
