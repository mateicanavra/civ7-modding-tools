# Phase Record

## Phase

- Project: Swooper recovery
- Phase: visible river acceptance repair planning
- Owner: Product/Development DRA
- Branch/Graphite stack: `codex/mapgen-physical-rivers`
- Started: 2026-06-06
- Status: active; projection/materialization and adapter readback repair
  implemented; discovered no-argument minor-river writer hook rejected by
  disposable proof

## Objective

- Target movement: repair visible river/floodplain product failure only from
  exact, classified evidence.
- Non-goals: no screenshot-only tuning, no placement-owned floodplain truth.
- Done condition: failing row is repaired and product acceptance rerun passes or
  is reclassified with evidence.

## Current State

- Activation source: `swooper-stack-recovery-consolidation` recorded the
  product-visible hydrology failure before this repair slice. Its tasks item 3.3
  records the reported missing visible rivers failure; its branch recovery ledger
  says Studio runs were reported as having effectively no visible rivers while
  local hydrology/projection tests could still pass; and its spec requires
  little/no visible river-network runs to become a focused river recovery slice
  instead of a local-test parity claim.
- Activation evidence: hydrology publishes minor/major `riverClass`; map-rivers
  intentionally no longer delegates to `TerrainBuilder.modelRivers`; current
  projection can stamp major-river trunks as `TERRAIN_NAVIGABLE_RIVER`, while
  minor rivers remain separate planned intent because Civ represents them as
  river metadata and no stable tile-authoring API for `RIVER_MINOR` has been
  found.
- Live-control evidence on 2026-06-09: App UI exposes `GameplayMap.getRiverType`,
  `isRiver`, and `isNavigableRiver`; Tuner exposes `TerrainBuilder.modelRivers`,
  `defineNamedRivers`, and `setRiverValidationValues`. Current readback sample
  had 70 `TERRAIN_NAVIGABLE_RIVER` tiles and 0 Civ `isRiver`/`isNavigableRiver`
  tiles, proving terrain-row visibility and river metadata are separate. Mock
  river-type sentinels now consume policy-owned values from `@civ7/map-policy`,
  which match live Civ semantics: `NO_RIVER=-1`, `RIVER_MINOR=0`,
  `RIVER_NAVIGABLE=1`. The reviewed river metadata source lives in
  `packages/civ7-map-policy/src/river-type-metadata.source.ts`; the Civ7 table
  generator consumes that source for the map-policy generated table, the Studio
  browser catalog copy, and `@civ7/types/generated/river-types.gen.d.ts`, with
  map-policy tests guarding parity across all three generated surfaces.
- Direct-control map-query contract: `@civ7/direct-control` `hydrology` plot
  facts now expose `riverType`, `river`, and `navigableRiver` from Civ runtime
  readback, so CLI/Studio parity can compare metadata without relying on raw
  terrain rows.
- Official resource evidence refreshed on 2026-06-09 to resource snapshot
  `fbc38ef` (`Update snapshot 2026-06-03T01:59:59Z`). The current official
  scripts still author rivers through `TerrainBuilder.modelRivers(...)` followed
  by `TerrainBuilder.defineNamedRivers()` and `TerrainBuilder.storeWaterData()`.
  WorldBuilder schema exposes `PlotRivers`, `RiverInstance`, and `RiverPlot`,
  but the searchable official JS/XML resources and local Civ app resources do
  not contain a `TerrainBuilder.setRiverValidationValues` callsite or public
  per-tile minor-river writer. Durable resource search evidence is recorded in
  `workstream/resource-evidence.md`.
