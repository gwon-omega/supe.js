# Supe.js ⚡

Supe.js is a CLI toolkit for scaffold planning, policy checks, design guidance, and starter catalog exploration.

## Install

```bash
npm install
```

For local development, link the package globally so `supe` becomes available system-wide:

```bash
npm link
# or, from the repo root on Unix/macOS
./scripts/supe.sh
# on Windows (PowerShell)
.\scripts\supe.ps1
```

Install from source repo (HTTPS/SSH/GitHub CLI):

```bash
git clone https://github.com/gwon-omega/supe.js.git
# or SSH
git clone git@github.com:gwon-omega/supe.js.git
# or GitHub CLI
gh repo clone gwon-omega/supe.js

cd supe.js
npm install
npm install -g @supejs/supe
```

## One-line installer (curl/wget / PowerShell)

If you publish `supe` to npm or host the installer script on a reachable URL (for example a GitHub raw URL), users can install system-wide with a one-liner.

```bash
# Primary (recommended): install from npm
npm install -g @supejs/supe

# Quick (less safe) — pipes script directly (Unix/macOS; not recommended for production)
curl -fsSL https://raw.githubusercontent.com/gwon-omega/supe.js/main/scripts/supe-install.sh | sh
# or using wget
wget -qO- https://raw.githubusercontent.com/gwon-omega/supe.js/main/scripts/supe-install.sh | sh

# Safer (Unix/macOS): download, verify checksum, inspect, then run
curl -fsSL -o supe-install.sh https://raw.githubusercontent.com/gwon-omega/supe.js/main/scripts/supe-install.sh
curl -fsSL -o supe-install.sh.sha256 https://raw.githubusercontent.com/gwon-omega/supe.js/main/scripts/supe-install.sh.sha256
# verify (Linux)
sha256sum -c supe-install.sh.sha256
# verify (macOS)
shasum -a 256 -c supe-install.sh.sha256 || true
sh supe-install.sh
```

Windows (PowerShell) — do not pipe blindly; download, verify, inspect, then run:

```powershell
# Download installer and checksum
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/gwon-omega/supe.js/main/scripts/supe-install.ps1" -OutFile supe-install.ps1
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/gwon-omega/supe.js/main/scripts/supe-install.ps1.sha256" -OutFile supe-install.ps1.sha256

# Verify SHA256 of the downloaded script
Get-FileHash -Algorithm SHA256 .\supe-install.ps1
Get-Content .\supe-install.ps1.sha256

# If you trust the file after inspection, run it in a temporary bypassed execution policy:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\supe-install.ps1
```

Notes:

- The installer prefers `npm install -g @supejs/supe` (published package). If the package isn't published, the installer falls back to `npm install -g .` when executed from a repository clone.
- Never pipe blindly from the internet in production — download, verify the checksum or signature, inspect the script, then run it.
- The repo provides `scripts/supe-install` (no extension), `scripts/supe-install.sh`, `scripts/supe-install.sh.sha256`, `scripts/supe-install.ps1`, and `scripts/supe-install.ps1.sha256` for convenience; prefer installing from the npm registry for trusted installs.

### create-super-app command notes

- `create-super-app` and `create-supe-app` are binaries exposed by this package (`@supejs/supe`) after global install.
- Reliable options:
  - `npm install -g @supejs/supe` then run `create-super-app my-app`
  - `npx @supejs/supe init my-app`
- `npx create-super-app` can 404 unless a separate `create-super-app` package is published.

## CLI

```bash
node bin/supe.js
```

### Core commands

```text
supe demo
supe doctor [--json]
supe install-hints [--json]
supe profile --user <id> [--base-dir <path>] [--json]
supe sync --user <id> [--provider <github|gitlab|bitbucket>] [--remote <name>] [--json]
supe policy-check --file <policy.json> [--framework <name>] [--package-manager <pm>] [--ui <lib...>] [--json]
supe design [--theme <neon_noir|calm_pro|sunrise_flow>] [--json]
supe catalog [--json]
supe preset [--list] [--name <preset-id>] [project-name] [--json]
supe starter <project-name> [--framework <name>] [--package-manager <pm>] [--ui <lib...>] [--json]
supe init [project-name] [--framework <id>] [--ui <id>] [--template <id>] [--addons <csv>] [--pm <id>] [--yes] [--no-install]
supe shell
```

### Recommended flow (dev friendly)

```bash
supe
supe preset --list
supe starter my-app --framework react --ui tailwind
supe init my-app --yes
```

## Starter templates (presets)

Use `supe preset --list` to inspect available starter templates. Current template IDs:

- `react-fast`
- `next-enterprise`
- `edge-vinext`
- `astro-content`
- `next-admin-dashboard`
- `next-ecommerce`
- `astro-blog`
- `remix-saas`

Generate one with:

```bash
node bin/supe.js preset my-app --name next-admin-dashboard --json
```

## Publishing

This package is published as **@supejs/supe**.

To publish under the scoped name and make it publicly installable:

```bash
# ensure you're logged in to npm with the publishing account
npm login
# publish as public scoped package
npm publish --access=public
```

Users can then install system-wide via npm:

```bash
npm install -g @supejs/supe
```

Or scaffold after installation:

```bash
supe init my-app
```

If you are logged into a different npm account, switch or re-authenticate before publishing:

```bash
npm whoami
npm login
```

## Repository ownership

This repository is maintained by **@gwon-omega**.

## Development checks

```bash
npm test
node --test tests/*.test.js
node bin/supe.js --help
```
