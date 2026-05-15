#!/usr/bin/env bash
set -euo pipefail

if [ "${CI:-}" = "true" ]; then
  exec "$@"
fi

expected_node="v$(tr -d '[:space:]' < .nvmrc)"
actual_node="$(node --version)"

if [ "$actual_node" != "$expected_node" ]; then
  if [ -z "${NVM_DIR:-}" ]; then
    export NVM_DIR="$HOME/.nvm"
  fi

  if [ -s "$NVM_DIR/nvm.sh" ]; then
    unset npm_config_prefix
    # shellcheck source=/dev/null
    . "$NVM_DIR/nvm.sh"
    nvm use > /dev/null
    actual_node="$(node --version)"
  fi
fi

if [ "$actual_node" != "$expected_node" ]; then
  echo "Expected Node ${expected_node}, found ${actual_node}." >&2
  echo "Run 'nvm use' or install the version in .nvmrc." >&2
  exit 1
fi

expected_npm="$(node -p "require('./package.json').engines.npm")"
actual_npm="$(npm --version)"
if [ "$actual_npm" != "$expected_npm" ]; then
  echo "Expected npm ${expected_npm}, found ${actual_npm}." >&2
  echo "Install the pinned npm version with: npm install -g npm@${expected_npm}" >&2
  exit 1
fi

exec "$@"
