# Phase Record

## Phase

- Project: Swooper recovery
- Phase: terrain-edge diagnostics
- Owner: Product/Development DRA
- Branch/Graphite stack: `codex/swooper-coast-materialization-edge-drain`
- Started: 2026-06-06
- Status: active. Terrain edge, local projection/mask context,
  exact-runtime-bound live terrain/hydrology/area readback, local placement
  validation-boundary readback, row-level source-authority classification, and
  a bounded mock lake readback repair, and post-repair coast materialization
  boundary context exist for the two coast/ocean rows. Final-surface parity
  remains unresolved.

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
- Branch: `codex/swooper-coast-materialization-edge-drain`.
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
- Source-recorded post-mock-materialization-repair final-surface parity artifact:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-after-mock-materialization-repair.json`.
- Source-recorded post-repair parity artifact sha256:
  `b91ad36796d627a2d9b7381e3a20dcd5b0b604ba623d81e38235cb1061e950f3`.
- Source-recorded post-repair parity proof hash:
  `194dc8d2a22469dfc3612d6038cf1dae26574f35a56b3f6ab67062b55b18a289`.
- Source-recorded post-repair terrain-edge context artifact:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-after-mock-materialization-repair-terrain-edge-context.json`.
- Source-recorded post-repair terrain-edge context artifact sha256:
  `cc28a662c6270feb053a227fd221c15cd00504e3cf54c67ab1bc21e4611e6aa6`.
- Source-recorded post-repair coast materialization parity artifact:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-after-coast-materialization-context.json`.
- Source-recorded post-repair coast materialization parity artifact sha256:
  `a14455a238ac6e0296f116827c2d842ea2621561be38862696fceb3084a2bb11`.
- Source-recorded post-repair coast materialization parity proof hash:
  `8dfb35f12c493895c21057543dbe7bff0f365b5437b43f0bb0b186d3fda864dc`.
- Source-recorded post-repair coast materialization context artifact:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-coast-materialization-context.json`.
- Source-recorded post-repair coast materialization context artifact sha256:
  `59378d7c5d90593958e14ecf66f966107499499ef0eb4f616978226e3e3b0b93`.
- Source-recorded post-repair coast materialization context proof hash:
  `c58aee8b820ac50355705bb500e48863b389776b219acd86ee1c390d2cd76b5e`.

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
- Pre-repair local mask/projection evidence:
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
  - Before the mock lake repair, the second row was the strongest lake-readback
    signal: local projection carried `engineLakeMask:1` and `TERRAIN_COAST`,
    while live Civ readback reported `lake:false` and `TERRAIN_OCEAN`. The
    later mock lake repair removed the lake-readback sub-gap; the remaining
    current gap is terrain materialization.
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

## Mock Lake Readback Repair

- Repair implemented in `packages/civ7-adapter/src/mock-adapter.ts`:
  - Added explicit mock lake state separate from terrain type.
  - `MockAdapter.isLake()` now reads that state instead of treating every
    `TERRAIN_COAST` tile as lake-classified water.
  - `stampLakes()` is the path that marks planned lake tiles as mock lakes.
  - Ordinary coast expansion still produces water terrain, but not lake
    readback.
- Focused test coverage in
  `packages/civ7-adapter/test/mock-terrain-policy.test.ts` proves ordinary
  expanded coast is water/non-lake and stamped lake terrain is water/lake.
- Source-recorded post-repair parity artifact:
  - Input exact proof wrapper:
    `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-exact-proof-wrapper.json`.
  - Source command:
    `bun run verify:final-surface-parity -- --proof-file /tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-exact-proof-wrapper.json --output /tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-after-mock-materialization-repair.json`.
  - Source result: exited `2` with `parityStatus:"unresolved"`, proof hash
    `194dc8d2a22469dfc3612d6038cf1dae26574f35a56b3f6ab67062b55b18a289`.
  - Runtime identity remained exact-bound and stable: seed `138503614`,
    dimensions `106x66`, turn `1`, game hash `0`, omitted live plots `0`.
  - Terrain remains `2/6996` mismatched at `(73,36)` and `(65,39)`.
  - T2 post-repair terrain context now has local `engineLakeMask:0` and
    validation `lakeMask:0`; the lake-readback sub-gap is repaired.
  - T2 still has local `TERRAIN_COAST` versus live `TERRAIN_OCEAN`; the
    remaining owner is terrain materialization parity, not lake readback.
  - Feature remains `5/6996` mismatched and resource remains `61/6996`
    mismatched; those stay in their own feature/resource legality lanes.
  - Unresolved links remain
    `resource-placement-coordinate-proof.log`, `surface.feature.mismatch`,
    `surface.resource.mismatch`, and `surface.terrain.mismatch`.
  - Current drain rerun attempt did not reach parity evaluation because the old
    exact proof wrapper contains stale config key
    `/config/ecology-features/floodplainPlanning`.

## Coast Materialization Boundary Context

- Added a structured `map-morphology` coast classification artifact and
  engine terrain snapshots after `plot-coasts` and after `plot-continents`.
  These are diagnostic proof surfaces only; they do not tune coast policy.
