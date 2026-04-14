import test from "node:test";
import assert from "node:assert/strict";

import { dashboardHtml } from "../extension/src/dashboard-webview.js";

test("dashboardHtml renders summary keys and escapes html", () => {
  const html = dashboardHtml({ workspace: "<unsafe>", updates: 3 }, ["react", "typescript"]);
  assert.ok(html.includes("Supe Dependency Dashboard"));
  assert.ok(html.includes("workspace"));
  assert.ok(html.includes("&lt;unsafe&gt;"));
  assert.ok(html.includes("Search dependencies (mouse + keyboard)"));
  assert.ok(html.includes("depSearch"));
  assert.ok(html.includes("react"));
});
