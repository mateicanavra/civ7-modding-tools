# Phase Record

## Phase

- Project: Swooper recovery
- Phase: terrain-edge diagnostics
- Owner: Product/Development DRA
- Branch/Graphite stack: `codex/swooper-terrain-edge-mask-context-drain`
- Started: 2026-06-06
- Status: active. Terrain edge and local projection/mask context exist for the
  two coast/ocean rows, but live water/area readback and source authority
  remain unresolved and no repair is authorized.

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
- Branch: `codex/swooper-terrain-edge-mask-context-drain`.
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
- Source-recorded local mask/projection artifact:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-terrain-edge-local-mask-context.json`.
- Local mask/projection artifact sha256:
  `3b6822d02ddd9844e872dfafa1879860ecfd12d6558df43cfe75a1aed726aec2`.

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
- Local mask/projection evidence:
  - Both rows have morphology `shelfMask:0`, `coastalWater:0`,
    `coastalLand:0`, and `distanceToCoast:18`. They are not locally justified
    by morphology shelf/coastline intent alone.
  - Both rows have Hydrology lake intent `lakeMask:0` and map-hydrology
    `plannedLakeMask:0`.
  - `(73,36)` remains local `TERRAIN_OCEAN` through map-hydrology and
    placement terrain snapshots; local engine water is `1`, lake is `0`.
  - `(65,39)` remains local `TERRAIN_COAST` through map-hydrology and
    placement terrain snapshots; local engine water is `1`, lake is `1`,
    despite `plannedLakeMask:0` at the row.
  - Accepted lake count is `137`; final lake water/classification drift counts
    are both `0`. This proves the local projection evidence is internally
    consistent at the placement boundary, not that it matches live Civ.

## Evidence Boundary

- This layer proves only row-level terrain context and local projection/mask
  context for the exact-authored proof.
- It does not prove the repo should change coast/shelf policy.
- It does not prove Civ engine terrain validation is accepted policy.
- It does not close final-surface parity, product acceptance, Earthlike quality,
  river metadata parity, feature/resource legality, or mountain-region quality.

## Next Evidence

- Link live water/lake/area or equivalent runtime flags for `(73,36)` and
  `(65,39)`.
- If live water/area readback does not resolve ownership, add a more granular
  projection-boundary snapshot immediately around `validateAndFixTerrain`.
- Then classify each row before any repair.

## Verification

- `bun test mods/mod-swooper-maps/test/diagnostics/surface-delta-context.test.ts`:
  passed.
- `bun test mods/mod-swooper-maps/test/diagnostics/live-parity.test.ts`:
  passed.
- `bun run --cwd mods/mod-swooper-maps check`: passed.
- `bun scripts/civ7-direct-control/verify-final-surface-parity.ts --help`:
  passed.
- `bun run openspec -- validate earthlike-terrain-edge-diagnostics --strict`:
  passed.
- `bun run openspec -- validate civ7-map-policy-final-surface-parity --strict`:
  passed.
- `bun run openspec:validate`: passed.
- `git diff --check`: passed.