- Exact-authored post-context parity rerun:
  - Command:
    `bun run verify:final-surface-parity -- --proof-file /tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-exact-proof-wrapper.json --output /tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-after-coast-materialization-context.json`.
  - Result: exited `2` with `parityStatus:"unresolved"`, proof hash
    `8dfb35f12c493895c21057543dbe7bff0f365b5437b43f0bb0b186d3fda864dc`.
  - Unresolved links remain
    `resource-placement-coordinate-proof.log`, `surface.feature.mismatch`,
    `surface.resource.mismatch`, and `surface.terrain.mismatch`.
- Focused context artifact:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-coast-materialization-context.json`,
  sha256
  `59378d7c5d90593958e14ecf66f966107499499ef0eb4f616978226e3e3b0b93`,
  proof hash
  `c58aee8b820ac50355705bb500e48863b389776b219acd86ee1c390d2cd76b5e`.
- T1 `(73,36)`:
  - Coast policy classifies the row as ocean: `baseWaterClass:2`,
    `waterClass:2`, `policyCoastMask:0`.
  - Local engine terrain remains `TERRAIN_OCEAN` after `plot-coasts`,
    after `plot-continents`, after map-hydrology, after map-rivers, after
    placement, and through placement validation/maintenance.
  - Live exact readback remains `TERRAIN_COAST`.
  - Classification: local mock/materialization under-models this live Civ
    coast result, but this still does not authorize coast/shelf tuning because
    authored morphology coast/shelf masks are absent at the row.
- T2 `(65,39)`:
  - Coast policy classifies the row as ocean: `baseWaterClass:2`,
    `waterClass:2`, `policyCoastMask:0`.
  - Local engine terrain is `TERRAIN_OCEAN` immediately after `plot-coasts`,
    then becomes `TERRAIN_COAST` after `plot-continents` validation and remains
    coast through downstream snapshots.
  - Live exact readback remains `TERRAIN_OCEAN`.
  - Classification: the remaining T2 terrain gap is a local
    `validateAndFixTerrain`/mock terrain materialization parity gap, not a
    Hydrology lake gap and not a MapGen coast policy row.
- Repair authority from this layer is limited to a future bounded mock/local
  terrain materialization parity slice. This layer does not start that repair.

## Evidence Boundary

- This layer proves only row-level terrain context and local projection/mask
  context plus the focused mock lake readback repair for the exact-authored
  proof.
- It does not prove the repo should change coast/shelf policy.
- It does not prove Civ engine terrain validation is accepted policy.
- It does not close final-surface parity, product acceptance, Earthlike quality,
  river metadata parity, feature/resource legality, or mountain-region quality.

## Next Evidence

- Continue terrain work in a separate terrain materialization slice. The lake
  readback sub-gap is repaired, and the remaining coast/ocean materialization
  boundary is classified, but a terrain materialization repair has not started.
- Any further repair must rerun focused tests and the exact-authored
  final-surface parity proof before parity, product acceptance, Earthlike
  quality, or terrain parity closure can be claimed.
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
- Coast materialization context verification:
  - `bun test scripts/civ7-direct-control/verify-terrain-edge-live-context.test.ts`:
    passed.
  - `bun test mods/mod-swooper-maps/test/diagnostics/surface-delta-context.test.ts mods/mod-swooper-maps/test/diagnostics/live-parity.test.ts`:
    passed.
  - `bun test mods/mod-swooper-maps/test/standard-run.test.ts`: passed.
  - `bun run --cwd mods/mod-swooper-maps check`: passed.
  - `bun run verify:final-surface-parity -- --proof-file /tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-exact-proof-wrapper.json --output /tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-after-coast-materialization-context.json`:
    source-recorded result exited `2` with exact-bound unresolved proof hash
    `8dfb35f12c493895c21057543dbe7bff0f365b5437b43f0bb0b186d3fda864dc`.
  - Current drain proof-file rerun is blocked before parity evaluation by stale
    exact proof config key `/config/ecology-features/floodplainPlanning`.
  - Source-recorded `bun -e <regenerate coast materialization terrain context>`
    wrote `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-coast-materialization-context.json`.
  - `git diff --check && git diff --cached --check`: passed.
- Records-only source-authority classification verification:
  - `bun run openspec -- validate earthlike-terrain-edge-diagnostics --strict`:
    passed.
  - `bun run openspec -- validate civ7-map-policy-final-surface-parity --strict`:
    passed.
  - `bun run openspec:validate`: passed.
  - `git diff --check`: passed.
- Mock materialization repair verification:
  - `bun test packages/civ7-adapter/test/mock-terrain-policy.test.ts`: passed.
  - `bun run --cwd packages/civ7-adapter check`: passed.
  - `bun run --cwd packages/civ7-adapter build`: passed.
  - `bun run verify:final-surface-parity -- --proof-file /tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-exact-proof-wrapper.json --output /tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-after-mock-materialization-repair.json`:
    failed before parity evaluation with stale proof config key
    `/config/ecology-features/floodplainPlanning`.
  - `bun test mods/mod-swooper-maps/test/diagnostics/surface-delta-context.test.ts mods/mod-swooper-maps/test/diagnostics/live-parity.test.ts`:
    passed.
  - `bun run --cwd mods/mod-swooper-maps check`: passed.
  - `bun run openspec -- validate earthlike-terrain-edge-diagnostics --strict`:
    passed.
  - `bun run openspec -- validate civ7-map-policy-final-surface-parity --strict`:
    passed.
  - `bun run openspec:validate`: passed.
  - `git diff --check`: passed.
