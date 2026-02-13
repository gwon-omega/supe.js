#!/usr/bin/env node
import {
  FRAMEWORKS,
  PM_RUNNERS,
  UI_LIBS,
  demo,
  designGuidance,
  installHints,
  listStarterPresets,
  queryStarterPresets,
  researchCatalog,
  scaffoldFromPreset,
  scaffoldStarterApp,
  securityPolicyReport
} from "../src/super-app.js";

function printHelp() {
  console.log(`Super App: Node.js goals + starter app scaffolding

Usage:
  super-app demo
  super-app install-hints [--json]
  super-app design [--theme <neon_noir|calm_pro|sunrise_flow>] [--json]
  super-app catalog [--json]
  super-app preset --list [--category <name>] [--ecosystem <node|deno>] [--search <term>] [--json]
  super-app preset --name <saas|dashboard|commerce|docs_portal|design_system|ai_playground|realtime_hub|deno_api_edge> <project-name> [--run] [--json]
  super-app security [--framework <name>] [--package-manager <pm>] [--ui <lib...>] [--run-intent] [--json]
  super-app starter <name> [--framework <name>] [--package-manager <pm>] [--ui <lib...>] [--theme <preset>] [--run]

Frameworks: ${Object.keys(FRAMEWORKS).join(", ")}
UI libs: ${Object.keys(UI_LIBS).join(", ")}
Package managers: ${Object.keys(PM_RUNNERS).join(", ")}
`);
}

function argValue(args, key, fallback) {
  const index = args.indexOf(key);
  if (index === -1 || index + 1 >= args.length) return fallback;
  return args[index + 1];
}

function parseUiArgs(args) {
  const uiIndex = args.indexOf("--ui");
  let ui = ["tailwind"];
  if (uiIndex !== -1) {
    ui = [];
    for (let i = uiIndex + 1; i < args.length && !args[i].startsWith("--"); i += 1) ui.push(args[i]);
    if (ui.length === 0) ui = ["tailwind"];
  }
  return ui;
}

function findPresetProjectArg(argv) {
  for (let i = 1; i < argv.length; i += 1) {
    if (argv[i].startsWith("--")) {
      if (["--name", "--category", "--ecosystem", "--search"].includes(argv[i])) i += 1;
      continue;
    }
    return argv[i];
  }
  return "";
}

function main(argv = process.argv.slice(2)) {
  const command = argv[0] || "demo";
  if (command === "--help" || command === "-h") return printHelp(), 0;
  if (command === "demo") return demo(), 0;

  if (command === "preset") {
    if (argv.includes("--list")) {
      const presets = queryStarterPresets({
        category: argValue(argv, "--category", ""),
        ecosystem: argValue(argv, "--ecosystem", ""),
        search: argValue(argv, "--search", "")
      });
      if (argv.includes("--json")) console.log(JSON.stringify(presets, null, 2));
      else presets.forEach((p) => console.log(`- ${p.id} [${p.category}/${p.maturity}]: ${p.description}`));
      return 0;
    }
    const name = argValue(argv, "--name", "");
    const projectName = findPresetProjectArg(argv);
    if (!name || !projectName) throw new Error("Usage: super-app preset --name <preset> <project-name> [--run] [--json]");
    const result = scaffoldFromPreset(projectName, name, argv.includes("--run"));
    console.log(JSON.stringify(result, null, 2));
    return 0;
  }

  if (command === "catalog") {
    const catalog = researchCatalog();
    if (argv.includes("--json")) console.log(JSON.stringify(catalog, null, 2));
    else catalog.frameworks.forEach((item) => console.log(`- ${item.id} [${item.category}] ecosystem=${item.ecosystem}`));
    return 0;
  }

  if (command === "design") {
    const design = designGuidance(argValue(argv, "--theme", "calm_pro"));
    if (argv.includes("--json")) console.log(JSON.stringify(design, null, 2));
    else console.log(`${design.theme}: ${design.vibe}`);
    return 0;
  }

  if (command === "security") {
    const report = securityPolicyReport(argValue(argv, "--framework", "react"), parseUiArgs(argv), argValue(argv, "--package-manager", "npm"), argv.includes("--run-intent"));
    if (argv.includes("--json")) console.log(JSON.stringify(report, null, 2));
    else console.log(`Security score: ${report.score}`);
    return 0;
  }

  if (command === "install-hints") {
    const hints = installHints();
    if (argv.includes("--json")) console.log(JSON.stringify(hints, null, 2));
    else Object.entries(hints).forEach(([manager, cmd]) => console.log(`- ${manager}: ${cmd}`));
    return 0;
  }

  if (command === "starter") {
    const name = argv[1];
    if (!name) throw new Error("Project name is required for starter command");
    const result = scaffoldStarterApp(name, argValue(argv, "--framework", "react"), parseUiArgs(argv), argValue(argv, "--package-manager", "npm"), argv.includes("--run"), argValue(argv, "--theme", "calm_pro"));
    console.log(JSON.stringify(result, null, 2));
    return 0;
  }

  printHelp();
  throw new Error(`Unknown command: ${command}`);
}

function runCli() {
  try { process.exit(main()); }
  catch (error) { console.error(error.message); process.exit(1); }
}

if (import.meta.url === `file://${process.argv[1]}`) runCli();

export { main, runCli, listStarterPresets };
