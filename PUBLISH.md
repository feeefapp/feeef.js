# Publishing npm packages without login / 2FA every time

Interactive `npm login` + OTP is painful. Use a **granular access token with Bypass 2FA** (or GitHub Actions Trusted Publishing).

Applies to:

| Package | Repo folder |
|---|---|
| [`feeef`](https://www.npmjs.com/package/feeef) | `feeef.js/` |
| [`@feeef.dev/cli`](https://www.npmjs.com/package/@feeef.dev/cli) | `cli/` |

## One-time: create the token

1. Open [Create granular access token](https://www.npmjs.com/settings/~/tokens/granular-access-tokens/new).
2. Name: e.g. `feeef-publish`.
3. Expiration: rotate regularly (e.g. 90 days).
4. Permissions: **Read and write**.
5. Packages / scopes: include **`feeef`** and org **`@feeef.dev`** (or all packages you can access).
6. **Bypass 2FA: enable** — required for non-interactive publish.
7. Generate and copy the token once.

### Package publishing access

On each package’s Access page, use:

**Require two-factor authentication or a granular access token with bypass 2fa enabled**

Do **not** choose “Require 2FA and disallow tokens”.

## Store the token (pick one)

```bash
# A) Env (shell profile / CI secret)
export NPM_TOKEN='npm_…'

# B) Local file (recommended on your laptop)
mkdir -p ~/.config/feeef && chmod 700 ~/.config/feeef
printf '%s' 'npm_…' > ~/.config/feeef/npm_token
chmod 600 ~/.config/feeef/npm_token
```

Never commit the token. Project `.npmrc` files only reference `${NPM_TOKEN}`.

## Publish

```bash
# SDK
cd feeef.js
npm run publish:npm          # build + npm publish

# CLI (after SDK is on the registry)
cd cli
npm install
npm test && npm run build
export NPM_TOKEN="$(tr -d '\r\n' < ~/.config/feeef/npm_token)"
npm publish --access public
```

Or version bump + tag for the SDK: `cd feeef.js && npm run release`.

## GitHub Actions (optional)

Workflow: [`.github/workflows/publish-npm.yml`](./.github/workflows/publish-npm.yml) (SDK).

1. Repo secret `NPM_TOKEN` = the granular token, **or**
2. Prefer [Trusted Publishing](https://docs.npmjs.com/trusted-publishers) (OIDC).

## Rotate / revoke

If the token leaks (e.g. pasted in chat): revoke on npm → Tokens, create a new one, update `NPM_TOKEN` / `~/.config/feeef/npm_token` / GitHub secret.
