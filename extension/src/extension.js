import * as vscode from "vscode";
import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import {
  buildInstallPackageCommand,
  buildPackageCommand,
  buildSupeInitCommand,
  buildSupePresetCommand,
  buildUninstallPackageCommand,
  SUPPORTED_PACKAGE_ACTIONS,
  SUPPORTED_PACKAGE_MANAGERS,
  SUPPORTED_PRESETS
} from "./command-builder.js";
import {
  detectPackageManager,
  parseOutdatedResult,
  readPackageRows
} from "./package-insights.js";
import { mergeDependencyRowsInWorker } from "./worker-client.js";
import { trackEvent } from "./telemetry.js";

function workspaceRoot() {
  const folder = vscode.workspace.workspaceFolders?.[0];
  return folder?.uri.fsPath || "";
}

function extensionConfig() {
  return vscode.workspace.getConfiguration("supeExtension");
}

function runInTerminal(command) {
  const terminal = vscode.window.activeTerminal || vscode.window.createTerminal("Supe Toolkit");
  terminal.show(true);
  terminal.sendText(command, true);
}

function execOutdated(packageManager, cwd, timeoutMs, output) {
  const commands = {
    npm: ["npm", ["outdated", "--json"]],
    pnpm: ["pnpm", ["outdated", "--format", "json"]],
    yarn: ["yarn", ["outdated", "--json"]],
    bun: ["bun", ["outdated", "--json"]]
  };
  const [cmd, args] = commands[packageManager] || commands.npm;
  return new Promise((resolve) => {
    execFile(cmd, args, { cwd, timeout: timeoutMs }, (error, stdout, stderr) => {
      if (stderr) output.appendLine(stderr.trim());
      if (!error) {
        resolve(stdout || "{}");
        return;
      }
      output.appendLine(`[supe] outdated command finished with non-zero exit (${cmd}).`);
      resolve(stdout || "{}");
    });
  });
}

class DependencyItem extends vscode.TreeItem {
  constructor(dep) {
    const label = dep.badge ? `${dep.name} [${dep.badge}]` : dep.name;
    super(label, vscode.TreeItemCollapsibleState.None);
    this.description = dep.hasUpdate ? `${dep.current || dep.version} → ${dep.latest}` : dep.version;
    this.tooltip = `${dep.type}: ${dep.name}\nCurrent: ${dep.current || dep.version}\nLatest: ${dep.latest}`;
    this.contextValue = dep.hasUpdate ? "dependency.outdated" : "dependency";
    this.dep = dep;
    this.iconPath = dep.hasUpdate ? new vscode.ThemeIcon("arrow-up", new vscode.ThemeColor("charts.orange")) : new vscode.ThemeIcon("package");
    this.command = {
      command: "supeExtension.uninstallPackage",
      title: "Uninstall package",
      arguments: [dep.name]
    };
  }
}

class LoadMoreItem extends vscode.TreeItem {
  constructor(remainingCount) {
    super(`Load more (${remainingCount} remaining)`, vscode.TreeItemCollapsibleState.None);
    this.command = {
      command: "supeExtension.loadMoreDependencies",
      title: "Load more dependencies"
    };
    this.iconPath = new vscode.ThemeIcon("chevron-down");
  }
}

