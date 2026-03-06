import { f as createComponent, j as renderComponent, r as renderTemplate, i as createAstro, m as maybeRenderHead, h as addAttribute, k as renderSlot } from './astro/server_BVE5k6Zu.mjs';
import 'kleur/colors';
import { $ as $$Base } from './Base_NJ7nk25z.mjs';
/* empty css                       */

const $$Astro = createAstro();
const $$DocsLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$DocsLayout;
  const { title = "Docs", section = "" } = Astro2.props;
  const NAV = [
    { label: "Overview", href: "/docs" },
    { label: "Getting Started", href: "/docs/getting-started" },
    { label: "API Reference", href: "/docs/api" },
    { label: "Tutorials", href: "/docs/tutorials" },
    { label: "Changelog", href: "/docs/changelog" }
  ];
  const path = Astro2.url.pathname;
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": `${title} \u2014 Docs` }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<nav class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 border-b border-void-700/50 backdrop-blur-xl bg-void-900/80"> <a href="/" class="flex items-center gap-2.5"> <img src="/logo.png" alt="Qwenta" class="w-7 h-7 rounded-lg"> <span class="font-display text-white italic">Qwenta</span> <span class="text-slate-500 font-mono text-sm">/</span> <span class="text-slate-400 font-mono text-sm">docs</span> </a> <a href="/dashboard" class="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors">→ Dashboard</a> </nav> <div class="flex min-h-screen pt-16"> <!-- Sidebar --> <aside class="w-56 shrink-0 fixed left-0 top-16 bottom-0 border-r border-void-700 bg-void-900 overflow-y-auto py-8 px-4"> <p class="text-[9px] font-mono text-void-500 uppercase tracking-widest px-2 mb-3">Documentation</p> ${NAV.map((item) => renderTemplate`<a${addAttribute(item.href, "href")}${addAttribute(`block px-3 py-2 rounded-lg text-sm font-sans transition-colors mb-0.5 ${path === item.href ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-500 hover:text-slate-300 hover:bg-void-800"}`, "class")}> ${item.label} </a>`)} </aside> <!-- Content --> <main class="ml-56 flex-1 max-w-4xl px-12 py-12"> ${renderSlot($$result2, $$slots["default"])} </main> </div> ` })} `;
}, "D:/project/qwenta/src/layouts/DocsLayout.astro", void 0);

export { $$DocsLayout as $ };
