# Qwenta — Enterprise AI Trading Platform

> Institutional-grade trading intelligence. Self-hosted, AI-powered, crypto-authenticated.

**Stack:** Astro SSR · React · PostgreSQL · Yahoo Finance · Ollama (Qwen) · WalletConnect/SIWE

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 Live Charts | Price, RSI, MACD, Volume — multi-timeframe (1H–Weekly) |
| 🔍 Indicators | RSI, MACD, BB, SMA 20/50, EMA 20 — computed server-side |
| 👀 Watchlist | Multiple lists, live prices, notes — PostgreSQL backed |
| 💼 Portfolio | P&L tracking, weighted avg cost, transaction history |
| 🔎 Screener | Filter by 8+ indicator conditions, 5 built-in presets |
| ↔ Compare | Normalize & compare up to 6 symbols |
| 🤖 AI Analyst | Local Qwen via Ollama — private, streaming, context-aware |
| 📥 Export | CSV & multi-sheet XLSX with all indicators |
| 🔐 Auth | WalletConnect / MetaMask + SIWE (Sign-In with Ethereum) |
| 📖 Docs | API reference, tutorials, changelog |

---

## 🚀 Quick Start

```bash
# Prerequisites: Node 18+, PostgreSQL, Ollama

# 1. Install
git clone ... && cd qwenta && npm install

# 2. Configure
cp .env.example .env   # fill in DATABASE_URL + SESSION_SECRET

# 3. Database
createdb qwenta && node scripts/migrate.js

# 4. AI
ollama pull qwen2.5

# 5. Run
npm run dev   # → http://localhost:4321
```

---

## 📁 Project Structure

```
qwenta/
├── scripts/migrate.js           # DB schema setup
├── src/
│   ├── pages/
│   │   ├── index.astro          # Landing page (marketing)
│   │   ├── login.astro          # WalletConnect SIWE login
│   │   ├── dashboard/
│   │   │   ├── index.astro      # Main trading view (SSR-protected)
│   │   │   ├── watchlist.astro
│   │   │   ├── portfolio.astro
│   │   │   ├── screener.astro
│   │   │   └── compare.astro
│   │   ├── docs/
│   │   │   ├── index.astro      # Docs overview
│   │   │   ├── getting-started.astro
│   │   │   ├── api.astro        # Interactive API explorer
│   │   │   ├── tutorials.astro
│   │   │   └── changelog.astro
│   │   └── api/
│   │       ├── auth.ts          # SIWE: nonce, verify, logout
│   │       ├── me.ts            # Current session user
│   │       ├── stock.ts         # Yahoo Finance + indicators
│   │       ├── chat.ts          # Ollama streaming
│   │       ├── watchlist.ts     # Watchlist CRUD
│   │       ├── portfolio.ts     # Portfolio CRUD + P&L
│   │       ├── screener.ts      # Technical screener
│   │       ├── compare.ts       # Multi-symbol compare
│   │       └── export.ts        # CSV/XLSX export
│   ├── components/
│   │   ├── Auth/WalletLogin.tsx
│   │   ├── Dashboard/
│   │   │   ├── Layout.tsx       # Sidebar navigation
│   │   │   ├── TradingView.tsx  # Main chart + AI chat
│   │   │   ├── Views.tsx        # Watchlist/Portfolio/Screener/Compare
│   │   │   └── *View.tsx        # Re-export shims
│   │   └── Docs/APIExplorer.tsx # Interactive API docs
│   ├── layouts/
│   │   ├── Base.astro
│   │   └── DocsLayout.astro
│   └── lib/
│       ├── db.ts                # PostgreSQL pool
│       ├── indicators.ts        # RSI, MACD, BB, SMA, EMA
│       ├── yahoo.ts             # Yahoo Finance wrapper
│       └── auth.ts              # SIWE session helpers
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/stock?symbol=AAPL` | OHLCV + all indicators |
| POST | `/api/chat` | Streaming AI analysis |
| GET/POST | `/api/watchlist` | Watchlist CRUD |
| GET/POST | `/api/portfolio` | Portfolio CRUD + P&L |
| POST | `/api/screener` | Technical screener |
| GET | `/api/compare?symbols=A,B,C` | Multi-symbol compare |
| GET | `/api/export?symbol=AAPL&format=xlsx` | Export data |
| GET | `/api/auth?action=nonce` | SIWE nonce |
| POST | `/api/auth` | Verify signature |
| DELETE | `/api/auth` | Logout |

Full interactive docs: `/docs/api`

---

## ⚙️ Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/qwenta
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5
SESSION_SECRET=min-32-char-random-string
PUBLIC_APP_URL=http://localhost:4321
```

---

## 🏗️ Production

```bash
npm run build
npm start
```

---

> ⚠️ **Disclaimer:** Qwenta is for educational and analytical purposes only. Not financial advice.
