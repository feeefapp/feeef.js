#!/usr/bin/env bash
# Publish `feeef` to npm without interactive login / OTP.
#
# One-time setup: see PUBLISH.md (create granular token + Bypass 2FA).
# Then either:
#   export NPM_TOKEN=npm_...
# or write the token to ~/.config/feeef/npm_token (mode 0600)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

resolve_token() {
  if [[ -n "${NPM_TOKEN:-}" ]]; then
    printf '%s' "$NPM_TOKEN"
    return
  fi
  if [[ -n "${NODE_AUTH_TOKEN:-}" ]]; then
    printf '%s' "$NODE_AUTH_TOKEN"
    return
  fi
  local file="${FEEEF_NPM_TOKEN_FILE:-$HOME/.config/feeef/npm_token}"
  if [[ -f "$file" ]]; then
    # trim whitespace / trailing newline
    tr -d '\r\n' <"$file"
    return
  fi
  return 1
}

if ! TOKEN="$(resolve_token)"; then
  cat >&2 <<'EOF'
Missing npm publish token.

Create a granular access token at:
  https://www.npmjs.com/settings/~/tokens/granular-access-tokens/new

Required:
  - Read and write
  - Packages: "feeef" (or your org scope)
  - Bypass 2FA: ON  (required for non-interactive publish)

Then either:
  export NPM_TOKEN='npm_...'
  # or
  mkdir -p ~/.config/feeef && chmod 700 ~/.config/feeef
  printf '%s' 'npm_...' > ~/.config/feeef/npm_token
  chmod 600 ~/.config/feeef/npm_token

See feeef.js/PUBLISH.md for details.
EOF
  exit 1
fi

export NPM_TOKEN="$TOKEN"
export NODE_AUTH_TOKEN="$TOKEN"

echo "→ Building…"
npm run build

echo "→ Whoami (token)…"
npm whoami

echo "→ Publishing fee@$(node -p "require('./package.json').version")…"
npm publish --access public "$@"

echo "✓ Published"
