# Swooper Map Artifact File Plan

## Why

The current artifact generator mixes discovery, rendering, file writing,
catalog outputs, request-specific entries, and shared mod/dist writes. A
manifest-only request generator cannot be added cleanly until rendering is
separated from writing.

This packet extracts a pure Swooper map artifact render/file-plan boundary.

## System Context

Affected owners:

- `mods/mod-swooper-maps/scripts/generate-map-artifacts.ts`
- Swooper Maps artifact rendering helpers
- tests around generated map artifacts

This packet does not change catalog generation input or Run in Game integration.

## Before And After

Before:

- render decisions are coupled to write locations and generation mode;
- catalog and request generation cannot share a deterministic file-plan API.

After:

- a pure `SwooperMapArtifactFilePlan` describes modinfo/config/text/data files,
  map rows, runtime script, marker-bearing runtime output, and target paths;
- writer code consumes the file plan;
- catalog generation and future Run in Game generation can use the same render
  boundary.

## Behavior Verification

Behavior tests compare rendered file plans and generated content for known
fixture inputs. They verify semantic equivalence, not topology policing.

## Structural Enforcement

Permanent positive assertions:

- Swooper artifact rendering has a pure file-plan owner;
- file writing is performed by explicit writer ports;
- generation targets consume file plans rather than embedding write decisions in
  source discovery.

Structural authority row: SA-06 `grit-swooper-map-render-file-plan-boundary`.
Behavior tests cover rendered content equivalence.

## Verification Gates

- Fixture behavior tests for file-plan rendering.
- Existing Swooper artifact generation checks.
- SA-06 `grit-swooper-map-render-file-plan-boundary`.
- No declared verification gate is skipped; packet closure records evidence in
  `workstream/verification-evidence.md`.
- `bun run openspec -- validate swooper-map-artifact-file-plan --strict`.
