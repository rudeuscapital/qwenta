// Re-export all API handlers — each file handles its own route
// This file documents the API surface

/*
GET  /api/stock?symbol=AAPL&period=6mo&interval=1d
POST /api/chat
GET  /api/watchlist | GET /api/watchlist?id=1
POST /api/watchlist
GET  /api/portfolio | GET /api/portfolio?id=1
POST /api/portfolio
POST /api/screener
GET  /api/compare?symbols=AAPL,NVDA&period=6mo
GET  /api/export?symbol=AAPL&period=6mo&format=csv
GET  /api/auth?action=nonce
POST /api/auth
DELETE /api/auth
GET  /api/me
*/
export {};
