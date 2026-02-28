import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const FRAMEWORKS = {
  react: { starter: "create-vite {name} --template react-ts", ecosystem: "node", category: "frontend" },
  vue: { starter: "create-vite {name} --template vue-ts", ecosystem: "node", category: "frontend" },
  svelte: { starter: "create-vite {name} --template svelte-ts", ecosystem: "node", category: "frontend" },
  solid: { starter: "create-vite {name} --template solid-ts", ecosystem: "node", category: "frontend" },
  preact: { starter: "create-vite {name} --template preact-ts", ecosystem: "node", category: "frontend" },
  lit: { starter: "npm create lit@latest {name}", ecosystem: "node", category: "frontend" },
  angular: { starter: "@angular/cli@latest new {name} --defaults --skip-git", ecosystem: "node", category: "frontend" },
  next: { starter: "create-next-app@latest {name} --ts --eslint --app --use-npm", ecosystem: "node", category: "fullstack" },
  nuxt: { starter: "nuxi@latest init {name}", ecosystem: "node", category: "fullstack" },
  remix: { starter: "create-remix@latest {name}", ecosystem: "node", category: "fullstack" },
  astro: { starter: "create-astro@latest {name}", ecosystem: "node", category: "fullstack" },
  qwik: { starter: "create-qwik@latest {name}", ecosystem: "node", category: "frontend" },
  gatsby: { starter: "gatsby@latest new {name}", ecosystem: "node", category: "frontend" },
  ember: { starter: "ember-cli@latest new {name}", ecosystem: "node", category: "frontend" },
  stencil: { starter: "@stencil/core@latest init {name}", ecosystem: "node", category: "frontend" },
  electron: { starter: "create-electron-app {name}", ecosystem: "node", category: "desktop" },
  tauri: { starter: "create-tauri-app {name}", ecosystem: "node", category: "desktop" },
  express: { starter: "express-generator {name}", ecosystem: "node", category: "backend" },
  fastify: { starter: "fastify-cli generate {name}", ecosystem: "node", category: "backend" },
  nest: { starter: "@nestjs/cli new {name}", ecosystem: "node", category: "backend" },
  hono: { starter: "create-hono@latest {name}", ecosystem: "node", category: "backend" },
  adonis: { starter: "create-adonis-ts-app@latest {name}", ecosystem: "node", category: "backend" },
  cloudflare_workers: { starter: "create-cloudflare@latest {name}", ecosystem: "node", category: "edge" },
  cloudflare_vinext: { starter: "create-vinxi@latest {name}", ecosystem: "node", category: "edge" },
  deno_fresh: { starter: "jsr:@fresh/create {name}", ecosystem: "deno", category: "fullstack" }
};

export const PM_RUNNERS = {
  npm: { ecosystem: "node", runner: "npx" },
  pnpm: { ecosystem: "node", runner: "pnpm dlx" },
  yarn: { ecosystem: "node", runner: "yarn dlx" },
  bun: { ecosystem: "node", runner: "bunx" },
  deno: { ecosystem: "deno", runner: "deno run -A -r" }
};

export const UI_LIBS = {
  tailwind: { install: "{pm} add -D tailwindcss postcss autoprefixer", ecosystems: ["node", "deno"], type: "styling" },
  mui: { install: "{pm} add @mui/material @emotion/react @emotion/styled", ecosystems: ["node"], type: "component" },
  chakra: { install: "{pm} add @chakra-ui/react", ecosystems: ["node"], type: "component" },
  antd: { install: "{pm} add antd", ecosystems: ["node"], type: "component" },
  mantine: { install: "{pm} add @mantine/core @mantine/hooks", ecosystems: ["node"], type: "component" },
  shadcn: { install: "npx shadcn@latest init", ecosystems: ["node"], type: "component" },
  radix: { install: "{pm} add @radix-ui/react-icons @radix-ui/react-dialog", ecosystems: ["node"], type: "component" },
  headlessui: { install: "{pm} add @headlessui/react", ecosystems: ["node"], type: "component" },
  bootstrap: { install: "{pm} add bootstrap", ecosystems: ["node"], type: "styling" },
  daisyui: { install: "{pm} add -D daisyui", ecosystems: ["node"], type: "styling" },
  bulma: { install: "{pm} add bulma", ecosystems: ["node"], type: "styling" },
  fluent: { install: "{pm} add @fluentui/react-components", ecosystems: ["node"], type: "component" },
  primer: { install: "{pm} add @primer/react", ecosystems: ["node"], type: "component" },
  primevue: { install: "{pm} add primevue", ecosystems: ["node"], type: "component" }
};

