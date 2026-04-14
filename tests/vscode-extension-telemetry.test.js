import test from "node:test";
import assert from "node:assert/strict";

import { createTelemetryPayload, trackEvent } from "../extension/src/telemetry.js";

function config(values) {
  return {
    get(key, fallback) {
      return key in values ? values[key] : fallback;
    }
  };
}

test("createTelemetryPayload returns structured envelope", () => {
  const payload = createTelemetryPayload("refresh", { updates: 3 });
  assert.equal(payload.eventName, "refresh");
  assert.equal(payload.properties.updates, 3);
  assert.ok(typeof payload.at === "string");
});

test("trackEvent skips send when endpoint is missing", async () => {
  const messages = [];
  const output = { appendLine(msg) { messages.push(msg); } };
  let called = 0;

  await trackEvent(
    output,
    config({ telemetryEnabled: true, privacyMode: false, telemetryEndpoint: "" }),
    "refresh",
    { updates: 1 },
    async () => {
      called += 1;
      return { ok: true, status: 200 };
    }
  );

  assert.equal(called, 0);
  assert.ok(messages.some((msg) => msg.includes("no endpoint configured")));
});
