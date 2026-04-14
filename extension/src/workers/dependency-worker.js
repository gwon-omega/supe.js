import { parentPort } from "node:worker_threads";
import { mergePackageRowsWithOutdated } from "../package-insights.js";

if (parentPort) {
  parentPort.on("message", (payload) => {
    const { rows, outdatedMap } = payload || {};
    const merged = mergePackageRowsWithOutdated(rows || [], outdatedMap || {});
    parentPort.postMessage({ ok: true, merged });
  });
}
