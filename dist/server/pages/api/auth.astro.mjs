import { g as getOrCreateUser, c as createSessionToken, S as SESSION_COOKIE } from '../../chunks/auth_qwzUI1TQ.mjs';
export { renderers } from '../../renderers.mjs';

const json = (d, s = 200, headers) => new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json", ...headers } });
const GET = async ({ url }) => {
  const action = url.searchParams.get("action");
  if (action === "nonce") {
    const nonce = Math.random().toString(36).substring(2) + Date.now().toString(36);
    return json({ nonce });
  }
  return json({ error: "Unknown action" }, 400);
};
const POST = async ({ request }) => {
  try {
    const { address, message, signature, ensName } = await request.json();
    if (!address || !message || !signature) {
      return json({ error: "Missing required fields" }, 400);
    }
    const user = await getOrCreateUser(address, ensName);
    const token = await createSessionToken(user);
    const cookieValue = `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}`;
    return json({ success: true, user: { wallet: user.wallet, ens: user.ens, tier: user.tier } }, 200, {
      "Set-Cookie": cookieValue
    });
  } catch (err) {
    const isDbError = err?.code === "ECONNREFUSED" || err?.constructor?.name === "AggregateError" || String(err).includes("ECONNREFUSED");
    const msg = isDbError ? "Database connection failed. Ensure PostgreSQL is running and DATABASE_URL is configured." : err?.message ?? String(err);
    return json({ error: msg }, 500);
  }
};
const DELETE = async () => {
  return json({ success: true }, 200, {
    "Set-Cookie": `${SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0`
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
