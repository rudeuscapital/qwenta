/* empty css                                      */
import { f as createComponent, j as renderComponent, r as renderTemplate, i as createAstro } from '../../chunks/astro/server_BVE5k6Zu.mjs';
import 'kleur/colors';
import { $ as $$Base } from '../../chunks/Base_NJ7nk25z.mjs';
import { N as NewsView } from '../../chunks/Views_BWA3KGo0.mjs';
import { a as getSessionFromRequest } from '../../chunks/auth_qwzUI1TQ.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$News = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$News;
  const user = await getSessionFromRequest(Astro2.request);
  if (!user) return Astro2.redirect("/login");
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": "News & Sentiment", "fullscreen": true }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "NewsView", NewsView, { "wallet": user.wallet, "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/project/qwenta/src/components/Dashboard/NewsView", "client:component-export": "default" })} ` })}`;
}, "D:/project/qwenta/src/pages/dashboard/news.astro", void 0);

const $$file = "D:/project/qwenta/src/pages/dashboard/news.astro";
const $$url = "/dashboard/news";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$News,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
