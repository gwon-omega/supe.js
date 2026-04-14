import fs from "node:fs";
import path from "node:path";

const LOCKFILE_TO_PM = {
  "pnpm-lock.yaml": "pnpm",
  "yarn.lock": "yarn",
  "bun.lockb": "bun",
  "package-lock.json": "npm"
};

export function detectPackageManager(workspacePath) {
  for (const [lockfile, packageManager] of Object.entries(LOCKFILE_TO_PM)) {
    if (fs.existsSync(path.join(workspacePath, lockfile))) return packageManager;
  }
  return "npm";
}

export function readPackageRows(packageJsonText) {
  const pkg = JSON.parse(packageJsonText || "{}");
  const dependencies = Object.entries(pkg.dependencies || {}).map(([name, version]) => ({
    name,
    version,
    type: "dependencies"
  }));
  const devDependencies = Object.entries(pkg.devDependencies || {}).map(([name, version]) => ({
    name,
    version,
    type: "devDependencies"
  }));

  return [...dependencies, ...devDependencies].sort((a, b) => a.name.localeCompare(b.name));
}

export function parseOutdatedResult(stdout) {
  if (!stdout || !stdout.trim()) return {};
  try {
    const payload = JSON.parse(stdout);
    if (payload?.type === "table" && Array.isArray(payload?.data?.body)) {
      const mapped = {};
      for (const row of payload.data.body) {
        const [name, current, wanted, latest] = row;
        if (!name) continue;
        mapped[name] = { current, wanted, latest };
      }
      return mapped;
    }
    return payload && typeof payload === "object" ? payload : {};
  } catch {
    const lines = stdout.split("\n").map((line) => line.trim()).filter(Boolean);
    const mapped = {};

    for (const line of lines) {
      try {
        const payload = JSON.parse(line);
        if (payload?.type === "table" && Array.isArray(payload?.data?.body)) {
          for (const row of payload.data.body) {
            const [name, current, wanted, latest] = row;
            if (!name) continue;
            mapped[name] = { current, wanted, latest };
          }
        }
      } catch {
        // ignore malformed json lines
      }
    }
    return mapped;
  }
}

function normalizeVersion(version) {
  return String(version || "").replace(/^[^0-9]*/, "");
}

function diffType(current, latest) {
  const c = normalizeVersion(current).split(".").map(Number);
  const l = normalizeVersion(latest).split(".").map(Number);
  if (c.length < 3 || l.length < 3 || c.some(Number.isNaN) || l.some(Number.isNaN)) return "update";
  if (l[0] > c[0]) return "major";
  if (l[1] > c[1]) return "minor";
  if (l[2] > c[2]) return "patch";
  return "none";
}

export function mergePackageRowsWithOutdated(rows, outdatedMap) {
  return rows.map((row) => {
    const outdated = outdatedMap[row.name];
    if (!outdated) {
      return {
        ...row,
        latest: row.version,
        hasUpdate: false,
        badge: ""
      };
    }

    const kind = diffType(outdated.current, outdated.latest);
    return {
      ...row,
      current: outdated.current || row.version,
      latest: outdated.latest || row.version,
      hasUpdate: kind !== "none",
      badge: kind === "none" ? "" : kind.toUpperCase()
    };
  });
}
