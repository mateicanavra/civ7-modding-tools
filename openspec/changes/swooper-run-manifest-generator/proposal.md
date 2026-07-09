# Swooper Run Manifest Generator

## Why

Run in Game generation should be boring: one manifest in, one request-local
generated mod tree out. It should not scan catalog configs, select request state
through env, or write shared generated/mod/dist outputs.

## System Context

Affected owners:

- Swooper Maps generation CLI/target
- file-plan renderer from the previous packet
- request workspace/manifest from the previous packet

This packet does not connect Studio runtime to the new generator. That happens
in the integration packet.

## Before And After

Before:

- request generation can share the catalog generator and shared write roots;
- request correlation can come from env or ambient state.

After:

- Swooper provides a manifest-only generator command/port;
- the generator accepts exactly one manifest path;
- `StudioRunGeneratedMod` is written only under the request workspace;
- generated script path is `maps/${runArtifactId}.js`;
- generated row id is `MAP_${runArtifactId.replace(/-/g, "_").toUpperCase()}`;
- generated runtime assets embed full `RunCorrelation`.

## Behavior Verification

Behavior tests use fixture manifests to verify generated mod content, map row id,
script path, marker/correlation content, and error behavior for invalid
manifest input.

## Structural Enforcement

Permanent positive assertions:

- request generation command has a single manifest input;
- request generation output root is the request workspace generated-mod root;
- Swooper request generation consumes the file-plan renderer;
- generated mod contains the required file classes defined in
  `target-vocabulary.md`.

Structural authority row: SA-08
`grit-swooper-run-manifest-generator-boundary`. Behavior tests verify generated
content.

## Verification Gates

- Fixture manifest generator behavior tests.
- Focused Swooper generation checks.
- SA-08 `grit-swooper-run-manifest-generator-boundary`.
- No declared verification gate is skipped; packet closure records evidence in
  `workstream/verification-evidence.md`.
- `bun run openspec -- validate swooper-run-manifest-generator --strict`.
