const PACKAGE_ACTIONS = {
  install: {
    npm: "npm install",
    pnpm: "pnpm install",
    yarn: "yarn",
    bun: "bun install"
  },
  update: {
    npm: "npm update",
    pnpm: "pnpm update",
    yarn: "yarn upgrade",
    bun: "bun update"
  },
  test: {
    npm: "npm test",
    pnpm: "pnpm test",
    yarn: "yarn test",
    bun: "bun test"
  }
};

const PACKAGE_INSTALL_COMMANDS = {
  npm: (name, dev) => `npm install ${dev ? "--save-dev " : ""}${name}`.trim(),
  pnpm: (name, dev) => `pnpm add ${dev ? "--save-dev " : ""}${name}`.trim(),
  yarn: (name, dev) => `yarn add ${dev ? "--dev " : ""}${name}`.trim(),
  bun: (name, dev) => `bun add ${dev ? "--dev " : ""}${name}`.trim()
};

const PACKAGE_UNINSTALL_COMMANDS = {
  npm: (name) => `npm uninstall ${name}`,
  pnpm: (name) => `pnpm remove ${name}`,
  yarn: (name) => `yarn remove ${name}`,
  bun: (name) => `bun remove ${name}`
};

function validateProjectName(projectName) {
  if (!projectName || !/^[a-zA-Z0-9][a-zA-Z0-9-_]*$/.test(projectName)) {
    throw new Error("Invalid project name. Use letters, numbers, dash, underscore.");
  }
  if (projectName.includes("..") || projectName.includes("/") || projectName.includes("\\")) {
    throw new Error("Invalid project name. Path traversal is not allowed.");
  }
}

function validatePackageName(packageName) {
  if (!packageName || !/^[a-zA-Z0-9@][a-zA-Z0-9@._/-]*$/.test(packageName)) {
    throw new Error("Invalid package name.");
  }
}

export function buildSupeInitCommand(projectName, framework = "") {
  validateProjectName(projectName);
  const frameworkPart = framework ? ` --framework ${framework}` : "";
  return `npx @supejs/supe init ${projectName}${frameworkPart} --yes`;
}

export function buildSupePresetCommand(projectName, presetId) {
  validateProjectName(projectName);
  if (!presetId) throw new Error("presetId is required");
  return `npx @supejs/supe preset ${projectName} --name ${presetId} --json`;
}

export function buildPackageCommand(pm, action) {
  const pmMap = PACKAGE_ACTIONS[action];
  if (!pmMap) throw new Error(`Unsupported action: ${action}`);
  const command = pmMap[pm];
  if (!command) throw new Error(`Unsupported package manager: ${pm}`);
  return command;
}

export function buildInstallPackageCommand(pm, packageName, isDev = false) {
  validatePackageName(packageName);
  const installer = PACKAGE_INSTALL_COMMANDS[pm];
  if (!installer) throw new Error(`Unsupported package manager: ${pm}`);
  return installer(packageName, isDev);
}

export function buildUninstallPackageCommand(pm, packageName) {
  validatePackageName(packageName);
  const uninstall = PACKAGE_UNINSTALL_COMMANDS[pm];
  if (!uninstall) throw new Error(`Unsupported package manager: ${pm}`);
  return uninstall(packageName);
}

export const SUPPORTED_PACKAGE_MANAGERS = ["npm", "pnpm", "yarn", "bun"];
export const SUPPORTED_PACKAGE_ACTIONS = ["install", "update", "test"];
export const SUPPORTED_PRESETS = [
  "react-fast",
  "next-enterprise",
  "edge-vinext",
  "astro-content",
  "next-admin-dashboard",
  "next-ecommerce",
  "astro-blog",
  "remix-saas"
];
