import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

import {
  ANIMATION_LIBS,
  FRAMEWORKS,
  MOUSE_INTERACTION_LIBS,
  PM_RUNNERS,
  SuperApp,
  generateScaffoldPlan,
  installHints,
  queryStarterPresets,
  researchCatalog,
  rankStarterPresets,
  securityPolicyReport,
  UI_LIBS,
} from "../src/supe.js";
import { main } from "../bin/supe.js";

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
  const file = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), "supe-")),
    "state.json",
  );
  app.save(file);
  const loaded = SuperApp.load(file);
  assert.equal(loaded.goals[0].name, "Roadmap");
});

test("security and validation checks", () => {
  assert.throws(
    () => generateScaffoldPlan("../evil", "react", ["tailwind"], "npm"),
    /Invalid project name/,
  );
  assert.throws(
    () => generateScaffoldPlan("con", "react", ["tailwind"], "npm"),
    /reserved on Windows/,
  );
  assert.throws(
    () => generateScaffoldPlan("bad", "next", ["tailwind"], "deno"),
    /Incompatible package manager/,
  );
  assert.ok(
    generateScaffoldPlan(
      "edge-kit",
      "deno_fresh",
      ["tailwind"],
      "deno",
    )[0].startsWith("deno run -A -r jsr:@fresh/create"),
  );
  const report = securityPolicyReport("react", ["tailwind"], "npm", true);
  assert.equal(report.checks.find((c) => c.id === "run_mode").status, "warn");
});

test("catalog includes broad framework/library coverage", () => {
  assert.ok(Object.keys(FRAMEWORKS).length > 20);
  assert.ok(FRAMEWORKS.astro);
  assert.ok(FRAMEWORKS.cloudflare_vinext);
  assert.ok(FRAMEWORKS.cloudflare_workers);

  assert.ok(UI_LIBS.mui);
  assert.ok(UI_LIBS.radix);
  assert.ok(ANIMATION_LIBS.framer_motion);
  assert.ok(ANIMATION_LIBS.gsap);
  assert.ok(MOUSE_INTERACTION_LIBS.dnd_kit);
  assert.ok(MOUSE_INTERACTION_LIBS.use_gesture);

  const catalog = researchCatalog();
  assert.ok(catalog.frameworks.length > 20);
  assert.ok(catalog.animationLibraries.length >= 5);
  assert.ok(catalog.mouseInteractionLibraries.length >= 3);
});

test("install hints and package manager map", () => {
  const hints = installHints();
  ["npm", "pnpm", "yarn", "bun", "deno"].forEach((manager) =>
    assert.ok(hints[manager]),
  );
  assert.deepEqual(
    new Set(Object.keys(PM_RUNNERS)),
    new Set(["npm", "pnpm", "yarn", "bun", "deno"]),
  );
});

test("preset catalog includes expanded templates", () => {
  const presets = rankStarterPresets(queryStarterPresets());
  assert.ok(presets.length >= 8);
  [
    "next-admin-dashboard",
    "next-ecommerce",
    "astro-blog",
    "remix-saas",
  ].forEach((id) => assert.ok(presets.find((preset) => preset.id === id)));
});

test("cli help exits cleanly", () => {
  assert.equal(main(["--help"]), 0);
});

test("published bin entrypoints are executable or present on Windows", () => {
  ["bin/supe.js", "bin/index.js"].forEach((binPath) => {
    const full = path.join(process.cwd(), binPath);
    const stat = fs.statSync(full);
    if (process.platform === "win32") {
      // On Windows executable bits aren't meaningful; ensure file exists
      assert.ok(fs.existsSync(full), `${binPath} must exist on Windows`);
    } else {
      assert.ok((stat.mode & 0o111) !== 0, `${binPath} must be executable`);
    }
  });
});
test("package metadata exposes create-super-app and create-supe-app bins", () => {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
  );
  assert.equal(pkg.bin["create-super-app"], "bin/index.js");
  assert.equal(pkg.bin["create-supe-app"], "bin/index.js");
});

test("cli help includes init and shell commands", () => {
  const output = execFileSync(process.execPath, ["bin/supe.js", "--help"], {
    encoding: "utf8",
  });
  assert.match(output, /supe init \[project-name\]/);
  assert.match(output, /supe shell/);
});

test("running supe without arguments shows the help menu", () => {
  const output = execFileSync(process.execPath, ["bin/supe.js"], {
    encoding: "utf8",
  });
  assert.match(output, /Usage:\n  supe <command> \[options\]/);
  assert.match(output, /Start fast:/);
});


test("README installer URLs and installer files stay aligned", () => {
  const readme = fs.readFileSync(path.join(process.cwd(), "README.md"), "utf8");
  const files = [
    "supe-install.sh",
    "supe-install.sh.sha256",
    "supe-install.ps1",
    "supe-install.ps1.sha256",
  ];

  files.forEach((name) => {
    assert.ok(
      readme.includes(
        `https://raw.githubusercontent.com/gwon-omega/supe.js/main/scripts/${name}`,
      ),
    );
    assert.ok(fs.existsSync(path.join(process.cwd(), "scripts", name)));
  });

  assert.ok(!readme.includes("raw.githubusercontent.com/supejs/supe"));
});


test("packaging metadata uses canonical GitHub repository URL", () => {
  const nuspec = fs.readFileSync(
    path.join(process.cwd(), "packaging/chocolatey/supe.nuspec"),
    "utf8",
  );
  assert.match(nuspec, /<projectUrl>https:\/\/github\.com\/gwon-omega\/supe\.js<\/projectUrl>/);
  assert.ok(!nuspec.includes("github.com/supejs/supe"));
});


test("installer and homebrew URLs use canonical repository hosts", () => {
  const readme = fs.readFileSync(path.join(process.cwd(), "README.md"), "utf8");
  const formula = fs.readFileSync(
    path.join(process.cwd(), "packaging/homebrew/supe.rb"),
    "utf8",
  );

  [
    "https://raw.githubusercontent.com/gwon-omega/supe.js/main/scripts/supe-install.sh",
    "https://raw.githubusercontent.com/gwon-omega/supe.js/main/scripts/supe-install.sh.sha256",
    "https://raw.githubusercontent.com/gwon-omega/supe.js/main/scripts/supe-install.ps1",
    "https://raw.githubusercontent.com/gwon-omega/supe.js/main/scripts/supe-install.ps1.sha256",
  ].forEach((url) => assert.ok(readme.includes(url), `missing URL in README: ${url}`));

  assert.match(formula, /homepage "https:\/\/github\.com\/gwon-omega\/supe\.js"/);
  assert.match(
    formula,
    /url "https:\/\/github\.com\/gwon-omega\/supe\.js\/archive\/refs\/tags\/v[0-9]+\.[0-9]+\.[0-9]+\.tar\.gz"/,
  );
});


test("repository clone commands are documented", () => {
  const readme = fs.readFileSync(path.join(process.cwd(), "README.md"), "utf8");
  assert.ok(readme.includes("git clone https://github.com/gwon-omega/supe.js.git"));
  assert.ok(readme.includes("git clone git@github.com:gwon-omega/supe.js.git"));
  assert.ok(readme.includes("gh repo clone gwon-omega/supe.js"));
});
