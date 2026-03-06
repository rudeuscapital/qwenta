/* empty css                                      */
import { f as createComponent, j as renderComponent, r as renderTemplate, i as createAstro } from '../../chunks/astro/server_BVE5k6Zu.mjs';
import 'kleur/colors';
import { $ as $$Base } from '../../chunks/Base_NJ7nk25z.mjs';
import { C as CompareView } from '../../chunks/Views_bR_vu94x.mjs';
import { a as getSessionFromRequest } from '../../chunks/auth_qwzUI1TQ.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$Compare = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Compare;
  const user = await getSessionFromRequest(Astro2.request);
  if (!user) return Astro2.redirect("/login");
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": "Compare", "fullscreen": true }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "CompareView", CompareView, { "wallet": user.wallet, "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/project/qwenta/src/components/Dashboard/CompareView", "client:component-export": "default" })} ` })}`;
}, "D:/project/qwenta/src/pages/dashboard/compare.astro", void 0);

const $$file = "D:/project/qwenta/src/pages/dashboard/compare.astro";
const $$url = "/dashboard/compare";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Compare,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
