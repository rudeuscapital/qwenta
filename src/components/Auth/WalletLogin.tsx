import { useState } from "react";

type Step = "idle" | "connecting" | "signing" | "verifying" | "done" | "error";

const WALLET_OPTIONS = [
  { id:"metamask",     name:"MetaMask",      icon:"🦊", desc:"Browser extension", chain:"evm" as const },
  { id:"walletconnect",name:"WalletConnect", icon:"🔗", desc:"QR code / mobile",  chain:"evm" as const },
  { id:"coinbase",     name:"Coinbase Wallet",icon:"🔵",desc:"Coinbase app",      chain:"evm" as const },
  { id:"phantom",      name:"Phantom",       icon:"👻", desc:"Solana & EVM",      chain:"solana" as const },
];

export default function WalletLogin() {
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const connectEVM = async () => {
    const eth = (window as Window & { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
    if (!eth) throw new Error("No Ethereum provider found. Please install MetaMask.");

    const accounts = await eth.request({ method: "eth_requestAccounts" }) as string[];
    if (!accounts[0]) throw new Error("No account selected");
    // Use the address exactly as returned by the wallet (already checksummed)
    const address = accounts[0];

    setStep("signing");

    const nonceRes = await fetch("/api/auth?action=nonce");
    const { nonce } = await nonceRes.json() as { nonce: string };

    const domain = window.location.host;
    const origin = window.location.origin;
    const issuedAt = new Date().toISOString();
    // SIWE message must use the exact checksummed address the wallet expects
    const message = `${domain} wants you to sign in with your Ethereum account:\n${address}\n\nSign in to Qwenta Enterprise Platform\n\nURI: ${origin}\nVersion: 1\nChain ID: 1\nNonce: ${nonce}\nIssued At: ${issuedAt}`;

    const signature = await eth.request({ method: "personal_sign", params: [message, address] }) as string;
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
      const result = wallet.chain === "solana" ? await connectSolana() : await connectEVM();

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
                  <span class="text-2xl">{w.icon}</span>
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
