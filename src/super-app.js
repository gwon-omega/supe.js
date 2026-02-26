import fs from "node:fs";
import { spawnSync } from "node:child_process";

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
  deno_fresh: { starter: "create-fresh@latest {name}", ecosystem: "deno", category: "fullstack" }
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

export function designGuidance(theme = "calm_pro") {
  const selected = THEME_PRESETS[theme] || THEME_PRESETS.calm_pro;
  return { theme, palette: selected.palette, vibe: selected.vibe,
    psychology: ["Use progressive disclosure to reduce overwhelm for new users", "Keep primary actions visually consistent to improve decision speed", "Favor legible spacing and short labels for developer ergonomics"],
    developerExperience: ["Include copy-pasteable commands and sensible defaults", "Prefer strict validation errors with actionable hints", "Expose machine-readable JSON outputs for automation"] };
}

function validateProjectName(projectName) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-_]{1,62}$/.test(projectName)) throw new Error("Invalid project name. Use 2-63 chars: letters, numbers, dash, underscore.");
}

    }
    return true;
  });
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
  if (pmData.ecosystem === "node") steps.push(packageManager === "npm" ? "npm install" : `${packageManager} install`);
  for (const ui of uiComponents) steps.push(UI_LIBS[ui].install.replaceAll("{pm}", packageManager));
  const design = designGuidance(theme);
  steps.push(`# Theme preset: ${theme}`);
  steps.push(`# Palette: ${design.palette.join(", ")}`);
  return steps;
}


    commands: generateScaffoldPlan(projectName, framework, uiComponents, packageManager, theme), executed: false
  };
  if (!runCommands) return result;
  for (const command of result.commands) {
    if (command.startsWith("#")) continue;
    const run = spawnSync(command, { shell: true, stdio: "inherit" });
    if (run.status !== 0) throw new Error(`Scaffold command failed: ${command}`);
  }
  result.executed = true;
  return result;
}


}

export function installHints() { return { ...INSTALL_HINTS }; }
  console.log("=== Super App Demo ===");
  for (const goal of app.listGoals()) {
    console.log(`Goal: ${goal.name} (priority ${goal.priority})`);
    for (const task of goal.tasks) console.log(`  [${task.done ? "x" : " "}] ${task.title}`);
  }
}
