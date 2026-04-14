import test from "node:test";
import assert from "node:assert/strict";
import * as vscode from "vscode";

test("supe extension commands are registered", async () => {
  const commands = await vscode.commands.getCommands(true);
  [
    "supeExtension.quickInit",
    "supeExtension.presetScaffold",
    "supeExtension.packageAction",
    "supeExtension.refreshDependencies",
    "supeExtension.installPackage",
    "supeExtension.uninstallPackage",
    "supeExtension.loadMoreDependencies",
    "supeExtension.openDashboard",
    "supeExtension.searchDependencies"
  ].forEach((cmd) => assert.ok(commands.includes(cmd), `${cmd} should be registered`));
});

test("dependency view command can execute", async () => {
  await vscode.commands.executeCommand("supeExtension.refreshDependencies");
  assert.ok(true);
});
