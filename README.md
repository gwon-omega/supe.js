# Super App (Node.js)

Super App is an open-source **Node.js toolkit** with one CLI for:
1. Goal/task planning with local JSON persistence.
2. Dev-friendly starter app scaffolding plans for many frameworks and UI libraries.
3. Design guidance presets for visually unique and psychologically appealing product directions.
4. Security policy checks to catch risky scaffold combinations and execution intent early.
5. Reusable starter presets with deep-research metadata and CI template snippets.

## Included capabilities

- Goal planning with priorities
- Task tracking and completion
- Save/load to JSON
- Starter setup plans for frameworks:
  - React, Vue, Svelte, Solid, Angular, Next.js
  - Nuxt, Remix, Astro, Qwik, Gatsby, Fresh (Deno)
- Optional UI libraries/components:
  - Tailwind, MUI, Ant Design, Chakra UI, Bootstrap
  - Mantine, shadcn/ui, Radix UI, daisyUI, Fluent UI, Primer, PrimeVue
- Package manager support:
  - npm, pnpm, yarn, bun, deno
- Compatibility-aware planning:
  - Framework ↔ package-manager ecosystem checks
  - UI library ↔ ecosystem compatibility checks
- Security-aware planning:
  - Project name validation to reduce command-injection/path traversal risk
  - Security policy report command (`security`) with hardening recommendations
- Preset mode:
  - `preset --list` for discovery
  - `preset --list --category <name> --ecosystem <node|deno> --search <term>` for deep research filtering
  - `preset --name <preset> <project>` for one-command starter planning
  - Built-in CI workflow templates included in output
  - Expanded categories: product, internal-tools, content, frontend-platform, ai, realtime, edge

## Quick start

```bash
npm test
node bin/super-app.js --help
node bin/super-app.js catalog --json
node bin/super-app.js security --framework react --package-manager npm --ui tailwind --json
node bin/super-app.js preset --list --json
node bin/super-app.js preset --list --category ai --json
node bin/super-app.js preset --name saas my-saas
```

## Open source project files

- [LICENSE](LICENSE)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [SECURITY.md](SECURITY.md)

## GitHub growth plan

For long-term adoption strategy, see:
- [`docs/GITHUB_GROWTH_PLAYBOOK.md`](docs/GITHUB_GROWTH_PLAYBOOK.md)

## Project goals

See [GOALS.md](GOALS.md) for roadmap phases.
