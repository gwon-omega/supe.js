# Supe.js ⚡

Supe.js is a CLI toolkit for scaffold planning, policy checks, design guidance, and starter catalog exploration.

## Install

```bash
npm install
```

## CLI

```bash
node bin/supe.js --help
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

This package is published as **`@supejs/supe`**.

```bash
npm publish --access=public
```

Scaffold a new app after installation with:

```bash
supe init my-app
```

If you are logged into a different npm account, switch or re-authenticate before publishing:

```bash
npm whoami
npm login
```

## Repository ownership

This repository is owned by **@gwon-omega** with **@supejs/developers** as the required code owners team for reviews.

## Development checks

```bash
npm test
python3 -m unittest discover -s tests -v
node bin/supe.js --help
```
