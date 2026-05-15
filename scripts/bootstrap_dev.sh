#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "$PROJECT_ROOT"

echo "Checking pinned runtime..."
./scripts/run_with_npm_version.sh node --version > /dev/null
./scripts/run_with_npm_version.sh npm --version > /dev/null

echo "Installing dependencies with npm ci..."
npm ci

if [ ! -f ".env.local" ]; then
  cp .env.example .env.local
  echo "Created .env.local from .env.example. Fill in Supabase values before using Supabase."
fi

echo "Bootstrap complete."
