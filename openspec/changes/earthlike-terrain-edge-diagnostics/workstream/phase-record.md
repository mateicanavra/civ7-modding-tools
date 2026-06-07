# Phase Record

## Phase

- Project: Swooper recovery
- Phase: terrain-edge diagnostics
- Owner: Product/Development DRA
- Branch/Graphite stack: `codex/swooper-terrain-source-owner-drain`
- Started: 2026-06-06
- Status: active. Terrain edge, local projection/mask context,
  exact-runtime-bound live terrain/hydrology/area readback, local placement
  validation-boundary readback, and row-level source-authority classification
  exist for the two coast/ocean rows. Repair is not started in this layer.

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
- Branch: `codex/swooper-terrain-source-owner-drain`.
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
- Source-recorded live readback artifact:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-terrain-edge-live-readback-context.json`.
- Live readback artifact sha256:
  `213134d7020063f53073c2f6f254ae8fc0d153007b0b6e0848c2da4a642262f6`.
- Live readback proof hash:
  `aa817119c628d1ecc144c5dd7ed4d3227f6fe3301af1ffab501e26751868c2a8`.
- Source-recorded local validation-boundary artifact:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-terrain-edge-validation-boundary-context.json`.
- Local validation-boundary artifact sha256:
  `033609d9293faf4b86a1da5862247a4c41762e7917069be3f2af7c8e7f55f263`.
- Local validation-boundary proof hash:
  `e906acdcacb002572586379b98cd00d0eb99529c9b86e2384fc6b8e03703da4e`.

## Findings

- The terrain rows are exactly two water-edge swaps:
  - `(73,36)`: local `TERRAIN_OCEAN`, live `TERRAIN_COAST`;
    neighborhood local/live counts both `coast:4`, `ocean:2`, `land:0`.
  - `(65,39)`: local `TERRAIN_COAST`, live `TERRAIN_OCEAN`;
    neighborhood local/live counts both `coast:2`, `ocean:3`, `land:1`.
- Both rows are classified to the repo-owned local mock/materialization parity
  boundary, not to MapGen coast/shelf tuning.
- Candidate owners rejected for this row pair:
  `map-morphology-coast-shelf-projection` as direct row intent,
  `map-hydrology-water-mutation` as authored lake intent, and
  `evidence-insufficient`.
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
- Exact-runtime-bound live readback evidence:
  - Verifier command:
    `bun run verify:terrain-edge-live-context -- --proof-file /tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc.json --context-file /tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-terrain-edge-local-mask-context.json --output /tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-terrain-edge-live-readback-context.json`.
  - Request identity matched across exact summary, exact packet, source
    snapshot, and log: `studio-run-in-game-mq20rbzr-1fhc`.
  - Runtime identity matched saved proof and current readback: `106x66`,
    `6996` plots, seed `138503614`, turn `1`, game hash `0`.
  - Required row facts were present and `ok:true` for both rows: `terrain`,
    `water`, `lake`, `riverType`, `areaId`, `regionId`, and `landmassId`.
  - `(73,36)` live readback is `TERRAIN_COAST`, `water:true`,
    `lake:false`, `riverType:-1`, `areaId:720906`, `regionId:-1`,
    `landmassId:65536`.
  - `(65,39)` live readback is `TERRAIN_OCEAN`, `water:true`,
    `lake:false`, `riverType:-1`, `areaId:720906`, `regionId:-1`,
    `landmassId:65536`.
  - The second row is the strongest remaining signal: local projection carries
    `engineLakeMask:1` and `TERRAIN_COAST`, while live Civ readback reports
    `lake:false` and `TERRAIN_OCEAN`. That narrows the next classification
    question but does not prove the repair owner.
- Local placement validation-boundary evidence:
  - New diagnostic artifact records `terrain`, `waterMask`, `lakeMask`, and
    `areaId` before `placement.terrain.validate`, after
    `validateAndFixTerrain`, and after area/water-cache maintenance.
  - `(73,36)` remains `TERRAIN_OCEAN`, `waterMask:1`, `lakeMask:0`,
    `areaId:1` across `beforeValidate`, `afterValidate`, and
    `afterMaintenance`.
  - `(65,39)` remains `TERRAIN_COAST`, `waterMask:1`, `lakeMask:1`,
    `areaId:1` across `beforeValidate`, `afterValidate`, and
    `afterMaintenance`.
  - This narrows the owner: the local placement validation/maintenance step is
    not rewriting either row. The classified boundary is local
    mock/materialization expectation versus live Civ terrain/lake
    materialization, not late local placement mutation.

## Source Authority Classification

- Classification status: row-level source authority is classified for the two
  terrain deltas. The repair owner is the repo-owned local mock/materialization
  parity boundary in `@civ7/adapter` and adjacent diagnostic projection code,
  not Earthlike terrain generation, coast/shelf tuning, feature/resource
  legality, or accepted Civ residual policy.
