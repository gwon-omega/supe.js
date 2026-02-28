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

One-line installer (curl/wget)

If you publish `supe` to npm or host the installer script on a reachable URL (for example a GitHub raw URL), users can install system-wide with a one-liner:

```bash
# install published package via npm (recommended)
curl -fsSL https://raw.githubusercontent.com/<owner>/supe/main/scripts/supe-install.sh | sh
# or using wget
wget -qO- https://raw.githubusercontent.com/<owner>/supe/main/scripts/supe-install.sh | sh
```

Notes:

- The bootstrap script prefers `npm install -g supe` (published package). If the package isn't published, it falls back to `npm install -g .` when executed from a repository clone.
- For security, audit the script before piping it to `sh` and prefer installing from the npm registry when possible.

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

This repository is maintained by the Supe.js maintainers: **@supejs/developers**.

## Development checks

```bash
npm test
node --test tests/*.test.js
node bin/supe.js --help
```