- Semantic git-history evidence: `workstream/history-evidence.md` records the
  exact `git log -S` / `git log --grep` commands and representative commits
  showing the river pipeline moved from engine river modeling/cache refresh work
  (`418c9cddb` / `9583caeb6`, "map-hydrology: stamp navigable rivers from
  hydrography"; `73d7435ce`, "refresh area and water caches after river
  modeling") through projection-authoring normalization (`64a32130e`) and lake
  truth normalization (`98fb96747` / `1914cb44d`, "project lake plans through
  adapter"). This branch sits on that lineage by keeping Hydrology as truth,
  Map projection as materialization, and Civ runtime readback as evidence.
- Projection contract: `map-rivers` now publishes planned minor and planned
  major masks and only allows `riverClass>=2` major-river tiles to become
  projected navigable terrain. A high-discharge `riverClass=1` minor fixture
  remains unstamped by design.
- Adapter readback contract: navigable-river accepted/rejected/extra/mismatch
  accounting is based on raw `TERRAIN_NAVIGABLE_RIVER` terrain rows, the only
  proven authorable surface. Civ `isRiver`, `isNavigableRiver`, and
  `getRiverType` remain separate metadata/API readback proof classes so the
  live-observed terrain-exact/metadata-zero case is not reported as terrain
  rejection.
- Parity verifier contract: `verify-final-surface-parity` now requests
  `hydrology` grid facts and emits `riverMetadataParity` with projected-vs-live
  terrain-row, projected-vs-live metadata, and terrain-row-vs-metadata deltas.
  It also emits `lakeReadbackParity` from placement-surface final lake readback
  counters. Current exact-authorship logs lack those counters and are reported
  as `missing-exact-log` without blocking; future exact/local lake counter
  divergence blocks with `lake-readback.mismatch`.
- Studio display contract: `test/pipeline/viz-emissions.test.ts` now guards the
  separated river layers used by Studio and the parity proof:
  `projectedRiverMask`, `plannedMinorRiverMask`, `plannedMajorRiverMask`,
  `engineRiverMask` for raw terrain readback,
  `engineNavigableRiverMetadataMask` for debug metadata/API readback,
  `riverMismatchMask` for terrain mismatch, and `engineMinorRiverMask` for
  debug minor metadata readback, with physics/engine/debug metadata roles.
- Same-run Studio/Civ proof on 2026-06-09:
  `studio-run-in-game-mq6c38rf-n2p` completed exact authorship after
  restart-backed shell recovery. The final-surface proof artifact
  `/tmp/civ7-river-parity/studio-run-in-game-mq6c38rf-n2p-final-surface.json`
  has proof hash
  `72a521da3e6bc410a44da551f7fc20304a4eec7ea3114b4b55d91d468f283293`. It
  reported projected navigable river terrain `6`, live
  `TERRAIN_NAVIGABLE_RIVER` terrain `6`, and
  `projectedVsLiveTerrainMismatchCount=0`. Civ river metadata readback still
  reported zero `river`, `navigableRiver`, and `minorRiver` tiles, so the proof
  model classifies the river surface as `terrain-match-metadata-divergent`.
- Bounded runtime proof envelope for the same-run river/lake subclaims:
  artifact created `2026-06-09T07:46:31.353Z`; exact-authorship packet status
  `complete`, request id `studio-run-in-game-mq6c38rf-n2p`, created
  `2026-06-09T07:45:51.395Z`, source identity hash
  `625d2ef333fd9e4f4271b0b07c9796f095cb4a084944816a67a005142c3d1b4c`,
  recipe `mod-swooper-maps/standard`, preset `swooper-earthlike`, seed
  `24681357`, map size `MAPSIZE_STANDARD`, player count `6`. The whole proof
  status remains `unresolved` because non-river links remain:
  `natural-wonder-plan-coordinate-proof.planned`,
  `resource-placement-coordinate-proof.placed`, `surface.biome.mismatch`,
  `surface.feature.mismatch`, `surface.resource.mismatch`, and
  `surface.terrain.mismatch`. The bounded accepted subclaims are river terrain
  parity (`projectedNavigableTerrain=6`, `liveTerrainNavigableRiver=6`,
  `projectedVsLiveTerrainMismatchCount=0`) and final accepted-lake placement
  readback (`acceptedLakeTileCount=63`, `finalLakeWaterDriftCount=0`,
  `finalLakeClassificationDriftCount=0`). The saved proof artifact predates
  the top-level `lakeReadbackParity` report; reruns now expose those counters as
  a named proof surface.
- Floodplain product row reclassification on 2026-06-09:
  the same-run proof contains no floodplain-family feature ids on either local
  or live full-grid feature surfaces (`localFloodplainFamily=0`,
  `liveFloodplainFamily=0`). The current exact authored map therefore does not
  carry an active floodplain stamping failure. Floodplain capability remains
  covered by focused ecology op/apply tests, including
  `test/ecology/floodplain-feature-product-row.test.ts`, which materializes a
  lowland high-discharge floodplain-family fixture through feature apply and
  suppresses the same valley when discharge is below threshold. The remaining
  `surface.feature.mismatch` residual belongs to non-river ecology/feature
  placement drift.
- Minor-river writer proof path: `scripts/civ7-direct-control/probe-river-writer.ts`
  inventories the native runtime candidate and can compare full-grid river
  metadata before/after a call. It is dry-run by default; the mutating call
  requires `--confirm-disposable-session` and must only be run against a
  disposable session.
- Minor-river writer proof on 2026-06-09:
  `bun scripts/civ7-direct-control/probe-river-writer.ts --confirm-disposable-session --read-full-grid --timeout-ms 120000 --max-plots-per-read 512 --output /tmp/civ7-river-writer/mutation-mq6c38rf.json`
  ran against the disposable `studio-run-in-game-mq6c38rf-n2p` session. The
  native `TerrainBuilder.setRiverValidationValues()` call returned
  `undefined`, but readback counts were unchanged before/after:
  `terrainNavigableRiver=6`, `river=0`, `navigableRiver=0`, `minorRiver=0`,
  `noRiver=4536`. This rejects the discovered no-argument hook as a stable
  production minor-river authoring surface.
- Owner classification updated 2026-06-10: projection/materialization plus
  adapter readback for navigable/major rivers; no stable per-tile minor-river
  writer is proven; bulk native minor-river metadata materialization is
  supported through `TerrainBuilder.modelRivers(...)` but still parity-gated
  against Hydrology truth.
- Testing design: hard drainage invariants first, then lake/river coupling
  fixtures, then knob metamorphic checks, then same-run Studio/Civ parity. The
  physical benchmark suite now covers water-supply/topology decoupling and
  lakeiness/topology decoupling in addition to river-density threshold behavior.
- Knob design refinement on 2026-06-09: `map-rivers` now owns
  `navigableRiverDensity` for Civ-visible navigable trunk projection. This
  deliberately decouples Hydrology's physical `riverDensity` threshold knob from
  post-elevation terrain materialization density. `riverDensity` remains
  accepted on `map-rivers` only as a legacy alias, and focused compile tests
  prove the two knobs can vary independently.
- Completion audit: `workstream/completion-audit.md` records the current
  requirement-by-requirement evidence, including non-claims for per-tile Civ
  minor-river metadata stamping from Hydrology truth and deterministic
  full-surface parity.
- Protected paths: generated outputs, official resources, unrelated worktrees.
- Next action: classify native bulk river objects against Hydrology truth in
  the product-acceptance workstream, continue the non-river final-surface parity
  drift investigation separately, and keep per-tile minor-river authoring
  unclaimed unless a dedicated writer surface is discovered and proven.
- Stop condition: a proposed fix claims Hydrology-authored minor rivers are
  stamped without same-run adapter readback proving either a dedicated per-tile
  write capability or a bulk-native parity pass.