export const ANIMATION_LIBS = {
  framer_motion: { install: "{pm} add framer-motion", ecosystems: ["node"] },
  gsap: { install: "{pm} add gsap", ecosystems: ["node"] },
  animejs: { install: "{pm} add animejs", ecosystems: ["node"] },
  motion_one: { install: "{pm} add motion", ecosystems: ["node"] },
  lottie_web: { install: "{pm} add lottie-web", ecosystems: ["node"] },
  react_spring: { install: "{pm} add @react-spring/web", ecosystems: ["node"] },
  auto_animate: { install: "{pm} add @formkit/auto-animate", ecosystems: ["node"] }
};

export const MOUSE_INTERACTION_LIBS = {
  use_gesture: { install: "{pm} add @use-gesture/react", ecosystems: ["node"], focus: "drag/gesture and clickable interactions" },
  interactjs: { install: "{pm} add interactjs", ecosystems: ["node"], focus: "drag/drop and pointer interactions" },
  pointer_tracker: { install: "{pm} add pointer-tracker", ecosystems: ["node"], focus: "high-performance pointer tracking" },
  dnd_kit: { install: "{pm} add @dnd-kit/core", ecosystems: ["node"], focus: "click/drag sortable interactions" }
};

class Goal {
  constructor(name, priority) {
    this.name = name;
    this.priority = priority;
    this.tasks = [];
  }
}

class Task {
  constructor(title, done = false) {
    this.title = title;
    this.done = done;
  }
}

function validateUserId(userId) {
  if (!userId || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{1,62}$/.test(userId)) {
    throw new Error("Invalid user id. Use 2-63 chars: letters, numbers, dash, underscore.");
  }
}

function ensureCompatibility(framework, uiComponents, packageManager) {
  const frameworkData = FRAMEWORKS[framework];
  const pmData = PM_RUNNERS[packageManager];
  if (!frameworkData) throw new Error(`Unsupported framework: ${framework}`);
  if (!pmData) throw new Error(`Unsupported package manager: ${packageManager}`);
  if (frameworkData.ecosystem !== pmData.ecosystem) {
    throw new Error(`Incompatible package manager '${packageManager}' for framework '${framework}'`);
  }

  for (const ui of uiComponents) {
    const uiData = UI_LIBS[ui];
    if (!uiData) throw new Error(`Unsupported UI component/library: ${ui}`);
    if (!uiData.ecosystems.includes(frameworkData.ecosystem)) {
      throw new Error(`UI component/library '${ui}' is not compatible with ${frameworkData.ecosystem}`);
    }
  }

  return { frameworkData, pmData };
}

function validateProjectName(projectName) {
  if (!projectName || !/^[a-zA-Z0-9][a-zA-Z0-9-_]*$/.test(projectName)) {
    throw new Error("Invalid project name. Use letters, numbers, dash, underscore.");
  }

  if (projectName.includes("..") || projectName.includes("/") || projectName.includes("\\")) {
    throw new Error("Invalid project name. Path traversal is not allowed.");
  }

  const windowsReserved = new Set([
    "con", "prn", "aux", "nul", "com1", "com2", "com3", "com4", "com5", "com6", "com7", "com8", "com9",
    "lpt1", "lpt2", "lpt3", "lpt4", "lpt5", "lpt6", "lpt7", "lpt8", "lpt9"
  ]);

  if (windowsReserved.has(projectName.toLowerCase())) {
    throw new Error(`Invalid project name '${projectName}'. It is reserved on Windows.`);
  }
}

