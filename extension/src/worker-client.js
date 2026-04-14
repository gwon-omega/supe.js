import { Worker } from "node:worker_threads";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mergePackageRowsWithOutdated } from "./package-insights.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workerPath = path.join(__dirname, "workers", "dependency-worker.js");

export function mergeDependencyRowsInWorker(rows, outdatedMap, timeoutMs = 3000) {
  return new Promise((resolve) => {
    const worker = new Worker(workerPath);

    const timer = setTimeout(() => {
      worker.terminate().finally(() => {
        resolve(mergePackageRowsWithOutdated(rows, outdatedMap));
      });
    }, timeoutMs);

    worker.once("message", (message) => {
      clearTimeout(timer);
      worker.terminate().finally(() => {
        if (message?.ok && Array.isArray(message?.merged)) resolve(message.merged);
        else resolve(mergePackageRowsWithOutdated(rows, outdatedMap));
      });
    });

    worker.once("error", () => {
      clearTimeout(timer);
      worker.terminate().finally(() => {
        resolve(mergePackageRowsWithOutdated(rows, outdatedMap));
      });
    });

    worker.postMessage({ rows, outdatedMap });
  });
}
