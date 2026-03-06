import { useState } from "react";

type Step = "idle" | "connecting" | "signing" | "verifying" | "done" | "error";

const WalletIcons: Record<string, JSX.Element> = {
  metamask: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M27.2 3.6L18.4 10.4l1.6-3.8 7.2-3z" fill="#E2761B" stroke="#E2761B" strokeWidth=".1" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4.8 3.6l8.7 6.9-1.5-3.9-7.2-3zM24 21.8l-2.3 3.6 5 1.4 1.4-4.9-4.1-.1zM3.9 21.9l1.4 4.9 5-1.4-2.3-3.6-4.1.1z" fill="#E4761B" stroke="#E4761B" strokeWidth=".1" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 14.2l-1.4 2.1 5 .2-.2-5.3-3.4 3zM22 14.2l-3.5-3.1-.1 5.4 5-.2-1.4-2.1zM12.7 25.4l3-1.5-2.6-2-.4 3.5zM16.3 23.9l3 1.5-.4-3.5-2.6 2z" fill="#E4761B" stroke="#E4761B" strokeWidth=".1" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19.3 25.4l-3-1.5.2 1.7v.7l2.8-1zM12.7 25.4l2.8.9v-.7l.2-1.7-3 1.5z" fill="#D7C1B3" stroke="#D7C1B3" strokeWidth=".1" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15.6 20.3l-2.5-.7 1.8-.8.7 1.5zM16.4 20.3l.7-1.5 1.8.8-2.5.7z" fill="#233447" stroke="#233447" strokeWidth=".1" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.7 25.4l.4-3.6-2.7.1 2.3 3.5zM18.9 21.8l.4 3.6 2.3-3.5-2.7-.1zM23.4 16.3l-5 .2.5 2.8.7-1.5 1.8.8 2-2.3zM13.1 18.8l1.8-.8.7 1.5.5-2.8-5-.2 2 2.3z" fill="#CD6116" stroke="#CD6116" strokeWidth=".1" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.6 16.3l2.1 4.1-.1-2-2-2.1zM21.4 18.4l-.1 2 2.1-4.1-2 2.1zM13.6 16.5l-.5 2.8.6 3 .1-2.2-1.3-3.6h1.1zM18.4 16.5l-1.2 3.6.1 2.2.6-3-.5-2.8z" fill="#E4751F" stroke="#E4751F" strokeWidth=".1" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.9 19.3l-.6 3 .4.3 2.6-2 .1-2-2.5.7zM13.1 18.6l.1 2 2.6 2 .4-.3-.6-3-2.5-.7z" fill="#F6851B" stroke="#F6851B" strokeWidth=".1" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.9 26.3v-.7l-.2-.2h-5.4l-.2.2v.7l-2.8-.9 1 .8 2 1.4h5.5l2-1.4 1-.8-2.9.9z" fill="#C0AD9E" stroke="#C0AD9E" strokeWidth=".1" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16.3 23.9l-.4-.3h-2.3l-.4.3-.2 1.7 2.8-.9h.1l2.8.9-.2-1.7-.4-.3h-1.8z" fill="#161616" stroke="#161616" strokeWidth=".1" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M27.6 11l.7-3.5-1.1-3.5-8.9 6.6 3.4 2.9 4.8 1.4 1.1-1.2-.5-.3.7-.7-.5-.4.7-.5-.5-.4-.2.1zM3.7 7.5l.7 3.5-.5.3.8.5-.5.4.7.7-.5.3 1.1 1.2 4.8-1.4 3.4-2.9L4.8 3.6 3.7 7.5z" fill="#763D16" stroke="#763D16" strokeWidth=".1" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M26.5 14.9l-4.8-1.4 1.4 2.1-2.1 4.1 2.8 0h4.1l-1.4-4.8zM10.3 13.5l-4.8 1.4-1.6 4.8h4.1l2.8 0-2.1-4.1 1.6-2.1zM18.4 16.5l.3-5.3 1.4-3.8H12l1.4 3.8.3 5.3.1 1.4v3.5h2.4v-3.5l.2-1.4z" fill="#F6851B" stroke="#F6851B" strokeWidth=".1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  walletconnect: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#3B99FC"/>
      <path d="M10.1 12.8c3.3-3.2 8.5-3.2 11.8 0l.4.4c.2.2.2.4 0 .6l-1.3 1.2c-.1.1-.2.1-.3 0l-.5-.5c-2.3-2.2-5.9-2.2-8.2 0l-.6.5c-.1.1-.2.1-.3 0l-1.3-1.2c-.2-.2-.2-.4 0-.6l.3-.4zm14.6 2.7l1.1 1.1c.2.2.2.4 0 .6l-5.1 5c-.2.2-.4.2-.6 0l-3.6-3.5c0-.1-.1-.1-.1 0l-3.6 3.5c-.2.2-.4.2-.6 0l-5.1-5c-.2-.2-.2-.4 0-.6l1.1-1.1c.2-.2.4-.2.6 0l3.6 3.5c0 .1.1.1.1 0l3.6-3.5c.2-.2.4-.2.6 0l3.6 3.5c0 .1.1.1.1 0l3.6-3.5c.2-.2.5-.2.6 0z" fill="#fff"/>
    </svg>
  ),
  coinbase: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#0052FF"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M16 6C10.48 6 6 10.48 6 16s4.48 10 10 10 10-4.48 10-10S21.52 6 16 6zm-2.5 7.5a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3z" fill="#fff"/>
    </svg>
  ),
  phantom: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="url(#phantom_grad)"/>
      <defs><linearGradient id="phantom_grad" x1="0" y1="0" x2="32" y2="32"><stop stopColor="#534BB1"/><stop offset="1" stopColor="#551BF9"/></linearGradient></defs>
      <path d="M25.6 16.3c0 .3-.2.5-.5.5h-1.2c-.3 0-.5-.3-.5-.6.1-2.5-.8-4.5-2.8-5.9-1.5-1-3.2-1.3-5-1.1-2.6.3-4.6 1.8-5.8 4.1-.8 1.5-1 3.1-.7 4.8.5 2.8 2.8 5.2 5.6 5.7 1.2.2 2.3.1 3.4-.3.3-.1.5 0 .6.3l.4 1c.1.3 0 .5-.3.7-1.5.6-3 .8-4.6.5-4.2-.7-7.3-4-8-8.2-.4-2.2.1-4.3 1.1-6.2C9 8.8 12 7 15.3 7c2.3 0 4.4.8 6.1 2.4 1.8 1.7 2.9 3.8 3 6.3 0 .2 0 .4 0 .6h1.2zm-7.1.7c0 .8-.6 1.4-1.4 1.4s-1.4-.6-1.4-1.4.6-1.4 1.4-1.4 1.4.6 1.4 1.4zm-5 0c0 .8-.6 1.4-1.4 1.4s-1.4-.6-1.4-1.4.6-1.4 1.4-1.4 1.4.6 1.4 1.4z" fill="#fff"/>
    </svg>
  ),
};

