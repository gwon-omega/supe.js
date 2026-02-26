import fs from "node:fs";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";



function isExecutable(commandPath) {
  try {
    fs.accessSync(commandPath, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function isCommandAvailable(command) {
  const searchPath = process.env.PATH || "";
  const segments = searchPath.split(path.delimiter).filter(Boolean);
  const extensions = process.platform === "win32" ? (process.env.PATHEXT || ".EXE;.CMD;.BAT").split(";") : [""];
  for (const dir of segments) {
    for (const ext of extensions) {
      const candidate = path.join(dir, process.platform === "win32" ? `${command}${ext.toLowerCase()}` : command);
      if (isExecutable(candidate)) return true;
      if (process.platform === "win32") {
        const rawCandidate = path.join(dir, `${command}${ext}`);
        if (isExecutable(rawCandidate)) return true;
      }
    }
  }
  return false;
}



function validateUserId(userId) {
  if (!userId || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{1,62}$/.test(userId)) throw new Error("Invalid user id. Use 2-63 chars: letters, numbers, dash, underscore.");
}

export function userWorkspace(userId, baseDir = path.join(os.homedir(), ".super-app")) {
  validateUserId(userId);
  const root = path.resolve(baseDir, userId);
  return {
    userId,
    root,
    stateFile: path.join(root, "state.json"),
    presetsDir: path.join(root, "presets")
  };
}

export class SuperApp {
  constructor() { this.goals = []; }
  addGoal(name, priority) {
    if (!name || !name.trim()) throw new Error("Goal name cannot be empty");
    if (priority < 1 || priority > 5) throw new Error("Priority must be between 1 and 5");
  }
  addTask(goalName, taskTitle) {
    if (!taskTitle || !taskTitle.trim()) throw new Error("Task title cannot be empty");
    const goal = this.#findGoal(goalName);
  }
  completeTask(goalName, taskTitle) {
    const goal = this.#findGoal(goalName);
    const found = goal.tasks.find((task) => task.title === taskTitle);
    if (!found) throw new Error(`Task '${taskTitle}' not found in goal '${goalName}'`);
    found.done = true;
  }
  listGoals() { return [...this.goals].sort((a, b) => a.priority - b.priority); }
  save(path) { fs.writeFileSync(path, JSON.stringify({ goals: this.goals }, null, 2), "utf-8"); }
  static load(path) {
    const app = new SuperApp();
    const payload = JSON.parse(fs.readFileSync(path, "utf-8"));
    app.goals = (payload.goals || []).map((goal) => new Goal(goal.name, goal.priority, (goal.tasks || []).map((task) => new Task(task.title, task.done))));
    return app;
  }
  #findGoal(goalName) {
    const goal = this.goals.find((item) => item.name === goalName);
    if (!goal) throw new Error(`Goal '${goalName}' does not exist`);
    return goal;
  }
}

export const FRAMEWORKS = {
  react: { starter: "create-vite {name} --template react-ts", ecosystem: "node", category: "frontend" },
  vue: { starter: "create-vite {name} --template vue-ts", ecosystem: "node", category: "frontend" },
  svelte: { starter: "create-vite {name} --template svelte-ts", ecosystem: "node", category: "frontend" },
  solid: { starter: "create-vite {name} --template solid-ts", ecosystem: "node", category: "frontend" },
  angular: { starter: "@angular/cli@latest new {name} --defaults --skip-git", ecosystem: "node", category: "frontend" },
  next: { starter: "create-next-app@latest {name} --ts --eslint --app --use-npm", ecosystem: "node", category: "fullstack" },
  nuxt: { starter: "nuxi@latest init {name}", ecosystem: "node", category: "fullstack" },
  remix: { starter: "create-remix@latest {name}", ecosystem: "node", category: "fullstack" },
  astro: { starter: "create-astro@latest {name}", ecosystem: "node", category: "frontend" },
  qwik: { starter: "create-qwik@latest {name}", ecosystem: "node", category: "frontend" },
  gatsby: { starter: "gatsby@latest new {name}", ecosystem: "node", category: "frontend" },
  deno_fresh: { starter: "jsr:@fresh/create {name}", ecosystem: "deno", category: "fullstack" }
};

export const UI_LIBS = {
  tailwind: { install: "{pm} add -D tailwindcss postcss autoprefixer", ecosystems: ["node", "deno"] },
  mui: { install: "{pm} add @mui/material @emotion/react @emotion/styled", ecosystems: ["node"] },
  antd: { install: "{pm} add antd", ecosystems: ["node"] },
  chakra: { install: "{pm} add @chakra-ui/react @emotion/react", ecosystems: ["node"] },
  bootstrap: { install: "{pm} add bootstrap", ecosystems: ["node"] },
  mantine: { install: "{pm} add @mantine/core @mantine/hooks", ecosystems: ["node"] },
  shadcn: { install: "npx shadcn@latest init", ecosystems: ["node"] },
  radix: { install: "{pm} add @radix-ui/react-icons @radix-ui/react-dialog", ecosystems: ["node"] },
  daisyui: { install: "{pm} add -D daisyui", ecosystems: ["node"] },
  fluent: { install: "{pm} add @fluentui/react-components", ecosystems: ["node"] },
  primer: { install: "{pm} add @primer/react", ecosystems: ["node"] },
  primevue: { install: "{pm} add primevue", ecosystems: ["node"] }
};

const THEME_PRESETS = {
  neon_noir: { palette: ["#0B1021", "#7C3AED", "#06B6D4", "#F472B6"], vibe: "High-contrast cyberpunk with focused call-to-action accents" },
  calm_pro: { palette: ["#0F172A", "#334155", "#22C55E", "#F8FAFC"], vibe: "Low-cognitive-load productivity theme with soft hierarchy" },
  sunrise_flow: { palette: ["#1E293B", "#FB7185", "#F59E0B", "#FEF3C7"], vibe: "Warm motivational flow optimized for onboarding confidence" }
};

const CI_TEMPLATES = {
  node_basic: { filename: ".github/workflows/ci.yml", content: `name: CI\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '20'\n      - run: npm ci\n      - run: npm test\n` },
  node_security: { filename: ".github/workflows/security.yml", content: `name: Security\non: [push, pull_request]\njobs:\n  audit:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '20'\n      - run: npm ci\n      - run: npm audit --audit-level=high\n` }
};

export const STARTER_PRESETS = {

};

function normalizedPresetEntry(id, data) {
  if (!id || typeof id !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{1,62}$/.test(id)) throw new Error(`Invalid preset id '${id}'`);
  if (!data || typeof data !== "object") throw new Error(`Invalid preset definition for '${id}'`);
  const required = ["category", "maturity", "description", "framework", "packageManager", "ui", "theme", "ciTemplates", "researchNotes"];
  for (const key of required) {
    if (!(key in data)) throw new Error(`Preset '${id}' is missing required field '${key}'`);
  }
  if (!FRAMEWORKS[data.framework]) throw new Error(`Preset '${id}' references unknown framework '${data.framework}'`);
  if (!PM_RUNNERS[data.packageManager]) throw new Error(`Preset '${id}' references unknown package manager '${data.packageManager}'`);
  if (!THEME_PRESETS[data.theme]) throw new Error(`Preset '${id}' references unknown theme '${data.theme}'`);
  if (!Array.isArray(data.ui) || !Array.isArray(data.ciTemplates)) throw new Error(`Preset '${id}' has invalid list fields`);
  if ("maintenanceScore" in data && (!Number.isFinite(data.maintenanceScore) || data.maintenanceScore < 0 || data.maintenanceScore > 100)) throw new Error(`Preset '${id}' has invalid maintenanceScore (0-100 expected)`);
  if ("adoptionScore" in data && (!Number.isFinite(data.adoptionScore) || data.adoptionScore < 0 || data.adoptionScore > 100)) throw new Error(`Preset '${id}' has invalid adoptionScore (0-100 expected)`);
  if (data.ui.length === 0) throw new Error(`Preset '${id}' must include at least one UI library`);
  for (const ui of data.ui) if (!UI_LIBS[ui]) throw new Error(`Preset '${id}' references unknown UI library '${ui}'`);
  for (const template of data.ciTemplates) if (!CI_TEMPLATES[template]) throw new Error(`Preset '${id}' references unknown CI template '${template}'`);
  return { id, ...data };
}

function sha256Hex(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

export function loadExternalPresets(filePath, { expectedSha256 = "" } = {}) {
  const raw = fs.readFileSync(filePath, "utf-8");
  if (expectedSha256) {
    const actual = sha256Hex(raw);
    if (actual.toLowerCase() !== expectedSha256.toLowerCase()) throw new Error(`Preset file integrity check failed for '${filePath}'`);
  }
  const payload = JSON.parse(raw);
  const entries = Array.isArray(payload) ? payload.map((item) => [item.id, item]) : Object.entries(payload);
  return entries.map(([id, data]) => normalizedPresetEntry(id, data));
}

function mergePresetRegistry(externalPresets = []) {
  const merged = new Map(Object.entries(STARTER_PRESETS));
  for (const preset of externalPresets) {
    const { id, ...data } = preset;
    merged.set(id, data);
  }
  return merged;
}

export function designGuidance(theme = "calm_pro") {
  const selected = THEME_PRESETS[theme] || THEME_PRESETS.calm_pro;
  return { theme, palette: selected.palette, vibe: selected.vibe,
    psychology: ["Use progressive disclosure to reduce overwhelm for new users", "Keep primary actions visually consistent to improve decision speed", "Favor legible spacing and short labels for developer ergonomics"],
    developerExperience: ["Include copy-pasteable commands and sensible defaults", "Prefer strict validation errors with actionable hints", "Expose machine-readable JSON outputs for automation"] };
}

function validateProjectName(projectName) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-_]{1,62}$/.test(projectName)) throw new Error("Invalid project name. Use 2-63 chars: letters, numbers, dash, underscore.");
  const windowsReserved = new Set(["con", "prn", "aux", "nul", "com1", "com2", "com3", "com4", "com5", "com6", "com7", "com8", "com9", "lpt1", "lpt2", "lpt3", "lpt4", "lpt5", "lpt6", "lpt7", "lpt8", "lpt9"]);
  if (windowsReserved.has(projectName.toLowerCase())) throw new Error(`Invalid project name '${projectName}'. It is reserved on Windows.`);
}

