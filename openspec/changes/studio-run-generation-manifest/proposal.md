# Studio Run Workspace And Generation Manifest

## Why

Run in Game needs one request-scoped artifact root and one generator input. The
system currently selects request generation through ambient files and env. That
allows stale ignored state and cache behavior to change what gets launched.

This packet creates the request workspace, correlation tuple, artifact id, and
manifest writer.

## System Context

Affected owners:

- `packages/studio-server` Run in Game workflow
- internal runtime manifest schema module
- source-resolution output from the previous packet
- future Swooper manifest generator

The generation manifest is a private runtime input, not public wire contract.

## Before And After

Before:

- request generation can depend on ambient config files or env selectors;
- request identity, source digest, output paths, and diagnostics paths are not
  one persisted input.

After:

- `StudioRunWorkspace` is `.mapgen-studio/run-in-game/<requestId>/`;
- `RunArtifactId` is `run-${sha256(requestId).slice(0, 20)}`;
- `RunCorrelation` contains request id, run artifact id, launch source digest,
  launch envelope digest, and generation manifest digest;
- manifest digest is SHA-256 over canonical sorted JSON of
  `StudioRunGenerationManifestPayload`;
- the runtime writes exactly one `StudioRunGenerationManifest` from a resolved
  launch source before invoking generation.

## Behavior Verification

Behavior tests verify workspace creation, manifest writing, digest stability,
artifact id validation, and a Run in Game request reaching
`generating-artifacts` with a persisted manifest before generation starts.

## Structural Enforcement

Permanent positive assertions:

- Run in Game request artifacts live under the request workspace root;
- manifest schema is internal runtime contract, not public status or start DTO;
- request generation consumes exactly one manifest input.

Structural authority row: SA-07 `structure-studio-run-workspace-topology`.
Behavior tests cover manifest content and digest behavior.

## Verification Gates

- Manifest parser/writer behavior tests.
- Workflow behavior test for manifest-created state.
- SA-07 `structure-studio-run-workspace-topology`.
- `bun run openspec -- validate studio-run-generation-manifest --strict`.
