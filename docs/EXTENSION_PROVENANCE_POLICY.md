# Extension Release Secrets & Provenance Policy

This document defines the minimum controls for publishing the VS Code extension in production.

## Required secrets

- `VSCE_PAT`: token for Visual Studio Marketplace publish operations.
- `NPM_TOKEN`: token for npm interactions performed by release tooling.

## Required controls

1. **OIDC keyless signing**: VSIX artifacts must be signed with `cosign` keyless flow.
2. **Build provenance attestation**: each release artifact must include build provenance metadata.
3. **Least-privilege tokens**: secrets must be scoped to publish-only operations.
4. **Branch/tag protection**: only protected release tags (e.g. `v*`) may trigger release workflow.
5. **Manual approval gate**: production environment should require reviewer approval.

## Telemetry privacy baseline

- `privacyMode` defaults to `true` in extension settings.
- telemetry endpoint must be explicitly configured by operators.
- do not emit telemetry payloads when `privacyMode` is on.

## Incident response

If secret leakage is suspected:

1. Revoke `VSCE_PAT` and `NPM_TOKEN` immediately.
2. Rotate secrets and re-run release from a clean, audited commit.
3. Verify signatures and provenance for latest published artifact.
