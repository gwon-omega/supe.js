import test from "node:test";
import assert from "node:assert/strict";

import { mergeDependencyRowsInWorker } from "../extension/src/worker-client.js";

test("mergeDependencyRowsInWorker merges outdated versions", async () => {
  const rows = [{ name: "react", version: "^18.2.0", type: "dependencies" }];
  const outdated = { react: { current: "18.2.0", latest: "19.0.0" } };
  const merged = await mergeDependencyRowsInWorker(rows, outdated, 1000);
  assert.equal(merged[0].hasUpdate, true);
  assert.equal(merged[0].badge, "MAJOR");
});
