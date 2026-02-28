#!/usr/bin/env node
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  demo,
  designGuidance,
  detectDeveloperEnvironment,
  evaluatePolicy,
  installHints,
  queryStarterPresets,
  rankStarterPresets,
  researchCatalog,
  scaffoldFromPreset,
  scaffoldStarterApp,
  securityPolicyReport,
  syncPlan,
  userWorkspace
} from "../src/supe.js";

function printHelp() {
  console.log(`supe.js CLI

Usage:
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
`);
}

function argValue(argv, key, fallback = "") {
  const index = argv.indexOf(key);
  if (index === -1) return fallback;
  return argv[index + 1] && !argv[index + 1].startsWith("--") ? argv[index + 1] : fallback;
}

function parseUiArgs(argv) {
  const values = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--ui") {
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) values.push(next);
    }
  }
  return values;
}


function launchSystemShell() {
  const shellCmd = process.platform === "win32"
    ? process.env.ComSpec || "powershell.exe"
    : process.env.SHELL || "bash";
  const proc = spawnSync(shellCmd, { stdio: "inherit", shell: false });
  if (proc.error) throw proc.error;
  return typeof proc.status === "number" ? proc.status : 0;
}

function runInitCommand(initArgs) {
  const entry = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "index.js");
  const proc = spawnSync(process.execPath, [entry, ...initArgs], { stdio: "inherit" });
  if (proc.error) throw proc.error;
  return typeof proc.status === "number" ? proc.status : 0;
}

function printResult(payload, asJson) {
  if (asJson) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }
  console.log(payload);
}

export function main(argv = process.argv.slice(2)) {
  const command = argv[0];
  const json = argv.includes("--json");

  if (!command) {
    return launchSystemShell();
  }

  if (command === "--help" || command === "-h") {
    printHelp();
    return 0;
  }

  if (command === "demo") {
    demo();
    return 0;
  }

  if (command === "doctor") {
    printResult(detectDeveloperEnvironment(), json);
    return 0;
  }

  if (command === "install-hints") {
    const hints = installHints();
    if (json) printResult(hints, true);
    else Object.entries(hints).forEach(([manager, cmd]) => console.log(`- ${manager}: ${cmd}`));
    return 0;
  }

  if (command === "profile") {
    const userId = argValue(argv, "--user");
    const baseDir = argValue(argv, "--base-dir") || undefined;
    const workspace = userWorkspace(userId, baseDir);
    printResult(workspace, json);
    return 0;
  }

  if (command === "sync") {
    const userId = argValue(argv, "--user");
    const provider = argValue(argv, "--provider", "github");
    const remote = argValue(argv, "--remote", "origin");
    printResult(syncPlan(userId, provider, remote), json);
    return 0;
  }

  if (command === "policy-check") {
    const policyPath = argValue(argv, "--file");
    if (!policyPath) throw new Error("--file is required for policy-check");
    const policy = JSON.parse(fs.readFileSync(policyPath, "utf-8"));
    const framework = argValue(argv, "--framework", "react");
    const packageManager = argValue(argv, "--package-manager", "npm");
    const ui = parseUiArgs(argv);
    printResult(evaluatePolicy(policy, framework, packageManager, ui), json);
    return 0;
  }

  if (command === "design") {
    const theme = argValue(argv, "--theme", "calm_pro");
    printResult(designGuidance(theme), json);
    return 0;
  }

  if (command === "catalog") {
    const catalog = researchCatalog();
    if (json) printResult(catalog, true);
    else catalog.frameworks.forEach((item) => console.log(`- ${item.id} [${item.category}] ecosystem=${item.ecosystem}`));
    return 0;
  }

  if (command === "preset") {
    const presets = rankStarterPresets(queryStarterPresets());
    if (argv.includes("--list")) {
      if (json) printResult(presets, true);
      else presets.forEach((p) => console.log(`- ${p.id}: ${p.description}`));
      return 0;
    }

    const name = argValue(argv, "--name", "react-fast");
    const projectName = argv.find((item, index) => index > 0 && !item.startsWith("--")) || "supe-starter";
    printResult(scaffoldFromPreset(projectName, name), json);
    return 0;
  }

  if (command === "security") {
    const framework = argValue(argv, "--framework", "react");
    const packageManager = argValue(argv, "--package-manager", "npm");
    const ui = parseUiArgs(argv);
    printResult(securityPolicyReport(framework, ui, packageManager, argv.includes("--run-intent")), json);
    return 0;
  }

  if (command === "init") {
    return runInitCommand(argv.slice(1));
  }

  if (command === "shell") {
    return launchSystemShell();
  }

  if (command === "starter") {
    const projectName = argv[1];
    if (!projectName || projectName.startsWith("--")) throw new Error("Project name is required for starter command");
    const framework = argValue(argv, "--framework", "react");
    const packageManager = argValue(argv, "--package-manager", "npm");
    const ui = parseUiArgs(argv);
    printResult(scaffoldStarterApp(projectName, framework, ui.length ? ui : ["tailwind"], packageManager, false), json);
    return 0;
  }

  printHelp();
  throw new Error(`Unknown command: ${command}`);
}

function runCli() {
  try {
    process.exit(main());
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) runCli();