function platformInstallCommand(packageManager) {
  if (packageManager === "npm") return "npm install";
  if (packageManager === "yarn") return "yarn install";
  return `${packageManager} install`;
}

function shellSafe(value, shell = "bash") {
  if (shell === "cmd") return value;
  if (shell === "powershell") return `'${value.replaceAll("'", "''")}'`;
  return `'${value.replaceAll("'", "'\\''")}'`;
}

function cmdSafePath(value) {
  if (/^[a-zA-Z0-9_./:-]+$/.test(value)) return value;
  return `"${value.replaceAll("\"", "\"\"")}"`;
}

export function renderScaffoldScript(commands, shell = "bash") {
  const commandLines = commands.filter((line) => !line.startsWith("#"));
  const commentLines = commands.filter((line) => line.startsWith("#"));
  if (shell === "powershell") {
    return ["$ErrorActionPreference = 'Stop'", ...commandLines.map((line) => line.startsWith("cd ") ? `Set-Location ${shellSafe(line.slice(3), "powershell")}` : line), ...commentLines].join("\n");
  }
  if (shell === "cmd") {
    return ["@echo off", "setlocal", ...commandLines.map((line) => line.startsWith("cd ") ? `cd /d ${cmdSafePath(line.slice(3))}` : line), ...commentLines.map((line) => `REM${line.slice(1)}`)].join("\r\n");
  }
  return ["set -euo pipefail", ...commandLines, ...commentLines].join("\n");
}

