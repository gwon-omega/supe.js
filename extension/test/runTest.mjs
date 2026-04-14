import path from "node:path";
import { fileURLToPath } from "node:url";
import { runTests } from "@vscode/test-electron";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, "..");
    const extensionTestsPath = path.resolve(__dirname, "suite", "index.mjs");
    await runTests({ extensionDevelopmentPath, extensionTestsPath });
  } catch (error) {
    console.error("Failed to run extension tests", error);
    process.exit(1);
  }
}

main();
