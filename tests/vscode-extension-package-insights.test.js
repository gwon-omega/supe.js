import test from "node:test";
import assert from "node:assert/strict";

import {
  mergePackageRowsWithOutdated,
  parseOutdatedResult,
  readPackageRows
} from "../extension/src/package-insights.js";

test("readPackageRows collects dependencies and devDependencies", () => {
  const rows = readPackageRows(JSON.stringify({
    dependencies: { react: "^19.0.0" },
    devDependencies: { typescript: "^5.8.0" }
  }));

  assert.equal(rows.length, 2);
  assert.equal(rows[0].name, "react");
  assert.equal(rows[1].name, "typescript");
});

test("parseOutdatedResult tolerates invalid payloads", () => {
  assert.deepEqual(parseOutdatedResult(""), {});
  assert.deepEqual(parseOutdatedResult("not-json"), {});
  assert.deepEqual(parseOutdatedResult('{"react":{"current":"18.0.0","latest":"19.0.0"}}').react.latest, "19.0.0");
  const yarnTable = "{\"type\":\"table\",\"data\":{\"body\":[[\"react\",\"18.2.0\",\"18.3.0\",\"19.0.0\"]]}}";
  assert.equal(parseOutdatedResult(yarnTable).react.latest, "19.0.0");
});

test("mergePackageRowsWithOutdated computes badges", () => {
  const rows = [{ name: "react", version: "^18.2.0", type: "dependencies" }];
  const outdated = { react: { current: "18.2.0", latest: "19.0.0" } };
  const merged = mergePackageRowsWithOutdated(rows, outdated);
  assert.equal(merged[0].hasUpdate, true);
  assert.equal(merged[0].badge, "MAJOR");
});