function platformInstallCommand(packageManager) {
  if (packageManager === "yarn") return "yarn install";
  return `${packageManager} install`;
}

export function userWorkspace(userId, baseDir = path.join(os.homedir(), ".supe")) {
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
  constructor() {
    this.goals = [];
  }

  addGoal(name, priority) {
    if (!name || !name.trim()) throw new Error("Goal name cannot be empty");
    if (priority < 1 || priority > 5) throw new Error("Priority must be between 1 and 5");
    if (this.goals.some((goal) => goal.name === name)) throw new Error(`Goal '${name}' already exists`);
    this.goals.push(new Goal(name, priority));
  }

  addTask(goalName, taskTitle) {
    if (!taskTitle || !taskTitle.trim()) throw new Error("Task title cannot be empty");
    const goal = this.#findGoal(goalName);
    goal.tasks.push(new Task(taskTitle));
  }

  completeTask(goalName, taskTitle) {
    const goal = this.#findGoal(goalName);
    const found = goal.tasks.find((task) => task.title === taskTitle);
    if (!found) throw new Error(`Task '${taskTitle}' not found in goal '${goalName}'`);
    found.done = true;
  }

  listGoals() {
    return [...this.goals].sort((a, b) => a.priority - b.priority);
  }

  save(filePath) {
    fs.writeFileSync(filePath, JSON.stringify({ goals: this.goals }, null, 2), "utf-8");
  }

  static load(filePath) {
    const app = new SuperApp();
    const payload = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    app.goals = (payload.goals || []).map((goal) => {
      const g = new Goal(goal.name, goal.priority);
      g.tasks = (goal.tasks || []).map((task) => new Task(task.title, task.done));
      return g;
    });
    return app;
  }

  #findGoal(goalName) {
    const goal = this.goals.find((item) => item.name === goalName);
    if (!goal) throw new Error(`Goal '${goalName}' does not exist`);
    return goal;
  }
}

export function designGuidance(theme = "calm_pro") {
  const themes = {
    calm_pro: { vibe: "Minimal, balanced spacing, neutral accents", palette: ["#0B1220", "#334155", "#3B82F6", "#E2E8F0"] },
    neon_noir: { vibe: "High contrast, futuristic gradients", palette: ["#050816", "#7C3AED", "#22D3EE", "#F8FAFC"] },
    sunrise_flow: { vibe: "Warm, approachable, optimistic", palette: ["#1F2937", "#FB7185", "#F59E0B", "#FFF7ED"] }
  };
  const selected = themes[theme] || themes.calm_pro;
  return { theme, ...selected };
}

export function generateScaffoldPlan(projectName, framework, uiComponents, packageManager, theme = "calm_pro") {
  validateProjectName(projectName);
  const { frameworkData, pmData } = ensureCompatibility(framework, uiComponents, packageManager);

  const createCommand = pmData.runner
    ? `${pmData.runner} ${frameworkData.starter.replace("{name}", projectName)}`
    : frameworkData.starter.replace("{name}", projectName);

  const steps = [createCommand, `cd ${projectName}`];
  if (pmData.ecosystem === "node") steps.push(platformInstallCommand(packageManager));
  for (const ui of uiComponents) steps.push(UI_LIBS[ui].install.replaceAll("{pm}", packageManager));

  const design = designGuidance(theme);
  steps.push(`# Theme preset: ${theme}`);
  steps.push(`# Palette: ${design.palette.join(", ")}`);
  return steps;
}

export function scaffoldStarterApp(projectName, framework, uiComponents = ["tailwind"], packageManager = "npm", runCommands = false) {
  const commands = generateScaffoldPlan(projectName, framework, uiComponents, packageManager);
  return { projectName, framework, uiComponents, packageManager, commands, executed: runCommands };
}