let environmentCache = null;

export function detectDeveloperEnvironment(forceRefresh = false) {
  if (environmentCache && !forceRefresh) return structuredClone(environmentCache);
  const detected = {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    shell: process.env.SHELL || process.env.ComSpec || "unknown",
    packageManagers: {}
  };
  for (const manager of Object.keys(PM_RUNNERS)) detected.packageManagers[manager] = isCommandAvailable(manager);
  detected.recommendedShell = process.platform === "win32" ? "powershell" : "bash";
  detected.host = os.hostname();
  environmentCache = detected;
  return structuredClone(detected);
}
    }
    return true;
  });
  return ranked ? rankStarterPresets(filtered, { telemetrySignals }) : filtered;
}

export function getCiTemplates(keys) { return keys.map((key) => { if (!CI_TEMPLATES[key]) throw new Error(`Unknown CI template: ${key}`); return { id: key, ...CI_TEMPLATES[key] }; }); }

function ensureCompatibility(framework, uiComponents, packageManager) {
  const frameworkData = FRAMEWORKS[framework];
  const pmData = PM_RUNNERS[packageManager];
  if (!frameworkData) throw new Error(`Unsupported framework: ${framework}`);
  if (!pmData) throw new Error(`Unsupported package manager: ${packageManager}`);
  if (frameworkData.ecosystem !== pmData.ecosystem) throw new Error(`Incompatible package manager '${packageManager}' for framework '${framework}'`);
  for (const ui of uiComponents) {
    const uiData = UI_LIBS[ui];
    if (!uiData) throw new Error(`Unsupported UI component/library: ${ui}`);
    if (!uiData.ecosystems.includes(frameworkData.ecosystem)) throw new Error(`UI component/library '${ui}' is not compatible with ${frameworkData.ecosystem}`);
  }
  return frameworkData;
}

