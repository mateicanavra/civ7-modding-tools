# Phase Record

## Phase

- Project: Swooper recovery
- Phase: terrain-edge diagnostics
- Owner: Product/Development DRA
- Branch/Graphite stack: `codex/swooper-terrain-edge-delta-context-drain`
- Started: 2026-06-06
- Status: active. Terrain edge context exists for the two coast/ocean rows, but
  source authority remains unresolved and no repair is authorized.

## Objective

- Target movement: classify the `2/6996` terrain deltas from the exact-authored
  final-surface proof without pulling them into feature/resource repair.
- Non-goals: no tuning, no generated output edits, no parity/product closure.
- Done condition: each terrain row is either assigned to a concrete repair
  owner with evidence or owner-classified as accepted engine/readback residual.

## Authority

- Root/subtree `AGENTS.md`: Graphite, generated-output, and diagnostic hygiene.
- `openspec/changes/civ7-map-policy-final-surface-parity/**`: parity remains
  open until all deltas match or are owner-classified.
- `openspec/changes/studio-live-civ7-map-sync/workstream/parity-verification-and-runtime-proof.md`:
  terrain rows route to terrain-policy diagnostics.
- `openspec/changes/morphology-terrain-authorship-control/**`: coast/ocean
  terrain is projection/readback terrain policy, not feature/resource repair.

## Current State

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-codex-swooper-mapgen-recovery-drain`.
- Branch: `codex/swooper-terrain-edge-delta-context-drain`.
- Source proof:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc.json`.
- Source proof hash:
  `4973f47b8dd83e9710088d33485b2a985fcdf4dee71b140f2aa23b4bc55ac1dc`.
- Exact request: `studio-run-in-game-mq20rbzr-1fhc`.
- Seed/dimensions: `138503614`, `106x66`, `6996` plots.
- Runtime identity: stable full-grid readback with omitted plots `0`, turn `1`,
  and game hash `0`.

## Implementation

- Added `buildTerrainDeltaEdgeContexts` to
  `mods/mod-swooper-maps/src/dev/diagnostics/surface-delta-context.ts`.
- Added focused test coverage for coast/ocean edge swap neighborhood context.
- Source-recorded terrain context artifact:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-terrain-edge-context.json`.
- Artifact sha256:
  `7c17cb5ecde54909ba7d0e58647403e19b3341739ab297568c2de654270b647f`.

## Findings

- The terrain rows are exactly two water-edge swaps:
  - `(73,36)`: local `TERRAIN_OCEAN`, live `TERRAIN_COAST`;
    neighborhood local/live counts both `coast:4`, `ocean:2`, `land:0`.
  - `(65,39)`: local `TERRAIN_COAST`, live `TERRAIN_OCEAN`;
    neighborhood local/live counts both `coast:2`, `ocean:3`, `land:1`.
- Both rows remain `sourceAuthorityStatus:"unresolved"`.
- Candidate owners remain:
  `map-morphology-coast-shelf-projection`, `map-hydrology-water-mutation`,
  `civ-engine-terrain-validation`, and `evidence-insufficient`.

## Evidence Boundary

- This layer proves only row-level terrain context for the exact-authored proof.
- It does not prove the repo should change coast/shelf policy.
- It does not prove Civ engine terrain validation is accepted policy.
- It does not close final-surface parity, product acceptance, Earthlike quality,
  river metadata parity, feature/resource legality, or mountain-region quality.

## Next Evidence

- Link local shelf/coast/lake/water-protection masks at `(73,36)` and
  `(65,39)`.
- Link projection-boundary engine terrain snapshots before and after
  `validateAndFixTerrain`.
- Link live water/lake/area or equivalent runtime flags for the same rows.
- Then classify each row before any repair.

## Verification

- `bun test mods/mod-swooper-maps/test/diagnostics/surface-delta-context.test.ts`:
  passed, 9 tests.
- `bun run --cwd mods/mod-swooper-maps check`: passed.
- `bun run openspec -- validate earthlike-terrain-edge-diagnostics --strict`:
  passed.
- `bun run openspec -- validate civ7-map-policy-final-surface-parity --strict`:
  passed.
- `bun run openspec:validate`: passed, 77/77.
- `git diff --check`: passed.
