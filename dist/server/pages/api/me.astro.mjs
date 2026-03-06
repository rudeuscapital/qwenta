import { a as getSessionFromRequest } from '../../chunks/auth_qwzUI1TQ.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ request }) => {
  const user = await getSessionFromRequest(request);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  return new Response(JSON.stringify({ user }), { headers: { "Content-Type": "application/json" } });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
