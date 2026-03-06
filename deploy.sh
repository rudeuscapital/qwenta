#!/bin/bash
# Qwenta — Quick Redeploy Script
# Run after pulling new code: bash deploy.sh

set -e
CYAN='\033[0;36m'; GREEN='\033[0;32m'; NC='\033[0m'
log() { echo -e "${CYAN}[deploy]${NC} $1"; }
ok()  { echo -e "${GREEN}[  ok  ]${NC} $1"; }

log "Installing dependencies..."
npm install --silent && ok "npm install"

log "Running migrations (safe, idempotent)..."
node scripts/migrate.js && ok "migrations"

log "Building..."
npm run build && ok "build complete"

log "Restarting service..."
sudo systemctl restart qwenta && ok "qwenta restarted"

echo ""
echo -e "${GREEN}✓ Deploy complete${NC} — $(date)"
sudo systemctl status qwenta --no-pager -l | tail -5
