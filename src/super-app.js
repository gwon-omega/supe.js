import fs from "node:fs";
import { spawnSync } from "node:child_process";

export class Task {
  constructor(title, done = false) {
    this.title = title;
    this.done = done;
  }
}

export class Goal {
  constructor(name, priority, tasks = []) {
    this.name = name;
    this.priority = priority;
    this.tasks = tasks;
  }
}

export class SuperApp {
  constructor() { this.goals = []; }
  addGoal(name, priority) {
    if (!name || !name.trim()) throw new Error("Goal name cannot be empty");
    if (priority < 1 || priority > 5) throw new Error("Priority must be between 1 and 5");
    const goal = new Goal(name.trim(), priority, []);
    this.goals.push(goal);
    return goal;
  }
  addTask(goalName, taskTitle) {
    if (!taskTitle || !taskTitle.trim()) throw new Error("Task title cannot be empty");
    const goal = this.#findGoal(goalName);
    const task = new Task(taskTitle.trim(), false);
    goal.tasks.push(task);
    return task;
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

export const PM_RUNNERS = {
  npm: { runner: "npx", ecosystem: "node" },
  pnpm: { runner: "pnpm dlx", ecosystem: "node" },
  yarn: { runner: "yarn dlx", ecosystem: "node" },
  bun: { runner: "bunx", ecosystem: "node" },
  deno: { runner: "", ecosystem: "deno" }
};

export const INSTALL_HINTS = {
  npm: "npm i -g super-app-cli", pnpm: "pnpm add -g super-app-cli", yarn: "yarn global add super-app-cli", bun: "bun add -g super-app-cli",
  deno: "deno install -A -n super-app jsr:@super/app-cli", brew: "brew install super-app", scoop: "scoop install super-app", choco: "choco install super-app"
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
  saas: { category: "product", maturity: "stable", description: "SaaS web app starter with auth-ready UI stack", framework: "next", packageManager: "npm", ui: ["tailwind", "radix"], theme: "calm_pro", ciTemplates: ["node_basic", "node_security"], researchNotes: "Common OSS SaaS baseline favors Next.js + Tailwind + component primitives for long-term maintainability." },
  dashboard: { category: "internal-tools", maturity: "stable", description: "Internal dashboard with fast iteration", framework: "react", packageManager: "pnpm", ui: ["tailwind", "mantine"], theme: "neon_noir", ciTemplates: ["node_basic"], researchNotes: "React + Mantine has strong DX for operations/admin surfaces with quick UI assembly." },
  commerce: { category: "product", maturity: "stable", description: "Commerce storefront baseline", framework: "nuxt", packageManager: "npm", ui: ["tailwind", "daisyui"], theme: "sunrise_flow", ciTemplates: ["node_basic", "node_security"], researchNotes: "Nuxt storefront workflows commonly optimize SEO + edge rendering + rapid theme customization." },
  docs_portal: { category: "content", maturity: "stable", description: "Technical documentation portal", framework: "astro", packageManager: "pnpm", ui: ["tailwind"], theme: "calm_pro", ciTemplates: ["node_basic"], researchNotes: "Astro is popular for content-heavy sites with low JS payloads and fast performance." },
  design_system: { category: "frontend-platform", maturity: "advanced", description: "Design system and component workbench starter", framework: "react", packageManager: "pnpm", ui: ["tailwind", "radix", "shadcn"], theme: "calm_pro", ciTemplates: ["node_basic", "node_security"], researchNotes: "Radix + utility CSS is widely adopted for accessible primitives and scalable token systems." },
  ai_playground: { category: "ai", maturity: "emerging", description: "AI feature experimentation starter", framework: "next", packageManager: "npm", ui: ["tailwind", "primer"], theme: "neon_noir", ciTemplates: ["node_basic", "node_security"], researchNotes: "Next.js remains a dominant choice for shipping AI-integrated web experiences quickly." },
  realtime_hub: { category: "realtime", maturity: "emerging", description: "Realtime collaboration/event stream frontend", framework: "svelte", packageManager: "pnpm", ui: ["tailwind"], theme: "sunrise_flow", ciTemplates: ["node_basic"], researchNotes: "Svelte-based builds are often chosen for fast interaction-heavy interfaces with lean bundles." },
  deno_api_edge: { category: "edge", maturity: "experimental", description: "Deno Fresh edge-first API + web starter", framework: "deno_fresh", packageManager: "deno", ui: ["tailwind"], theme: "calm_pro", ciTemplates: ["node_basic"], researchNotes: "Fresh is growing for edge deployments and minimal-JS SSR-first architecture." }
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

export function researchCatalog() {
  return { frameworks: Object.entries(FRAMEWORKS).map(([id, data]) => ({ id, ...data })), uiLibraries: Object.entries(UI_LIBS).map(([id, data]) => ({ id, ...data })), packageManagers: Object.entries(PM_RUNNERS).map(([id, data]) => ({ id, ...data })) };
}

export function listStarterPresets() { return Object.entries(STARTER_PRESETS).map(([id, data]) => ({ id, ...data })); }

export function queryStarterPresets({ category, ecosystem, search } = {}) {
  return listStarterPresets().filter((preset) => {
    if (category && preset.category !== category) return false;
    if (ecosystem && FRAMEWORKS[preset.framework].ecosystem !== ecosystem) return false;
    if (search) {
      const haystack = `${preset.id} ${preset.description} ${preset.researchNotes}`.toLowerCase();
      if (!haystack.includes(search.toLowerCase())) return false;
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

export function scaffoldStarterApp(projectName, framework, uiComponents, packageManager, runCommands, theme = "calm_pro", ciTemplates = []) {
  const result = {
    projectName, framework, uiComponents, packageManager, theme,
    design: designGuidance(theme), security: securityPolicyReport(framework, uiComponents, packageManager, runCommands), ciTemplates: getCiTemplates(ciTemplates),
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

export function scaffoldFromPreset(projectName, presetName, runCommands = false, overrides = {}) {
  const preset = STARTER_PRESETS[presetName];
  if (!preset) throw new Error(`Unknown preset: ${presetName}`);
  return scaffoldStarterApp(
    projectName,
    overrides.framework || preset.framework,
    overrides.ui || preset.ui,
    overrides.packageManager || preset.packageManager,
    runCommands,
    overrides.theme || preset.theme,
    preset.ciTemplates
  );
}

export function installHints() { return { ...INSTALL_HINTS }; }

export function demo() {
  const app = new SuperApp();
  app.addGoal("Launch MVP", 1);
  app.addTask("Launch MVP", "Build core features");
  app.addTask("Launch MVP", "Write tests");
  app.completeTask("Launch MVP", "Build core features");
  console.log("=== Super App Demo ===");
  for (const goal of app.listGoals()) {
    console.log(`Goal: ${goal.name} (priority ${goal.priority})`);
    for (const task of goal.tasks) console.log(`  [${task.done ? "x" : " "}] ${task.title}`);
  }
}
