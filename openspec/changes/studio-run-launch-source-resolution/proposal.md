# Studio Run Launch Source Resolution

## Why

Run in Game start input currently mixes catalog selection, editor state,
source paths, snapshots, and materialization mode. That makes the UI, server,
and generator share source authority. Source resolution needs one closed
boundary before request-scoped generation can be deterministic.

## System Context

Affected owners:

- `packages/studio-contract/src/runInGame.ts`
- Studio UI Run in Game start request construction
- `packages/studio-server` source-resolution/admission code
- Swooper catalog source index reader from the previous packet

This packet does not write generation manifests or invoke generators.

## Before And After

Before:

- start input accepts mixed fields such as raw config, source snapshot,
  selected source path, and materialization mode;
- the UI can carry fields that imply source authority.

After:

- start input is a closed discriminated union:
  `CatalogLaunchSource | EditorLaunchSource`;
- the Studio app supplies editor state only;
- the server resolves launch source into `ResolvedLaunchSource`,
  `LaunchEnvelope`, `LaunchSourceDigest`, and `LaunchEnvelopeDigest`;
- catalog source reads go through Swooper-owned `CatalogSourceIndex`;
- editor launch never writes catalog source paths.

## Behavior Verification

Behavior tests verify accepted catalog/editor input, invalid input rejection,
source digest stability, envelope digest stability, and editor-source launch
resolution without source-file writes.

## Structural Enforcement

Permanent positive assertions:

- public start schema is a closed discriminated launch-source union;
- server runtime owns source resolution;
- Studio UI does not own source-path authority;
- Swooper owns catalog source index reading.

Structural authority row: SA-05 `grit-studio-run-launch-source-boundary`.

## Verification Gates

- Contract/schema tests for start input.
- Server source-resolution behavior tests.
- UI request-construction behavior tests.
- SA-05 `grit-studio-run-launch-source-boundary`.
- `bun run openspec -- validate studio-run-launch-source-resolution --strict`.