class DependencyProvider {
  constructor() {
    this.items = [];
    this.visibleCount = 0;
    this.cacheKey = "";
    this.lastRefreshAt = 0;
    this.refreshVersion = 0;
    this.lastError = "";
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  getTreeItem(item) {
    return item;
  }

  getChildren() {
    const pageSize = extensionConfig().get("pageSize", 200);
    const size = this.visibleCount || pageSize;
    const visible = this.items.slice(0, size).map((item) => new DependencyItem(item));
    const remaining = this.items.length - visible.length;
    if (remaining > 0) visible.push(new LoadMoreItem(remaining));
    return visible;
  }

  loadMore() {
    const pageSize = extensionConfig().get("pageSize", 200);
    this.visibleCount = Math.min(this.items.length, (this.visibleCount || pageSize) + pageSize);
    this._onDidChangeTreeData.fire();
  }

  async refresh(output, preferredPackageManagerOverride = "") {
    const cwd = workspaceRoot();
    if (!cwd) {
      this.items = [];
      this.lastError = "No workspace folder is open.";
      this._onDidChangeTreeData.fire();
      return { updates: 0, error: this.lastError };
    }

    try {
      this.lastError = "";
      const refreshToken = ++this.refreshVersion;
      const now = Date.now();
      const packagePath = path.join(cwd, "package.json");
      const packageStat = await fs.stat(packagePath);
      const packageManager = preferredPackageManagerOverride
        || (extensionConfig().get("preferredPackageManager", "auto") === "auto"
        ? detectPackageManager(cwd)
        : extensionConfig().get("preferredPackageManager", "npm"));
      const cacheTtlMs = extensionConfig().get("cacheTtlMs", 3000);
      const nextCacheKey = `${packageStat.mtimeMs}:${packageManager}`;

      if (this.cacheKey === nextCacheKey && now - this.lastRefreshAt < cacheTtlMs) {
        return { updates: this.items.filter((item) => item.hasUpdate).length, error: "" };
      }

      const packageJsonText = await fs.readFile(packagePath, "utf8");
      const baseRows = readPackageRows(packageJsonText);
      const timeoutMs = extensionConfig().get("commandTimeoutMs", 12000);
      output.appendLine(`[supe] refreshing dependencies with ${packageManager}...`);
      const outdatedStdout = await execOutdated(packageManager, cwd, timeoutMs, output);
      const outdatedMap = parseOutdatedResult(outdatedStdout);

      if (refreshToken !== this.refreshVersion) {
        return { updates: this.items.filter((item) => item.hasUpdate).length, error: "" };
      }

      const workerTimeoutMs = extensionConfig().get("workerTimeoutMs", 3000);
      this.items = await mergeDependencyRowsInWorker(baseRows, outdatedMap, workerTimeoutMs);
      this.visibleCount = Math.min(this.items.length, extensionConfig().get("pageSize", 200));
      this.cacheKey = nextCacheKey;
      this.lastRefreshAt = now;
      this._onDidChangeTreeData.fire();
      return { updates: this.items.filter((item) => item.hasUpdate).length, error: "" };
    } catch (error) {
      this.lastError = error?.message || "Failed to refresh dependency insights.";
      this.items = [];
      this._onDidChangeTreeData.fire();
      return { updates: 0, error: this.lastError };
    }
  }
}

async function quickInitCommand() {
  const projectName = await vscode.window.showInputBox({ placeHolder: "my-app", prompt: "Project name" });
  if (!projectName) return;
  const framework = await vscode.window.showQuickPick(["react", "next", "nuxt", "astro", "remix", "deno_fresh"], {
    title: "Select framework (optional)",
    canPickMany: false
  });
  const command = buildSupeInitCommand(projectName, framework || "");
  runInTerminal(command);
  vscode.window.showInformationMessage(`Queued: ${command}`);
}

async function presetScaffoldCommand() {
  const projectName = await vscode.window.showInputBox({ placeHolder: "my-app", prompt: "Project name for preset scaffold" });
  if (!projectName) return;
  const presetId = await vscode.window.showQuickPick(SUPPORTED_PRESETS, { title: "Pick preset", canPickMany: false });
  if (!presetId) return;
  const command = buildSupePresetCommand(projectName, presetId);
  runInTerminal(command);
  vscode.window.showInformationMessage(`Queued: ${command}`);
}

async function packageActionCommand() {
  const packageManager = await vscode.window.showQuickPick(SUPPORTED_PACKAGE_MANAGERS, { title: "Package manager", canPickMany: false });
  if (!packageManager) return;
  const action = await vscode.window.showQuickPick(SUPPORTED_PACKAGE_ACTIONS, { title: "One-click action", canPickMany: false });
  if (!action) return;
  runInTerminal(buildPackageCommand(packageManager, action));
}

async function installPackageCommand() {
  const cwd = workspaceRoot();
  if (!cwd) return;
  const packageManager = detectPackageManager(cwd);
  const packageName = await vscode.window.showInputBox({ prompt: "Package to install", placeHolder: "lodash or @types/node" });
  if (!packageName) return;
  const target = await vscode.window.showQuickPick(["dependencies", "devDependencies"], { title: "Install target" });
  if (!target) return;
  runInTerminal(buildInstallPackageCommand(packageManager, packageName, target === "devDependencies"));
}

async function uninstallPackageCommand(packageName) {
  const cwd = workspaceRoot();
  if (!cwd) return;
  const packageManager = detectPackageManager(cwd);

  let target = packageName;
  if (!target) {
    const providerItems = dependencyProvider.items.map((item) => item.name);
    target = await vscode.window.showQuickPick(providerItems, { title: "Select package to uninstall" });
  }
  if (!target) return;

  runInTerminal(buildUninstallPackageCommand(packageManager, target));
}

let dependencyProvider;
let refreshTimer;

export async function activate(context) {
  dependencyProvider = new DependencyProvider();
  const output = vscode.window.createOutputChannel("Supe Toolkit");

  const treeView = vscode.window.createTreeView("supeDependencies", {
    treeDataProvider: dependencyProvider,
    showCollapseAll: false
  });

  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBar.command = "supeExtension.refreshDependencies";

  async function refreshWithBadge() {
    const { updates, error } = await dependencyProvider.refresh(output);
    treeView.badge = updates ? { value: updates, tooltip: `${updates} package updates available` } : undefined;
    statusBar.text = `$(package) Supe updates: ${updates}`;
    statusBar.tooltip = "Click to refresh dependency insights";
    statusBar.show();
    trackEvent(output, extensionConfig(), "refresh.dependencies", { updates });

    if (error) {
      const action = await vscode.window.showErrorMessage(
        `Supe refresh failed: ${error}`,
        "Retry",
        "Fallback to npm"
      );
      if (action === "Retry") await refreshWithBadge();
      if (action === "Fallback to npm") {
        const fallback = await dependencyProvider.refresh(output, "npm");
        treeView.badge = fallback.updates
          ? { value: fallback.updates, tooltip: `${fallback.updates} package updates available` }
          : undefined;
        statusBar.text = `$(package) Supe updates: ${fallback.updates}`;
        statusBar.show();
      }
    }
  }

  function scheduleRefresh() {
    clearTimeout(refreshTimer);
    const debounceMs = extensionConfig().get("refreshDebounceMs", 400);
    refreshTimer = setTimeout(() => {
      refreshWithBadge().catch(() => {});
    }, debounceMs);
  }

  const watcher = vscode.workspace.createFileSystemWatcher("**/package.json");
  watcher.onDidChange(() => {
    if (!extensionConfig().get("autoRefreshOnPackageJsonChange", true)) return;
    scheduleRefresh();
  });
  watcher.onDidCreate(() => {
    if (!extensionConfig().get("autoRefreshOnPackageJsonChange", true)) return;
    scheduleRefresh();
  });
  watcher.onDidDelete(() => {
    if (!extensionConfig().get("autoRefreshOnPackageJsonChange", true)) return;
    scheduleRefresh();
  });

  context.subscriptions.push(
    watcher,
    treeView,
    statusBar,
    output,
    vscode.commands.registerCommand("supeExtension.quickInit", quickInitCommand),
    vscode.commands.registerCommand("supeExtension.presetScaffold", presetScaffoldCommand),
    vscode.commands.registerCommand("supeExtension.packageAction", packageActionCommand),
    vscode.commands.registerCommand("supeExtension.refreshDependencies", refreshWithBadge),
    vscode.commands.registerCommand("supeExtension.loadMoreDependencies", () => dependencyProvider.loadMore()),
    vscode.commands.registerCommand("supeExtension.installPackage", installPackageCommand),
    vscode.commands.registerCommand("supeExtension.uninstallPackage", uninstallPackageCommand)
  );

  await refreshWithBadge();
}

export function deactivate() {}
