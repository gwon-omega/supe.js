function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createTelemetryPayload(eventName, properties = {}) {
  return {
    eventName,
    properties,
    at: new Date().toISOString()
  };
}

export async function trackEvent(output, config, eventName, properties = {}, fetchFn = fetch) {
  const enabled = config.get("telemetryEnabled", false);
  const privacyMode = config.get("privacyMode", true);
  if (!enabled || privacyMode) return;

  const endpoint = config.get("telemetryEndpoint", "").trim();
  const apiKey = config.get("telemetryApiKey", "").trim();
  const maxRetries = Math.max(0, Number(config.get("telemetryMaxRetries", 2) || 0));
  const timeoutMs = Math.max(500, Number(config.get("telemetryTimeoutMs", 3000) || 3000));

  const payload = createTelemetryPayload(eventName, properties);
  output.appendLine(`[telemetry] queued ${eventName}`);

  if (!endpoint) {
    output.appendLine(`[telemetry] no endpoint configured; skipped remote publish for ${eventName}`);
    return;
  }

  let attempt = 0;
  while (attempt <= maxRetries) {
    attempt += 1;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetchFn(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {})
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (response.ok) {
        output.appendLine(`[telemetry] sent ${eventName} in attempt ${attempt}`);
        return;
      }

      output.appendLine(`[telemetry] failed attempt ${attempt} for ${eventName}: HTTP ${response.status}`);
    } catch (error) {
      output.appendLine(`[telemetry] failed attempt ${attempt} for ${eventName}: ${error.message}`);
    }

    if (attempt <= maxRetries) await wait(150 * attempt);
  }
}