export function securityPolicyReport(framework, uiComponents, packageManager, runCommands = false) {
  const frameworkData = ensureCompatibility(framework, uiComponents, packageManager);
  return { score: runCommands ? 85 : 92,
    checks: [
      { id: "ecosystem_compatibility", status: "pass", detail: `Framework ecosystem '${frameworkData.ecosystem}' matches package manager '${packageManager}'.` },
      { id: "ui_compatibility", status: "pass", detail: `All ${uiComponents.length} UI libraries are compatible.` },
      { id: "run_mode", status: runCommands ? "warn" : "pass", detail: runCommands ? "Command execution is enabled; review commands before running." : "Safe preview mode enabled (no execution)." }
    ],
    recommendations: ["Pin framework generator versions when possible.", "Run npm/pnpm/yarn audit (or equivalent) after scaffold.", "Use lockfiles and CI dependency scanning.", "Enable secret scanning and code scanning in GitHub settings."] };
}

export function generateScaffoldPlan(projectName, framework, uiComponents, packageManager, theme = "calm_pro") {
  validateProjectName(projectName);
  const frameworkData = ensureCompatibility(framework, uiComponents, packageManager);
  const pmData = PM_RUNNERS[packageManager];
  const steps = [pmData.runner ? `${pmData.runner} ${frameworkData.starter.replace("{name}", projectName)}` : frameworkData.starter.replace("{name}", projectName), `cd ${projectName}`];
  if (pmData.ecosystem === "node") steps.push(platformInstallCommand(packageManager));
  for (const ui of uiComponents) steps.push(UI_LIBS[ui].install.replaceAll("{pm}", packageManager));
  const design = designGuidance(theme);
  steps.push(`# Theme preset: ${theme}`);
  steps.push(`# Palette: ${design.palette.join(", ")}`);
  return steps;
}
  };
  if (!runCommands) return result;
  let cwd = process.cwd();
  for (const command of result.commands) {
    if (command.startsWith("#")) continue;
    if (command.startsWith("cd ")) {
      cwd = path.resolve(cwd, command.slice(3));
      continue;
    }
    const [executable, ...args] = parseCommandArgs(command);
    assertAllowedExecutable(executable);
    const run = spawnSync(executable, args, { cwd, stdio: "inherit", timeout: EXECUTION_TIMEOUT_MS });
    if (run.status !== 0) throw new Error(`Scaffold command failed: ${command}`);
  }
  result.executed = true;
  return result;
}


}



export function generateBootFiles(projectName, framework, includeDocsSite = false) {
  const files = [
    {
      path: "README.generated.md",
      content: `# ${projectName}

Generated by super-app for framework: ${framework}.

## Getting started
- Run dependency install
- Start local development
- Review security checklist in SECURITY.md
`
    },
    {
      path: ".env.example",
      content: `# Example environment variables
NODE_ENV=development
APP_NAME=${projectName}
`
    }
  ];
  if (includeDocsSite) {
    files.push({
      path: "docs/index.md",
      content: `# ${projectName} docs

This docs-site starter was generated by super-app.
`
    });
  }
  return files;
}



