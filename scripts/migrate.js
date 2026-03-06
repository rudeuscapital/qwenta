// scripts/migrate.js
import pg from "pg";
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

const SQL = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  ens_name VARCHAR(255),
  tier VARCHAR(20) DEFAULT 'enterprise',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS watchlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL DEFAULT 'My Watchlist',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS watchlist_items (
  id SERIAL PRIMARY KEY,
  watchlist_id INTEGER REFERENCES watchlists(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  notes TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(watchlist_id, symbol)
);

CREATE TABLE IF NOT EXISTS portfolios (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL DEFAULT 'Main Portfolio',
  currency VARCHAR(10) DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS positions (
  id SERIAL PRIMARY KEY,
  portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  shares DECIMAL(18,6) NOT NULL,
  avg_cost DECIMAL(18,4) NOT NULL,
  notes TEXT,
  opened_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  type VARCHAR(4) NOT NULL CHECK (type IN ('BUY','SELL')),
  shares DECIMAL(18,6) NOT NULL,
  price DECIMAL(18,4) NOT NULL,
  fee DECIMAL(18,4) DEFAULT 0,
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS screener_presets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_chat_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  symbol VARCHAR(20),
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_watchlist_items_wid ON watchlist_items(watchlist_id);
CREATE INDEX IF NOT EXISTS idx_positions_pid ON positions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_transactions_pid ON transactions(portfolio_id);
`;

async function migrate() {
  try {
    await client.connect();
    console.log("✓ Connected to PostgreSQL");
    await client.query(SQL);
    console.log("✓ Migration complete — Qwenta schema ready");
  } catch (err) {
    console.error("✗ Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}
migrate();
