import test from "node:test";
import assert from "node:assert/strict";

import {
  buildInstallPackageCommand,
  buildPackageCommand,
  buildSupeInitCommand,
  buildSupePresetCommand,
  buildUninstallPackageCommand
} from "../extension/src/command-builder.js";

test("buildSupeInitCommand builds safe init command", () => {
  assert.equal(
    buildSupeInitCommand("my-app", "next"),
    "npx @supejs/supe init my-app --framework next --yes"
  );
  assert.throws(() => buildSupeInitCommand("../bad", "next"), /Invalid project name/);
});

test("buildSupePresetCommand requires valid inputs", () => {
  assert.equal(
    buildSupePresetCommand("my-app", "next-enterprise"),
    "npx @supejs/supe preset my-app --name next-enterprise --json"
  );
  assert.throws(() => buildSupePresetCommand("my-app", ""), /presetId is required/);
});

test("buildPackageCommand supports one-click pm actions", () => {
  assert.equal(buildPackageCommand("npm", "install"), "npm install");
  assert.equal(buildPackageCommand("pnpm", "update"), "pnpm update");
  assert.equal(buildPackageCommand("yarn", "test"), "yarn test");
  assert.throws(() => buildPackageCommand("winget", "install"), /Unsupported package manager/);
});

test("buildInstallPackageCommand and buildUninstallPackageCommand support multi-pm workflows", () => {
  assert.equal(buildInstallPackageCommand("npm", "typescript", true), "npm install --save-dev typescript");
  assert.equal(buildInstallPackageCommand("pnpm", "zod", false), "pnpm add zod");
  assert.equal(buildUninstallPackageCommand("yarn", "react"), "yarn remove react");
  assert.throws(() => buildInstallPackageCommand("npm", "bad name", false), /Invalid package name/);
});
