export function trackEvent(output, config, eventName, properties = {}) {
  const enabled = config.get("telemetryEnabled", false);
  const privacyMode = config.get("privacyMode", true);
  if (!enabled || privacyMode) return;
  const payload = JSON.stringify({ eventName, properties, at: new Date().toISOString() });
  output.appendLine(`[telemetry] ${payload}`);
}
