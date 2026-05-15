#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

status_output=""
if ! status_output="$(./scripts/run_with_npm_version.sh supabase status -o env 2>&1)"; then
  echo "$status_output" >&2
  echo "" >&2
  echo "Could not read local Supabase status." >&2
  echo "Start Docker Desktop, then run:" >&2
  echo "  npm run supabase:start" >&2
  echo "  npm run env:local" >&2
  exit 1
fi

extract_env_value() {
  local key="$1"
  printf '%s\n' "$status_output" | awk -F= -v key="$key" '$1 == key { print substr($0, length(key) + 2) }' | tail -n 1
}

api_url="$(extract_env_value API_URL)"
anon_key="$(extract_env_value ANON_KEY)"

if [ -z "$api_url" ] || [ -z "$anon_key" ]; then
  echo "Supabase status did not include API_URL or ANON_KEY." >&2
  echo "Raw status output:" >&2
  echo "$status_output" >&2
  exit 1
fi

env_file=".env.local"
tmp_file="$(mktemp)"

if [ -f "$env_file" ]; then
  grep -v -E '^(NEXT_PUBLIC_APP_ENV|NEXT_PUBLIC_APP_URL|NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY)=' "$env_file" > "$tmp_file" || true
else
  touch "$tmp_file"
fi

{
  echo "NEXT_PUBLIC_APP_ENV=local"
  echo "NEXT_PUBLIC_APP_URL=http://localhost:3000"
  echo "NEXT_PUBLIC_SUPABASE_URL=${api_url}"
  echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=${anon_key}"
  cat "$tmp_file"
} > "$env_file"

rm -f "$tmp_file"

echo "Updated ${env_file} with local Supabase values."
