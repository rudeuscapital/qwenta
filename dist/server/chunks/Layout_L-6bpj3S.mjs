import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';

const NAV = [
  { href: "/dashboard", icon: "◈", label: "Dashboard" },
  { href: "/dashboard/watchlist", icon: "◉", label: "Watchlist" },
  { href: "/dashboard/portfolio", icon: "◎", label: "Portfolio" },
  { href: "/dashboard/screener", icon: "⊞", label: "Screener" },
  { href: "/dashboard/compare", icon: "⊟", label: "Compare" },
  { href: "/dashboard/news", icon: "⊙", label: "News" }
];
const DOCS_NAV = [
  { href: "/docs", label: "Overview" },
  { href: "/docs/api", label: "API Reference" },
  { href: "/docs/tutorials", label: "Tutorials" },
  { href: "/docs/changelog", label: "Changelog" }
];
function DashboardLayout({ active, children, wallet }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    setMobileOpen(false);
  }, [active]);
  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/";
  };
  return /* @__PURE__ */ jsxs("div", { class: "flex h-screen overflow-hidden bg-void-900", children: [
    mobileOpen && /* @__PURE__ */ jsx("div", { class: "fixed inset-0 bg-void-900/70 z-40 md:hidden", onClick: () => setMobileOpen(false) }),
    /* @__PURE__ */ jsxs("aside", { class: `
        flex flex-col border-r border-void-700 bg-void-850 shrink-0 transition-all duration-200
        fixed md:relative inset-y-0 left-0 z-50
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        ${collapsed ? "w-14" : "w-52"}
      `, children: [
      /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-3 px-4 py-4 border-b border-void-700", children: [
        /* @__PURE__ */ jsxs("a", { href: "/", class: "flex items-center gap-2 shrink-0", children: [
          /* @__PURE__ */ jsx("img", { src: "/logo.png", alt: "Qwenta", class: "w-7 h-7 rounded-lg shrink-0" }),
          !collapsed && /* @__PURE__ */ jsx("span", { class: "font-display text-white text-sm italic", children: "Qwenta" })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              if (window.innerWidth < 768) setMobileOpen(false);
              else setCollapsed(!collapsed);
            },
            class: "ml-auto text-void-500 hover:text-slate-400 transition-colors text-xs shrink-0",
            children: collapsed ? "▶" : "◀"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("nav", { class: "flex-1 py-3 px-2 space-y-0.5 overflow-y-auto", children: [
        NAV.map((item) => {
          const isActive = active === item.href;
          return /* @__PURE__ */ jsxs(
            "a",
            {
              href: item.href,
              class: `flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all text-sm ${isActive ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-void-500 hover:text-slate-300 hover:bg-void-700"}`,
              children: [
                /* @__PURE__ */ jsx("span", { class: `text-base shrink-0 ${isActive ? "text-cyan-400" : ""}`, children: item.icon }),
                !collapsed && /* @__PURE__ */ jsx("span", { class: `text-xs tracking-wide font-medium ${isActive ? "text-cyan-300" : ""}`, children: item.label }),
                isActive && !collapsed && /* @__PURE__ */ jsx("span", { class: "ml-auto w-1 h-1 rounded-full bg-cyan-400" })
              ]
            },
            item.href
          );
        }),
        !collapsed && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { class: "h-px bg-void-700 my-2" }),
          /* @__PURE__ */ jsx("p", { class: "text-[9px] font-mono text-void-600 px-2.5 py-1 tracking-widest uppercase", children: "Docs" }),
          DOCS_NAV.map((item) => /* @__PURE__ */ jsxs(
            "a",
            {
              href: item.href,
              class: "flex items-center gap-3 px-2.5 py-1.5 rounded text-[10px] font-mono text-void-500 hover:text-slate-400 transition-colors",
              children: [
                "· ",
                item.label
              ]
            },
            item.href
          ))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { class: "px-3 py-3 border-t border-void-700", children: [
        !collapsed && wallet && /* @__PURE__ */ jsxs("div", { class: "mb-2 px-2", children: [
          /* @__PURE__ */ jsx("p", { class: "text-[9px] font-mono text-void-500 tracking-widest", children: "CONNECTED" }),
          /* @__PURE__ */ jsxs("p", { class: "text-[10px] font-mono text-cyan-400 mt-0.5 truncate", children: [
            wallet.slice(0, 6),
            "...",
            wallet.slice(-4)
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: logout,
            class: `w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-[10px] font-mono text-void-500 hover:text-bear transition-colors ${collapsed ? "justify-center" : ""}`,
            children: [
              /* @__PURE__ */ jsx("span", { children: "⏏" }),
              !collapsed && "Disconnect"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "flex-1 flex flex-col min-w-0 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { class: "flex md:hidden items-center gap-3 px-3 py-2 border-b border-void-700 bg-void-850 shrink-0", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setMobileOpen(true), class: "text-slate-400 hover:text-cyan-400 transition-colors p-1", children: /* @__PURE__ */ jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { d: "M3 12h18M3 6h18M3 18h18" }) }) }),
        /* @__PURE__ */ jsxs("a", { href: "/", class: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx("img", { src: "/logo.png", alt: "Qwenta", class: "w-5 h-5 rounded" }),
          /* @__PURE__ */ jsx("span", { class: "font-display text-white text-sm italic", children: "Qwenta" })
        ] }),
        /* @__PURE__ */ jsx("span", { class: "text-[9px] font-mono text-cyan-400 ml-auto", children: NAV.find((n) => n.href === active)?.label })
      ] }),
      children
    ] })
  ] });
}

export { DashboardLayout as D };
