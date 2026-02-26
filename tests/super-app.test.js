import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

import {
  PM_RUNNERS,
  SuperApp,
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
  assert.throws(() => generateScaffoldPlan("con", "react", ["tailwind"], "npm"), /reserved on Windows/);
  assert.throws(() => generateScaffoldPlan("bad", "next", ["tailwind"], "deno"), /Incompatible package manager/);
  assert.ok(generateScaffoldPlan("edge-kit", "deno_fresh", ["tailwind"], "deno")[0].startsWith("deno run -A -r jsr:@fresh/create"));
  const report = securityPolicyReport("react", ["tailwind"], "npm", true);
  assert.equal(report.checks.find((c) => c.id === "run_mode").status, "warn");
});

  const hints = installHints();
  ["npm", "pnpm", "yarn", "bun", "deno"].forEach((manager) => assert.ok(hints[manager]));
  assert.deepEqual(new Set(Object.keys(PM_RUNNERS)), new Set(["npm", "pnpm", "yarn", "bun", "deno"]));
});
});