const REMINDER_TEMPLATES = {
  linux: {
    scheduler: "cron",
    sample: "0 9 * * 1-5 super-app doctor --json >> ~/super-app-health.log"
  },
  macos: {
    scheduler: "launchd",
    sample: "launchctl load ~/Library/LaunchAgents/com.superapp.reminder.plist"
  },
  windows: {
    scheduler: "task-scheduler",
    sample: "schtasks /Create /SC DAILY /TN SuperAppReminder /TR \"super-app doctor --json\" /ST 09:00"
  }
};

export function reminderPlan(platform = process.platform) {
  const normalized = platform === "darwin" ? "macos" : platform === "win32" ? "windows" : "linux";
  const template = REMINDER_TEMPLATES[normalized] || REMINDER_TEMPLATES.linux;
  return {
    platform: normalized,
    scheduler: template.scheduler,
    sampleCommand: template.sample,
    message: "Use reminder automation to run recurring health checks and scaffold audits."
  };
}



export function syncPlan(userId, provider = "github", remote = "origin") {
  const workspace = userWorkspace(userId);
  const providers = {
    github: {
      target: `git@github.com:<org>/${userId}-super-app-sync.git`,
      notes: "Use repository branch protection and secret scanning."
    },
    gitlab: {
      target: `git@gitlab.com:<group>/${userId}-super-app-sync.git`,
      notes: "Enable protected branches and dependency scanning."
    },
    bitbucket: {
      target: `git@bitbucket.org:<workspace>/${userId}-super-app-sync.git`,
      notes: "Require signed commits and workspace access controls."
    }
  };
  const selected = providers[provider] || providers.github;
  return {
    userId,
    provider,
    workspace,
    steps: [
      `cd ${workspace.root}`,
      "git init",
      `git remote add ${remote} ${selected.target}`,
      "git add state.json presets/",
      "git commit -m \"sync: update super-app workspace\"",
      `git push -u ${remote} main`
    ],
    notes: selected.notes
  };
}



export function evaluatePolicy(config, policy = {}) {
  const checks = [];
  const blockedFrameworks = new Set(policy.blockedFrameworks || []);
  const blockedUi = new Set(policy.blockedUi || []);
  const allowedPackageManagers = policy.allowedPackageManagers || [];

  checks.push({
    id: "framework_policy",
    status: blockedFrameworks.has(config.framework) ? "fail" : "pass",
    detail: blockedFrameworks.has(config.framework) ? `Framework '${config.framework}' is blocked by policy.` : "Framework allowed by policy."
  });

  const blockedUiFound = (config.uiComponents || []).filter((ui) => blockedUi.has(ui));
  checks.push({
    id: "ui_policy",
    status: blockedUiFound.length ? "fail" : "pass",
    detail: blockedUiFound.length ? `Blocked UI libraries: ${blockedUiFound.join(", ")}` : "UI libraries allowed by policy."
  });

  const pmStatus = allowedPackageManagers.length && !allowedPackageManagers.includes(config.packageManager) ? "fail" : "pass";
  checks.push({
    id: "package_manager_policy",
    status: pmStatus,
    detail: pmStatus === "fail" ? `Package manager '${config.packageManager}' is not in allowed list.` : "Package manager allowed by policy."
  });

  const status = checks.some((c) => c.status === "fail") ? "fail" : "pass";
  return { status, checks, policyVersion: policy.version || "1" };
}

export function loadPolicyFile(filePath) {
  const payload = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Invalid policy file format");
  return payload;
}

export function installHints() { return { ...INSTALL_HINTS }; }
  console.log("=== Super App Demo ===");
  for (const goal of app.listGoals()) {
    console.log(`Goal: ${goal.name} (priority ${goal.priority})`);
    for (const task of goal.tasks) console.log(`  [${task.done ? "x" : " "}] ${task.title}`);
  }
}
