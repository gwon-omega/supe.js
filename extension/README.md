# Supe VS Code Extension (MVP)

This folder contains a feasibility-first VS Code extension that brings `supe.js` workflows into one-click editor commands.

## Why this direction

Inspired by package-management UX from projects like:
- `npm-manager` (quick package tasks in-editor)
- `UniGetUI` (single interface for multiple package manager operations)

This MVP focuses on the same principle: fewer context switches and fast command execution.

## Included commands

- **Supe: Quick Init**
  - Runs: `npx @supejs/supe init <project> --framework <framework> --yes`
- **Supe: Scaffold from Preset**
  - Runs: `npx @supejs/supe preset <project> --name <preset> --json`
- **Supe: One-click Package Action**
  - One-click: install / update / test for npm, pnpm, yarn, bun
- **Supe: Install Package**
  - Detects package manager from lockfiles and runs the correct install command
- **Supe: Uninstall Package**
  - One-click remove from dependency tree context menu or command palette
- **Supe: Refresh Dependency Insights**
  - Rebuilds dependency tree and update badges
  - Includes refresh caching + debounce for lower latency in large repos

## Feasibility notes

- ✅ Fully feasible as a VS Code extension because all required workflows are shell-command based and map directly to `vscode.window.createTerminal` + command registration.
- ✅ High-leverage approach: keep `supe.js` CLI as the source of truth and make the extension a UI orchestrator.
- ✅ Improved UX inspired by the referenced repos:
  - dedicated dependency explorer
  - update badges (`MAJOR` / `MINOR` / `PATCH`)
  - status bar update count
  - quick install/uninstall flows
  - output channel diagnostics
  - auto refresh on `package.json` change
  - configurable timeouts/cache/preferred package manager
  - lazy pagination for large dependency graphs (`pageSize` + `Load more`)
  - background worker for dependency metadata merging
  - actionable error dialogs with retry/fallback-to-npm
  - extension-host tests via `@vscode/test-electron`
  - release pipeline template for signed VSIX + semantic-release
- ⚠️ For production-quality Marketplace publishing, next steps should include:
  - richer UI (Tree View + Webview hybrid)
  - telemetry backend endpoint (currently output-only toggles)
  - release secret hardening and provenance policy

## Local development

Open this `extension/` folder in VS Code and run **F5** (Extension Development Host).
