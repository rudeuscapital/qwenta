import { f as createComponent, r as renderTemplate, k as renderSlot, h as addAttribute, l as renderHead, i as createAstro } from './astro/server_BVE5k6Zu.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                       */

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$Base = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Base;
  const { title = "Qwenta", description = "Enterprise AI Trading Platform", fullscreen = false } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<html lang="en" class="h-full" data-astro-cid-5hce7sga> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description"', "><title>", ' \u2014 Qwenta</title><!-- PWA --><link rel="manifest" href="/site.webmanifest"><meta name="theme-color" content="#060810"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="Qwenta"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"><link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500;600&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet">', "</head> <body", " data-astro-cid-5hce7sga> ", ' <script>\n    if ("serviceWorker" in navigator) {\n      navigator.serviceWorker.register("/sw.js").catch(() => {});\n    }\n  <\/script> </body> </html>'])), addAttribute(description, "content"), title, renderHead(), addAttribute(`h-full text-slate-300 font-sans antialiased ${fullscreen ? "overflow-hidden" : "overflow-x-hidden"}`, "class"), renderSlot($$result, $$slots["default"]));
}, "D:/project/qwenta/src/layouts/Base.astro", void 0);

export { $$Base as $ };
