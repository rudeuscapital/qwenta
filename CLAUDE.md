# Qwenta - AI-Powered Trading Platform

## Project Overview

Qwenta is an institutional-grade AI trading intelligence platform. It provides real-time market data, technical analysis, portfolio management, news sentiment analysis, and a private AI analyst — all authenticated via crypto wallets (no email/password). The platform runs as a PWA installable on mobile and desktop.

**Live domain:** qwenta.xyz (pending DNS configuration)

## Tech Stack

- **Framework:** Astro 4.x SSR with React 18 islands
- **Styling:** Tailwind CSS 3.x with custom design system (void/cyan/lime theme)
- **Database:** PostgreSQL via `pg` (connection pooled)
- **AI:** Ollama with Qwen model (local, private — no third-party API)
- **Market Data:** Yahoo Finance API (crumb+cookie auth flow)
- **Auth:** Wallet-based SIWE (Sign-In with Ethereum) + Solana signing
- **Charts:** Recharts for interactive charting
- **Export:** XLSX/CSV via `xlsx` package
- **Runtime:** Node.js (`@astrojs/node` adapter)
- **PWA:** Service worker + web manifest for mobile install

## Architecture

```
src/
  layouts/          Base.astro (PWA meta, fonts), DocsLayout.astro
  pages/
    index.astro     Landing page (features, security, mobile, roadmap, token, CTA)
    login.astro     Wallet connection page
    dashboard/      Protected pages (auth guard checks session cookie)
      index.astro   Main trading view (chart + AI chat)
      watchlist.astro
      portfolio.astro
      screener.astro
      compare.astro
      news.astro
    api/            REST API endpoints
      auth.ts       Nonce generation, signature verification, session management
      stock.ts      Market data (quote, chart, fundamentals, indicators)
      chat.ts       AI analyst (Ollama streaming)
      watchlist.ts  CRUD for watchlists + items
      portfolio.ts  CRUD for portfolios + transactions
      screener.ts   Technical screener with RSI/MACD/SMA filters
      compare.ts    Multi-symbol normalized comparison
      export.ts     CSV/XLSX export with OHLCV + indicators
      news.ts       Google News RSS + AI sentiment analysis
      me.ts         Current user info
  components/
    Auth/
      WalletLogin.tsx   Multi-wallet connector (MetaMask, Phantom, Coinbase, WalletConnect)
    Dashboard/
      Layout.tsx        Sidebar nav + mobile drawer
      TradingView.tsx   Main chart with indicators + AI chat sidebar + news tab
      Views.tsx         WatchlistView, PortfolioView, ScreenerView, NewsView, CompareView
      NewsView.tsx      Shim re-export
      *View.tsx         Individual shim re-exports for code splitting
    Docs/
      APIExplorer.tsx   Interactive API documentation
  lib/
    db.ts           PostgreSQL connection pool + query helpers
    auth.ts         Session token (HMAC-signed base64), user management
    yahoo.ts        Yahoo Finance data layer (crumb+cookie auth, quote, chart, fundamentals)
    indicators.ts   Technical indicator calculations (SMA, EMA, RSI, MACD, Bollinger)
public/
  sw.js             Service worker (cache-first static, network-first API)
  site.webmanifest  PWA manifest (standalone, dark theme)
  logo.png          App logo
```

## Key Design Patterns

### Authentication Flow
1. User clicks wallet button (MetaMask/Phantom/Coinbase)
2. Frontend requests nonce from `GET /api/auth?action=nonce`
3. SIWE message constructed with nonce, domain, address
4. Wallet signs message (`personal_sign` for EVM, `signMessage` for Solana)
5. Signature + message sent to `POST /api/auth`
6. Server creates HMAC-signed session cookie (7-day expiry)
7. Dashboard pages check cookie via auth guard, redirect to /login if missing

### Multi-Provider Wallet Detection
When multiple wallet extensions are installed, `window.ethereum.providers` array is checked:
- MetaMask: `isMetaMask && !isCoinbaseWallet`
- Coinbase: `isCoinbaseWallet` or `window.coinbaseWalletExtension`
- EVM signing uses `address.toLowerCase()` for `personal_sign` compatibility

### Yahoo Finance Data
- Uses crumb+cookie authentication (fetched from `fc.yahoo.com` -> `/v1/test/getcrumb`)
- Crumb cached for 30 minutes
- Base URL: `query2.finance.yahoo.com`
- Endpoints: `/v10/finance/quoteSummary`, `/v8/finance/chart`, `/v7/finance/quote`

### AI Integration
- Ollama running locally (default: `http://localhost:11434`)
- Model: Qwen (configurable via `OLLAMA_MODEL` env var)
- Chat endpoint uses streaming (`/api/generate` with stream: true)
- Sentiment analysis uses non-streaming with JSON output format

### Database Schema (PostgreSQL)
- `users`: id, wallet (unique lowercase), ens, tier, created_at
- `watchlists`: id, user_id, name
- `watchlist_items`: id, watchlist_id, symbol, notes
- `portfolios`: id, user_id, name
- `transactions`: id, portfolio_id, symbol, type (BUY/SELL), shares, price, fee, notes, executed_at

### Responsive Design
- Mobile-first with Tailwind breakpoints (`md:` for desktop)
- Dashboard sidebar: drawer with overlay on mobile, fixed sidebar on desktop
- Tables: horizontal scroll (`overflow-x-auto` + `min-w-[Xpx]`) on mobile
- Stacked layouts: `flex-col md:flex-row` pattern throughout

## Environment Variables

```
DATABASE_URL=postgresql://user:pass@host:5432/qwenta
SESSION_SECRET=min-32-char-secret-for-hmac-signing
OLLAMA_URL=http://localhost:11434    # Optional, defaults to localhost
OLLAMA_MODEL=qwen2.5:7b             # Optional, defaults to qwen
```

## Commands

```bash
npm run dev        # Development server
npm run build      # Production build
npm run start      # Run production server
npm run db:migrate # Run database migrations
```

## Custom Design Tokens (Tailwind)

- `void-*`: Dark backgrounds (900=#060810, 850=#0a0e1a, 800=#0d1120, 700=#141a2e)
- `bull`: Green (#22c55e) for positive values
- `bear`: Red (#ef4444) for negative values
- `cyan-400/500`: Primary accent color
- `lime-400`: Secondary accent color
- Font: JetBrains Mono (mono), custom display font (italic headings)

## Important Notes

- All dashboard pages require wallet authentication
- Data is per-wallet isolated (user_id foreign keys)
- AI runs 100% locally via Ollama — no data leaves the server
- The $QWENTA token is not yet launched (coming soon placeholder)
- WalletConnect requires SDK integration (currently shows informational error)
- Yahoo Finance requires crumb+cookie flow; direct API calls return 401
