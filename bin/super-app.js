#!/usr/bin/env node
import {
  FRAMEWORKS,
  PM_RUNNERS,
  UI_LIBS,
  demo,
  designGuidance,
  installHints,

  queryStarterPresets,
  researchCatalog,
  scaffoldFromPreset,
  scaffoldStarterApp,
  securityPolicyReport
} from "../src/super-app.js";

function printHelp() {

  super-app demo
  super-app install-hints [--json]
  super-app design [--theme <neon_noir|calm_pro|sunrise_flow>] [--json]
  super-app catalog [--json]

`);
}

function argValue(args, key, fallback) {

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


      if (argv.includes("--json")) console.log(JSON.stringify(presets, null, 2));
      else presets.forEach((p) => console.log(`- ${p.id} [${p.category}/${p.maturity}]: ${p.description}`));
      return 0;
    }
    const name = argValue(argv, "--name", "");
    const projectName = findPresetProjectArg(argv);
    if (!name || !projectName) throw new Error("Usage: super-app preset --name <preset> <project-name> [--run] [--json]");

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