- Shared evidence chain:
  - The exact-authored live proof is request-bound to
    `studio-run-in-game-mq20rbzr-1fhc`, seed `138503614`, dimensions `106x66`,
    turn `1`, and game hash `0`.
  - Live readback succeeded for `terrain`, `water`, `lake`, `riverType`,
    `areaId`, `regionId`, and `landmassId` for both rows.
  - Local morphology shelf/coast intent is absent for both rows:
    `shelfMask:0`, `coastalWater:0`, `coastalLand:0`, and
    `distanceToCoast:18`.
  - Local Hydrology lake intent is absent for both rows:
    `lakeMask:0` and `plannedLakeMask:0`.
  - Local placement validation and maintenance do not mutate either row.
  - The live adapter reads lake state from Civ `GameplayMap.isLake`, while the
    mock adapter currently treats any `TERRAIN_COAST` as lake evidence and uses
    a local coast-expansion materialization rule as its validation model.
- T1 `(73,36)` classification:
  - Local remains `TERRAIN_OCEAN`, `waterMask:1`, `lakeMask:0`, `areaId:1`
    before validation, after validation, and after maintenance.
  - Live exact readback is `TERRAIN_COAST`, `water:true`, `lake:false`,
    `riverType:-1`, `areaId:720906`, `regionId:-1`, `landmassId:65536`.
  - This assigns source authority to a local mock/materialization terrain
    parity gap. It does not authorize map-morphology coast/shelf repair because
    local authored masks do not request shelf/coast terrain at the row.
- T2 `(65,39)` classification:
  - Local remains `TERRAIN_COAST`, `waterMask:1`, `lakeMask:1`, `areaId:1`
    before validation, after validation, and after maintenance despite
    `plannedLakeMask:0`.
  - Live exact readback is `TERRAIN_OCEAN`, `water:true`, `lake:false`,
    `riverType:-1`, `areaId:720906`, `regionId:-1`, `landmassId:65536`.
  - This assigns source authority to a local mock/materialization lake and
    terrain parity gap. The lake sub-gap is specifically that mock lake
    readback is derived from `TERRAIN_COAST`, while live Civ reports the same
    exact row as non-lake water.
- Repair boundary:
  - A later repair layer may target the adapter/mock materialization parity
    model and its diagnostics after opening a bounded branch/task movement.
  - This classification does not authorize product tuning, generated output
    edits, broad coast/shelf changes, parity closure, or product acceptance.

## Evidence Boundary

- This layer proves only row-level terrain context and local projection/mask
  context for the exact-authored proof.
- It does not prove the repo should change coast/shelf policy.
- It does not prove Civ engine terrain validation is accepted policy.
- It does not close final-surface parity, product acceptance, Earthlike quality,
  river metadata parity, feature/resource legality, or mountain-region quality.

## Next Evidence

- Open a separate bounded repair layer before changing product or adapter code.
  The first candidate owner surface is adapter/mock materialization parity,
  including mock lake readback and coast/ocean materialization behavior.
- Any repair must rerun focused tests and the exact-authored final-surface
  parity proof before parity, product acceptance, Earthlike quality, or terrain
  parity closure can be claimed.
- Continue to keep feature/resource legality, start placement, mountain quality,
  and generated output outside this terrain-edge layer.

## Verification

- `bun test mods/mod-swooper-maps/test/diagnostics/surface-delta-context.test.ts`:
  passed.
- `bun test mods/mod-swooper-maps/test/diagnostics/live-parity.test.ts`:
  passed.
- `bun run --cwd mods/mod-swooper-maps check`: passed.
- `bun scripts/civ7-direct-control/verify-final-surface-parity.ts --help`:
  passed.
- `bun run verify:terrain-edge-live-context -- --help`: passed.
- `bun test scripts/civ7-direct-control/verify-terrain-edge-live-context.test.ts`:
  passed.
- `bun run --cwd packages/civ7-direct-control test -- direct-control`:
  passed.
- `bun run --cwd packages/civ7-direct-control check`: passed.
- `bun run openspec -- validate earthlike-terrain-edge-diagnostics --strict`:
  passed.
- `bun run openspec -- validate civ7-map-policy-final-surface-parity --strict`:
  passed.
- `bun run openspec:validate`: passed.
- `git diff --check`: passed.
- Records-only source-authority classification verification:
  - `bun run openspec -- validate earthlike-terrain-edge-diagnostics --strict`:
    passed.
  - `bun run openspec -- validate civ7-map-policy-final-surface-parity --strict`:
    passed.
  - `bun run openspec:validate`: passed.
  - `git diff --check`: passed.