const WALLET_OPTIONS = [
  { id:"metamask",     name:"MetaMask",      desc:"Browser extension", chain:"evm" as const },
  { id:"walletconnect",name:"WalletConnect", desc:"QR code / mobile",  chain:"evm" as const },
  { id:"coinbase",     name:"Coinbase Wallet",desc:"Coinbase app",      chain:"evm" as const },
  { id:"phantom",      name:"Phantom",       desc:"Solana & EVM",      chain:"solana" as const },
];

export default function WalletLogin() {
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const getProvider = (walletId: string) => {
    const win = window as any;
    const ethereum = win.ethereum;
    if (!ethereum) throw new Error("No Ethereum provider found. Please install a wallet extension.");

    // When multiple wallets are installed, ethereum.providers contains all of them
    const providers: any[] = ethereum.providers ?? [ethereum];

    if (walletId === "metamask") {
      const mm = providers.find((p: any) => p.isMetaMask && !p.isCoinbaseWallet);
      if (mm) return mm;
    }
    if (walletId === "coinbase") {
      // Coinbase may also inject as window.coinbaseWalletExtension
      const cb = providers.find((p: any) => p.isCoinbaseWallet) ?? win.coinbaseWalletExtension;
      if (cb) return cb;
      throw new Error("Coinbase Wallet not found. Please install the Coinbase Wallet extension.");
    }

    // Fallback: use first available provider
    return providers[0] ?? ethereum;
  };

  const connectEVM = async (walletId: string) => {
    if (walletId === "walletconnect") {
      throw new Error("WalletConnect requires scanning a QR code with a mobile wallet. Please use MetaMask, Coinbase Wallet, or Phantom browser extension instead.");
    }
    const eth = getProvider(walletId);

    const accounts = await eth.request({ method: "eth_requestAccounts" }) as string[];
    if (!accounts[0]) throw new Error("No account selected");
    const address = accounts[0];

    setStep("signing");

    const nonceRes = await fetch("/api/auth?action=nonce");
    const { nonce } = await nonceRes.json() as { nonce: string };

    const domain = window.location.host;
    const origin = window.location.origin;
    const issuedAt = new Date().toISOString();
    const message = `${domain} wants you to sign in with your Ethereum account:\n${address}\n\nSign in to Qwenta Enterprise Platform\n\nURI: ${origin}\nVersion: 1\nChain ID: 1\nNonce: ${nonce}\nIssued At: ${issuedAt}`;

    // personal_sign params: [message, address] — address must match connected account
    const signature = await eth.request({ method: "personal_sign", params: [message, address.toLowerCase()] }) as string;
    return { address, message, signature };
  };

  const connectSolana = async () => {
    const win = window as any;
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
    const { nonce } = await nonceRes.json() as { nonce: string };

    const domain = window.location.host;
    const issuedAt = new Date().toISOString();
    const message = `${domain} wants you to sign in with your Solana account:\n${address}\n\nSign in to Qwenta Enterprise Platform\n\nNonce: ${nonce}\nIssued At: ${issuedAt}`;

    const encoded = new TextEncoder().encode(message);
    const signResult = await provider.signMessage(encoded);
    const sigBytes: Uint8Array = signResult?.signature ?? signResult;

    const bytes = new Uint8Array(sigBytes);
    let raw = "";
    for (let i = 0; i < bytes.length; i++) {
      raw += String.fromCharCode(bytes[i]);
    }
    const signature = btoa(raw);

    return { address, message, signature };
  };

  const connect = async (walletId: string) => {
    setSelected(walletId);
    setStep("connecting");
    setError(null);

    try {
      const wallet = WALLET_OPTIONS.find(w => w.id === walletId)!;
      const result = wallet.chain === "solana" ? await connectSolana() : await connectEVM(walletId);

      setStep("verifying");

      const authRes = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });
      const authData = await authRes.json() as { success?: boolean; error?: string };
      if (!authRes.ok || !authData.success) throw new Error(authData.error ?? "Authentication failed");

      setStep("done");
      setTimeout(() => { window.location.href = "/dashboard"; }, 800);

    } catch (e: any) {
      let msg = e?.message || "";
      if (e?.errors?.length) {
        msg = e.errors.map((err: any) => err?.message ?? String(err)).join("; ");
      }
      if (!msg || msg === "AggregateError") {
        // Try to get more info
        try { msg = JSON.stringify(e, Object.getOwnPropertyNames(e)); } catch { msg = String(e); }
      }
      setError(msg);
      setStep("error");
    }
  };

  return (
    <div class="min-h-screen flex flex-col items-center justify-center bg-void-900 relative overflow-hidden px-4">
      {/* Grid bg */}
      <div class="absolute inset-0 bg-grid-void bg-grid opacity-100" />
      <div class="absolute inset-0 bg-glow-hero" />

      <div class="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div class="text-center mb-10">
          <a href="/" class="inline-flex items-center gap-2.5 mb-6">
            <img src="/logo.png" alt="Qwenta" class="w-10 h-10 rounded-xl" />
            <span class="font-display text-white text-2xl italic">Qwenta</span>
          </a>
          <h1 class="text-2xl font-semibold text-white mb-2">Connect your wallet</h1>
          <p class="text-slate-500 text-sm">Sign in with your wallet — no email, no password</p>
        </div>

        {/* Card */}
        <div class="bg-void-800/80 backdrop-blur-sm border border-void-600 rounded-2xl p-6 shadow-panel">
          {step === "idle" && (
            <div class="space-y-3">
              {WALLET_OPTIONS.map((w) => (
                <button key={w.id} onClick={() => connect(w.id)}
                  class="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-void-600 bg-void-850 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all group">
                  <span class="shrink-0">{WalletIcons[w.id]}</span>
                  <div class="text-left">
                    <p class="text-white font-medium text-sm group-hover:text-cyan-300 transition-colors">{w.name}</p>
                    <p class="text-slate-600 text-xs">{w.desc}</p>
                  </div>
                  <svg class="ml-auto text-slate-600 group-hover:text-cyan-400 transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              ))}
            </div>
          )}

          {(step === "connecting" || step === "signing" || step === "verifying") && (
            <div class="text-center py-8">
              <div class="flex gap-1.5 justify-center mb-4">
                {[0,1,2].map(i => (
                  <span key={i} class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse-dot"
                    style={{ animationDelay: `${i * 0.16}s` }} />
                ))}
              </div>
              <p class="text-white font-medium mb-1">
                {step === "connecting" ? "Connecting..." : step === "signing" ? "Waiting for signature..." : "Verifying..."}
              </p>
              <p class="text-slate-500 text-sm">
                {step === "connecting" ? `Requesting ${WALLET_OPTIONS.find(w=>w.id===selected)?.name}` : step === "signing" ? "Check your wallet to sign the message" : "Verifying identity"}
              </p>
            </div>
          )}

          {step === "done" && (
            <div class="text-center py-8">
              <div class="w-12 h-12 rounded-full bg-bull-dim border border-bull/30 flex items-center justify-center mx-auto mb-4">
                <span class="text-bull text-xl">✓</span>
              </div>
              <p class="text-white font-semibold mb-1">Authenticated!</p>
              <p class="text-slate-500 text-sm">Redirecting to dashboard...</p>
            </div>
          )}

          {step === "error" && (
            <div class="space-y-4">
              <div class="p-4 rounded-xl bg-bear-dim border border-bear/20">
                <p class="text-bear text-sm font-medium mb-1">Connection failed</p>
                <p class="text-slate-400 text-xs">{error}</p>
              </div>
              <button onClick={() => { setStep("idle"); setError(null); }}
                class="w-full py-2.5 rounded-xl border border-void-500 text-slate-400 text-sm hover:border-cyan-500/30 hover:text-cyan-300 transition-all">
                Try again
              </button>
            </div>
          )}
        </div>

        <p class="text-center text-xs text-slate-700 mt-6">
          By connecting, you agree to sign a message proving wallet ownership.<br/>
          No transaction will be initiated.
        </p>
      </div>
    </div>
  );
}
