/* empty css                                   */
import { f as createComponent, j as renderComponent, r as renderTemplate } from '../chunks/astro/server_BVE5k6Zu.mjs';
import 'kleur/colors';
import { $ as $$Base } from '../chunks/Base_NJ7nk25z.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
export { renderers } from '../renderers.mjs';

const WALLET_OPTIONS = [
  { id: "metamask", name: "MetaMask", icon: "🦊", desc: "Browser extension", chain: "evm" },
  { id: "walletconnect", name: "WalletConnect", icon: "🔗", desc: "QR code / mobile", chain: "evm" },
  { id: "coinbase", name: "Coinbase Wallet", icon: "🔵", desc: "Coinbase app", chain: "evm" },
  { id: "phantom", name: "Phantom", icon: "👻", desc: "Solana & EVM", chain: "solana" }
];
function WalletLogin() {
  const [step, setStep] = useState("idle");
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const getProvider = (walletId) => {
    const win = window;
    const ethereum = win.ethereum;
    if (!ethereum) throw new Error("No Ethereum provider found. Please install a wallet extension.");
    const providers = ethereum.providers ?? [ethereum];
    if (walletId === "metamask") {
      const mm = providers.find((p) => p.isMetaMask && !p.isCoinbaseWallet);
      if (mm) return mm;
    }
    if (walletId === "coinbase") {
      const cb = providers.find((p) => p.isCoinbaseWallet) ?? win.coinbaseWalletExtension;
      if (cb) return cb;
      throw new Error("Coinbase Wallet not found. Please install the Coinbase Wallet extension.");
    }
    return providers[0] ?? ethereum;
  };
  const connectEVM = async (walletId) => {
    if (walletId === "walletconnect") {
      throw new Error("WalletConnect requires scanning a QR code with a mobile wallet. Please use MetaMask, Coinbase Wallet, or Phantom browser extension instead.");
    }
    const eth = getProvider(walletId);
    const accounts = await eth.request({ method: "eth_requestAccounts" });
    if (!accounts[0]) throw new Error("No account selected");
    const address = accounts[0];
    setStep("signing");
    const nonceRes = await fetch("/api/auth?action=nonce");
    const { nonce } = await nonceRes.json();
    const domain = window.location.host;
    const origin = window.location.origin;
    const issuedAt = (/* @__PURE__ */ new Date()).toISOString();
    const message = `${domain} wants you to sign in with your Ethereum account:
${address}

Sign in to Qwenta Enterprise Platform

URI: ${origin}
Version: 1
Chain ID: 1
Nonce: ${nonce}
Issued At: ${issuedAt}`;
    const signature = await eth.request({ method: "personal_sign", params: [message, address.toLowerCase()] });
    return { address, message, signature };
  };
  const connectSolana = async () => {
    const win = window;
    const provider = win.phantom?.solana;
    if (!provider?.isPhantom) throw new Error("Phantom wallet not found. Please install Phantom.");
    let publicKey = provider.publicKey;
    if (!publicKey) {
      const resp = await provider.connect();
      publicKey = resp.publicKey;
    }
    const address = publicKey.toString();
    setStep("signing");
    const nonceRes = await fetch("/api/auth?action=nonce");
    const { nonce } = await nonceRes.json();
    const domain = window.location.host;
    const issuedAt = (/* @__PURE__ */ new Date()).toISOString();
    const message = `${domain} wants you to sign in with your Solana account:
${address}

Sign in to Qwenta Enterprise Platform

Nonce: ${nonce}
Issued At: ${issuedAt}`;
    const encoded = new TextEncoder().encode(message);
    const signResult = await provider.signMessage(encoded);
    const sigBytes = signResult?.signature ?? signResult;
    const bytes = new Uint8Array(sigBytes);
    let raw = "";
    for (let i = 0; i < bytes.length; i++) {
      raw += String.fromCharCode(bytes[i]);
    }
    const signature = btoa(raw);
    return { address, message, signature };
  };
  const connect = async (walletId) => {
    setSelected(walletId);
    setStep("connecting");
    setError(null);
    try {
      const wallet = WALLET_OPTIONS.find((w) => w.id === walletId);
      const result = wallet.chain === "solana" ? await connectSolana() : await connectEVM(walletId);
      setStep("verifying");
      const authRes = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result)
      });
      const authData = await authRes.json();
      if (!authRes.ok || !authData.success) throw new Error(authData.error ?? "Authentication failed");
      setStep("done");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 800);
    } catch (e) {
      let msg = e?.message || "";
      if (e?.errors?.length) {
        msg = e.errors.map((err) => err?.message ?? String(err)).join("; ");
      }
      if (!msg || msg === "AggregateError") {
        try {
          msg = JSON.stringify(e, Object.getOwnPropertyNames(e));
        } catch {
          msg = String(e);
        }
      }
      setError(msg);
      setStep("error");
    }
  };
  return /* @__PURE__ */ jsxs("div", { class: "min-h-screen flex flex-col items-center justify-center bg-void-900 relative overflow-hidden px-4", children: [
    /* @__PURE__ */ jsx("div", { class: "absolute inset-0 bg-grid-void bg-grid opacity-100" }),
    /* @__PURE__ */ jsx("div", { class: "absolute inset-0 bg-glow-hero" }),
    /* @__PURE__ */ jsxs("div", { class: "relative z-10 w-full max-w-md", children: [
      /* @__PURE__ */ jsxs("div", { class: "text-center mb-10", children: [
        /* @__PURE__ */ jsxs("a", { href: "/", class: "inline-flex items-center gap-2.5 mb-6", children: [
          /* @__PURE__ */ jsx("img", { src: "/logo.png", alt: "Qwenta", class: "w-10 h-10 rounded-xl" }),
          /* @__PURE__ */ jsx("span", { class: "font-display text-white text-2xl italic", children: "Qwenta" })
        ] }),
        /* @__PURE__ */ jsx("h1", { class: "text-2xl font-semibold text-white mb-2", children: "Connect your wallet" }),
        /* @__PURE__ */ jsx("p", { class: "text-slate-500 text-sm", children: "Sign in with your wallet — no email, no password" })
      ] }),
      /* @__PURE__ */ jsxs("div", { class: "bg-void-800/80 backdrop-blur-sm border border-void-600 rounded-2xl p-6 shadow-panel", children: [
        step === "idle" && /* @__PURE__ */ jsx("div", { class: "space-y-3", children: WALLET_OPTIONS.map((w) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => connect(w.id),
            class: "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-void-600 bg-void-850 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all group",
            children: [
              /* @__PURE__ */ jsx("span", { class: "text-2xl", children: w.icon }),
              /* @__PURE__ */ jsxs("div", { class: "text-left", children: [
                /* @__PURE__ */ jsx("p", { class: "text-white font-medium text-sm group-hover:text-cyan-300 transition-colors", children: w.name }),
                /* @__PURE__ */ jsx("p", { class: "text-slate-600 text-xs", children: w.desc })
              ] }),
              /* @__PURE__ */ jsx("svg", { class: "ml-auto text-slate-600 group-hover:text-cyan-400 transition-colors", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", children: /* @__PURE__ */ jsx("path", { d: "M5 12h14M12 5l7 7-7 7" }) })
            ]
          },
          w.id
        )) }),
        (step === "connecting" || step === "signing" || step === "verifying") && /* @__PURE__ */ jsxs("div", { class: "text-center py-8", children: [
          /* @__PURE__ */ jsx("div", { class: "flex gap-1.5 justify-center mb-4", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsx(
            "span",
            {
              class: "w-2 h-2 rounded-full bg-cyan-400 animate-pulse-dot",
              style: { animationDelay: `${i * 0.16}s` }
            },
            i
          )) }),
          /* @__PURE__ */ jsx("p", { class: "text-white font-medium mb-1", children: step === "connecting" ? "Connecting..." : step === "signing" ? "Waiting for signature..." : "Verifying..." }),
          /* @__PURE__ */ jsx("p", { class: "text-slate-500 text-sm", children: step === "connecting" ? `Requesting ${WALLET_OPTIONS.find((w) => w.id === selected)?.name}` : step === "signing" ? "Check your wallet to sign the message" : "Verifying identity" })
        ] }),
        step === "done" && /* @__PURE__ */ jsxs("div", { class: "text-center py-8", children: [
          /* @__PURE__ */ jsx("div", { class: "w-12 h-12 rounded-full bg-bull-dim border border-bull/30 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx("span", { class: "text-bull text-xl", children: "✓" }) }),
          /* @__PURE__ */ jsx("p", { class: "text-white font-semibold mb-1", children: "Authenticated!" }),
          /* @__PURE__ */ jsx("p", { class: "text-slate-500 text-sm", children: "Redirecting to dashboard..." })
        ] }),
        step === "error" && /* @__PURE__ */ jsxs("div", { class: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { class: "p-4 rounded-xl bg-bear-dim border border-bear/20", children: [
            /* @__PURE__ */ jsx("p", { class: "text-bear text-sm font-medium mb-1", children: "Connection failed" }),
            /* @__PURE__ */ jsx("p", { class: "text-slate-400 text-xs", children: error })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setStep("idle");
                setError(null);
              },
              class: "w-full py-2.5 rounded-xl border border-void-500 text-slate-400 text-sm hover:border-cyan-500/30 hover:text-cyan-300 transition-all",
              children: "Try again"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { class: "text-center text-xs text-slate-700 mt-6", children: [
        "By connecting, you agree to sign a message proving wallet ownership.",
        /* @__PURE__ */ jsx("br", {}),
        "No transaction will be initiated."
      ] })
    ] })
  ] });
}

const $$Login = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": "Connect Wallet" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "WalletLogin", WalletLogin, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/project/qwenta/src/components/Auth/WalletLogin", "client:component-export": "default" })} ` })}`;
}, "D:/project/qwenta/src/pages/login.astro", void 0);

const $$file = "D:/project/qwenta/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
