import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  PM_RUNNERS,
  SuperApp,
  generateScaffoldPlan,
  getCiTemplates,
  installHints,
  listStarterPresets,
  queryStarterPresets,
  scaffoldFromPreset,
  scaffoldStarterApp,
  securityPolicyReport
} from "../src/super-app.js";
import { main } from "../bin/super-app.js";

test("goal model basic flow", () => {
  const app = new SuperApp();
  app.addGoal("Growth", 2);
  app.addTask("Growth", "Launch campaign");
  app.completeTask("Growth", "Launch campaign");
  assert.equal(app.listGoals()[0].tasks[0].done, true);
});

test("save and load", () => {
  const app = new SuperApp();
  app.addGoal("Roadmap", 1);
  app.addTask("Roadmap", "Define milestones");
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "super-app-")), "state.json");
  app.save(file);
  const loaded = SuperApp.load(file);
  assert.equal(loaded.goals[0].name, "Roadmap");
});

test("security and validation checks", () => {
  assert.throws(() => generateScaffoldPlan("../evil", "react", ["tailwind"], "npm"), /Invalid project name/);
  assert.throws(() => generateScaffoldPlan("bad", "next", ["tailwind"], "deno"), /Incompatible package manager/);
  const report = securityPolicyReport("react", ["tailwind"], "npm", true);
  assert.equal(report.checks.find((c) => c.id === "run_mode").status, "warn");
});

test("starter result includes security and ci templates", () => {
  const result = scaffoldStarterApp("starter", "vue", ["antd"], "pnpm", false, "calm_pro", ["node_basic"]);
  assert.ok(result.security.score > 0);
  assert.equal(result.ciTemplates[0].id, "node_basic");
});

test("preset list and scaffold", () => {
  const presets = listStarterPresets();
  assert.ok(presets.length >= 8);
  assert.ok(presets.find((p) => p.id === "saas"));
  const out = scaffoldFromPreset("my-saas", "saas", false);
  assert.equal(out.framework, "next");
});

test("preset query filters", () => {
  const nodePresets = queryStarterPresets({ ecosystem: "node" });
  const denoPresets = queryStarterPresets({ ecosystem: "deno" });
  const aiPresets = queryStarterPresets({ category: "ai" });
  const searched = queryStarterPresets({ search: "edge" });
  assert.ok(nodePresets.length >= 5);
  assert.ok(denoPresets.find((p) => p.id === "deno_api_edge"));
  assert.equal(aiPresets[0].id, "ai_playground");
  assert.ok(searched.length >= 1);
});

test("ci templates fetch", () => {
  const templates = getCiTemplates(["node_basic", "node_security"]);
  assert.equal(templates.length, 2);
});

test("install hints and package managers", () => {
  const hints = installHints();
  ["npm", "pnpm", "yarn", "bun", "deno"].forEach((manager) => assert.ok(hints[manager]));
  assert.deepEqual(new Set(Object.keys(PM_RUNNERS)), new Set(["npm", "pnpm", "yarn", "bun", "deno"]));
});

test("cli commands return success", () => {
  assert.equal(main(["install-hints", "--json"]), 0);
  assert.equal(main(["security", "--framework", "react", "--package-manager", "npm", "--ui", "tailwind", "--json"]), 0);
  assert.equal(main(["preset", "--list", "--json"]), 0);
  assert.equal(main(["preset", "--list", "--category", "ai", "--json"]), 0);
  assert.equal(main(["preset", "--name", "saas", "my-saas"]), 0);
});
