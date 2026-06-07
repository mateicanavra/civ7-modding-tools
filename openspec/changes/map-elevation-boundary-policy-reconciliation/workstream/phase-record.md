# Phase Record: Map-Elevation Boundary Policy Reconciliation

## Status

Implemented on `codex/swooper-map-elevation-drift-policy-drain`; current
runtime rerun is still pending.

## Evidence

- `rg` found `applyCiv7BuildElevationBoundaryPolicy` only in
  `@civ7/map-policy` export/test files.
- The previous recovered record said the active `map-elevation/buildElevation`
  step used the lifecycle-aware water-drift policy, but the current drain found
  it still called the strict no-drift assert. Request
  `studio-run-in-game-mq3n8vkc-1qjg` then failed with one expected-land /
  adapter-water mismatch at `(34,17)` after the generated map script loaded.
- The current slice wires `map-elevation/buildElevation` to
  `assertWaterDriftWithinPolicy`, preserving a hard failure above the drift
  budget while allowing bounded drift to emit `WATER_DRIFT_POLICY_V1`
  telemetry instead of aborting generation.
- Focused local proof: `bun test
  mods/mod-swooper-maps/test/map-elevation/build-elevation-no-water-drift.test.ts`
  and `bun run --cwd mods/mod-swooper-maps check`.

## Decision

Remove the unused helper. The active policy boundary is the lifecycle-aware
water-drift policy in the recipe projection layer, not a static preprojection
helper with no caller. Local tests prove the boundary behavior; in-game proof
requires a fresh Studio/Civ rerun.