export function securityPolicyReport(framework, uiComponents, packageManager, runCommands = false) {
  const { frameworkData } = ensureCompatibility(framework, uiComponents, packageManager);
  return {
    score: runCommands ? 85 : 92,
    checks: [
      { id: "ecosystem_compatibility", status: "pass", detail: `Framework ecosystem '${frameworkData.ecosystem}' matches package manager '${packageManager}'.` },
      { id: "ui_compatibility", status: "pass", detail: `All ${uiComponents.length} UI libraries are compatible.` },
      { id: "run_mode", status: runCommands ? "warn" : "pass", detail: runCommands ? "Command execution is enabled; review commands before running." : "Safe preview mode enabled (no execution)." }
    ]
  };
}

export function installHints() {
  return {
    npm: "npm install",
    pnpm: "pnpm install",
    yarn: "yarn",
    bun: "bun install",
    deno: "deno cache"
  };
}

export function detectDeveloperEnvironment() {
  return {
    platform: process.platform,
    node: process.version,
    cwd: process.cwd()
  };
}

export function syncPlan(userId, provider = "github", remote = "origin") {
  const workspace = userWorkspace(userId);
  return {
    userId,
    provider,
    remote,
    steps: [
      `mkdir -p ${workspace.root}`,
      `git remote add ${remote} git@${provider}.com:${userId}/supe.git`,
      `git push -u ${remote} main`
    ]
  };
}

export function evaluatePolicy(policy, framework, packageManager, ui = []) {
  const report = securityPolicyReport(framework, ui, packageManager, false);
  return { policy, report, compliant: report.score >= 90 };
}

export function queryStarterPresets() {
  return [
    { id: "react-fast", framework: "react", packageManager: "npm", ui: ["tailwind", "framer_motion"], maturity: "stable", category: "frontend", description: "Fast React starter for production apps." },
    { id: "next-enterprise", framework: "next", packageManager: "npm", ui: ["tailwind", "mui"], maturity: "stable", category: "fullstack", description: "Opinionated Next.js baseline for enterprise teams." },
    { id: "edge-vinext", framework: "cloudflare_vinext", packageManager: "pnpm", ui: ["tailwind"], maturity: "beta", category: "edge", description: "Cloudflare-friendly Vinext starter profile." },
    { id: "astro-content", framework: "astro", packageManager: "pnpm", ui: ["tailwind"], maturity: "stable", category: "fullstack", description: "Astro baseline for docs/content products." },
    { id: "next-admin-dashboard", framework: "next", packageManager: "pnpm", ui: ["tailwind", "radix"], maturity: "stable", category: "fullstack", description: "Admin dashboard focused starter with component primitives." },
    { id: "next-ecommerce", framework: "next", packageManager: "pnpm", ui: ["tailwind", "shadcn"], maturity: "stable", category: "fullstack", description: "E-commerce starter with checkout-ready UI stack." },
    { id: "astro-blog", framework: "astro", packageManager: "pnpm", ui: ["tailwind"], maturity: "stable", category: "fullstack", description: "Blog/content publishing template optimized for speed." },
    { id: "remix-saas", framework: "remix", packageManager: "npm", ui: ["tailwind", "headlessui"], maturity: "beta", category: "fullstack", description: "SaaS-oriented Remix preset for authenticated products." }
  ];
}

export function rankStarterPresets(presets) {
  return [...presets].sort((a, b) => a.id.localeCompare(b.id));
}

export function scaffoldFromPreset(projectName, presetId) {
  const preset = queryStarterPresets().find((item) => item.id === presetId);
  if (!preset) throw new Error(`Unknown preset: ${presetId}`);
  return scaffoldStarterApp(projectName, preset.framework, preset.ui.filter((lib) => UI_LIBS[lib]), preset.packageManager, false);
}

export function researchCatalog() {
  return {
    frameworks: Object.entries(FRAMEWORKS).map(([id, value]) => ({ id, ...value })),
    uiLibraries: Object.entries(UI_LIBS).map(([id, value]) => ({ id, ...value })),
    animationLibraries: Object.entries(ANIMATION_LIBS).map(([id, value]) => ({ id, ...value })),
    mouseInteractionLibraries: Object.entries(MOUSE_INTERACTION_LIBS).map(([id, value]) => ({ id, ...value }))
  };
}

export function demo() {
  console.log("supe.js demo:\n- Use 'supe --help' to explore commands.");
}
