# Supe.js ⚡

Supe.js is a CLI toolkit for scaffold planning, policy checks, design guidance, and starter catalog exploration.

## ⚡ Get Started

### Option 1: Persistent Installation (Recommended)

Install once and use `supe` everywhere system-wide:

```bash
npm install -g @supejs/supe
```

Then use the tool directly from any directory:

```bash
# Create a new project
supe init my-app --yes

# Or browse starter presets first
supe preset --list
supe init my-app --framework next

# Check your environment
supe doctor
```

To upgrade:

```bash
npm update -g @supejs/supe
```

### Option 2: One-time Usage (no install needed)

Run directly without installing — equivalent to `uvx` for Python tools:

```bash
npx @supejs/supe init my-app --yes
```

**Benefits of persistent installation:**

- Tool stays installed and available in PATH
- No need to download on every use
- Better tool management with `npm list -g`, `npm update -g @supejs/supe`, `npm uninstall -g @supejs/supe`
- Cleaner shell configuration

---

## Shell installer (curl / PowerShell)

Alternative installation via the hosted shell scripts:

```bash
# Quick (Unix/macOS) — install from npm via shell script
curl -fsSL https://raw.githubusercontent.com/gwon-omega/supe.js/main/scripts/supe-install.sh | sh

# or using wget
wget -qO- https://raw.githubusercontent.com/gwon-omega/supe.js/main/scripts/supe-install.sh | sh
```

**Safer (Unix/macOS): download, verify checksum, inspect, then run:**

```bash
curl -fsSL -o supe-install.sh https://raw.githubusercontent.com/gwon-omega/supe.js/main/scripts/supe-install.sh
curl -fsSL -o supe-install.sh.sha256 https://raw.githubusercontent.com/gwon-omega/supe.js/main/scripts/supe-install.sh.sha256
# verify (Linux)
sha256sum -c supe-install.sh.sha256
# verify (macOS)
shasum -a 256 -c supe-install.sh.sha256 || true
sh supe-install.sh
```

**Windows (PowerShell) — download, verify, inspect, then run:**

```powershell
# Download installer and checksum
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/gwon-omega/supe.js/main/scripts/supe-install.ps1" -OutFile supe-install.ps1
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/gwon-omega/supe.js/main/scripts/supe-install.ps1.sha256" -OutFile supe-install.ps1.sha256

# Verify SHA256 of the downloaded script
Get-FileHash -Algorithm SHA256 .\supe-install.ps1
Get-Content .\supe-install.ps1.sha256

# If you trust the file after inspection, run it:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\supe-install.ps1
```

> **Note:** The installer prefers `npm install -g @supejs/supe` (published registry package). If not yet published, it falls back to `npm install -g .` when run from a repository clone. Never pipe blindly from the internet in production — always verify checksums first.

---

## Install from source

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

For local development, link the package globally so `supe` becomes available system-wide:

```bash
npm link
# or, from the repo root on Unix/macOS
./scripts/supe.sh
# on Windows (PowerShell)
.\scripts\supe.ps1
```

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

## VS Code extension (feasibility MVP)

A feasibility-first VS Code extension now lives in `extension/`, designed to bring one-click flows into the editor (similar UX direction to npm-manager / UniGetUI style package actions while keeping `supe.js` CLI as source of truth).

Key commands:

- `Supe: Quick Init`
- `Supe: Scaffold from Preset`
- `Supe: One-click Package Action` (install/update/test for npm, pnpm, yarn, bun)
- `Supe: Install Package` / `Supe: Uninstall Package`
- `Supe: Refresh Dependency Insights` with dependency tree + update badges + status count
- Configurable extension settings: auto-refresh, debounce, command timeout, cache TTL, preferred package manager
- Large-repo UX: lazy pagination + background metadata worker + retry/fallback diagnostics
- Hybrid UI: dependency TreeView + command dashboard Webview, telemetry endpoint hooks, and signed-VSIX release workflow
- Interaction UX: mouse + keyboard dependency search from dashboard and command palette filter

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

Preset scaffold plans include all declared install libraries (UI, animation, and interaction packages) so generated commands match each preset profile.

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
