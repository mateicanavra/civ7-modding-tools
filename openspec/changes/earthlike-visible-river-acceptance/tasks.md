## 1. Activation

- [x] 1.1 Link the concrete failing river/floodplain proof row.
  - Activation source:
    `openspec/changes/swooper-stack-recovery-consolidation/tasks.md` item 3.3
    records the reported missing visible rivers failure, and
    `workstream/branch-recovery-ledger.md` records the concrete product gap:
    Studio runs had effectively no visible rivers even though local
    hydrology/projection tests could pass. The recovery spec also requires this
    to become a focused hydrology/river recovery slice rather than a local-test
    parity claim.
  - Repaired/reclassified proof rows are now in
    `openspec/changes/swooper-earthlike-product-acceptance-proof/workstream/acceptance-row-ledger.md`:
    visible major/navigable river terrain passed on the `mq6c38rf-n2p`
    same-run proof, and later 2026-06-10 disposable/source-integrated evidence
    reclassified Civ river metadata from "unsupported writer gap" to "bulk
    native materialization supported, exact parity still open." Floodplain live
    visibility passes on the separate `mq6dx234-1wx4` floodplain-producing
    proof.
- [x] 1.2 Classify the owner: hydrology truth, ecology/floodplain policy,
  projection/materialization, Studio visualization, or Civ policy.
  - Classification: projection/materialization + adapter readback for
    navigable/major rivers; adapter capability gap for per-tile minor-river
    stamping; bulk native minor-river metadata materialization is supported but
    must be parity-classified before product claims.

## 2. Repair

- [x] 2.1 Add a focused failing-row test or diagnostic.
- [x] 2.2 Repair the proven owner without moving truth to a forbidden owner.
  - Projection repair: navigable terrain eligibility now requires hydrology
    `riverClass>=2`; class `1` minor rivers remain planned minor intent and are
    not promoted to `TERRAIN_NAVIGABLE_RIVER`.
- [x] 2.3 Update any downstream ledgers affected by the owner classification.
- [x] 2.4 Add Studio/Civ same-run parity proof for projected navigable-river
  masks.
  - Same-run Studio proof `studio-run-in-game-mq6c38rf-n2p` completed exact
    authorship on 2026-06-09 after restart-backed shell recovery. The
    final-surface proof at
    `/tmp/civ7-river-parity/studio-run-in-game-mq6c38rf-n2p-final-surface.json`
    has proof hash
    `72a521da3e6bc410a44da551f7fc20304a4eec7ea3114b4b55d91d468f283293`.
  - The river proof class is terrain-exact: planned minor `212`, planned major
    `149`, projected navigable terrain `6`, live `TERRAIN_NAVIGABLE_RIVER`
    terrain `6`, and projected-vs-live terrain mismatches `0`.
  - Earlier direct-stamping proof reported `river=0`, `navigableRiver=0`, and
    `minorRiver=0`; the verifier recorded that as
    `terrain-match-metadata-divergent`, separate from terrain stamping.
  - Current source now calls the adapter-owned Civ bulk river modeler after
    authored terrain stamping. Live readback on the current branch recorded
    `terrainNavigableRiver=82`, `river=202`, `navigableRiver=68`, and
    `minorRiver=134` for one generated run. This reclassifies metadata support
    but does not close exact authored-topology parity or rendered visual proof.
- [x] 2.5 Discover or reject a stable Civ minor-river authoring capability.
  Candidate probe: isolate `TerrainBuilder.setRiverValidationValues` in a
  disposable runtime proof before any production use; separately characterize
  the official bulk `TerrainBuilder.modelRivers(...)` sequence.
  - Resource sync/audit refreshed to `.civ7/outputs/resources` `fbc38ef`
    (`Update snapshot 2026-06-03T01:59:59Z`). Official map scripts still use
    `TerrainBuilder.modelRivers(...)` plus `defineNamedRivers()`/`storeWaterData()`;
    no official `setRiverValidationValues` callsite or public per-tile
    minor-river writer was found.
  - Added `scripts/civ7-direct-control/probe-river-writer.ts` as a gated
    disposable-session probe. It is read-only by default and requires
    `--confirm-disposable-session` before calling the native candidate hook.
  - Disposable proof on `studio-run-in-game-mq6c38rf-n2p`:
    `TerrainBuilder.setRiverValidationValues()` exists and returned
    `undefined`, but full-grid readback was unchanged before/after the call:
    `terrainNavigableRiver=6`, `river=0`, `navigableRiver=0`,
    `minorRiver=0`, `noRiver=4536`. Probe artifact:
    `/tmp/civ7-river-writer/mutation-mq6c38rf.json`. Candidate rejected for
    production minor-river authoring until a different writer surface is
    discovered and proven.
  - Disposable proof
    `studio-run-in-game-live-proof-mq7bkgi3-1t7t` then proved the official bulk
    sequence can author river metadata: pre `river=0`, `navigableRiver=0`,
    `minorRiver=0`; post `river=251`, `navigableRiver=71`,
    `minorRiver=180`.
  - Current `map-rivers` source uses that bulk materialization sequence after
    authored navigable terrain stamping. Remaining proof must classify any
    native-added river objects against Hydrology truth instead of treating bulk
    metadata existence as minor-river product closure.
- [x] 2.6 Add lake/river coupled physical benchmark fixtures:
  tilted island plane, central ridge, closed bowl, saddle spill, tributary
  valleys, rain-shadow coast, arid interior plateau, low-gradient coastal
  plain, and lake chain.
  - `mods/mod-swooper-maps/test/hydrology-physical-benchmarks.test.ts` now
    covers tilted island coastal outlets, central-ridge basin divides,
    tributary confluence to ocean outlet, low-gradient coastal plain trunking,
    endorheic closed-basin lake growth, saddle/lake-chain admission,
    rain-shadow discharge asymmetry, arid plateau threshold suppression, and
    water-supply/topology decoupling.
  - The physical benchmark suite now uses a shared drainage invariant helper
    that walks every fixture land route to an outlet, sink, or planned lake and
    asserts discharge never decreases along land-to-land receivers.
  - `workstream/physical-grounding.md` maps the benchmark suite to
    authoritative hydrology expectations for watersheds, confluences,
    orographic rain shadows, and closed/terminal lake basins.
  - The suite also covers lakeiness/topology decoupling: fixed routing and sink
    masks can admit more lake tiles under a lake-oriented knob without moving
    drainage divides or river routing.
  - Same-run proof `studio-run-in-game-mq6c38rf-n2p` also records final accepted
    lake readback at the placement surface boundary:
    `acceptedLakeTileCount=63`, `finalLakeWaterDriftCount=0`, and
    `finalLakeClassificationDriftCount=0`.
  - Final-surface parity now elevates local final lake readback counters into a
    first-class `lakeReadbackParity` proof surface. Current exact-authorship
    logs do not carry those counters, so the report records `missing-exact-log`
    without blocking; future exact/local lake counter divergence blocks on
    `lake-readback.mismatch`.
- [x] 2.7 Decouple physical river-network density from Civ-visible navigable
  river terrain density.
  - `hydrology-hydrography.knobs.riverDensity` now remains the physical
    hydrography threshold knob.
  - `map-rivers.knobs.navigableRiverDensity` is the projection-owned knob for
    the Civ-visible navigable trunk subset after elevation is finalized.
  - `map-rivers.knobs.riverDensity` remains a legacy alias so older configs
    compile. The saved same-run river/floodplain proofs are bound to the
    existing Earthlike config hash, so the shipped Earthlike JSON keeps the
    alias until a fresh live proof is captured for the renamed key; docs and
    new examples use `navigableRiverDensity`.
  - Conflicting `map-rivers.knobs.riverDensity` and
    `map-rivers.knobs.navigableRiverDensity` values now fail recipe compilation
    instead of silently preferring one key; duplicate values are accepted for
    compatibility during config migration.
  - Shipped/catalog map config tests now keep the legacy
    `map-rivers.knobs.riverDensity` alias allowlisted to proof-bound
    `swooper-earthlike` and `mountain-patch`; other configs must use
    `navigableRiverDensity` or omit the projection-density knob.
  - The adopted `mountain-rivers-patch` comparison config uses explicit
    `map-rivers.knobs.navigableRiverDensity` while preserving the mountain
    patch physical hydrology package for Studio/Civ comparison.

## 3. Verification

- [x] 3.1 Re-run exact-authorship input if stale.
  - Exact-authorship input is current for river terrain proof:
    `studio-run-in-game-mq6c38rf-n2p` has a complete exact-authorship input
    packet, proof hash
    `72a521da3e6bc410a44da551f7fc20304a4eec7ea3114b4b55d91d468f283293`,
    and exact/local/live dimensions `84x54` for seed `24681357` recorded in the
    same proof artifact. The final-surface proof remains unresolved for
    non-river residuals.
- [x] 3.2 Re-run river/floodplain product acceptance rows.
  - River terrain acceptance evidence is available in the same-run proof:
    projected navigable terrain `6`, live `TERRAIN_NAVIGABLE_RIVER` `6`, and
    projected-vs-live terrain mismatch count `0`; the older Civ metadata
    divergence (`river=0`, `navigableRiver=0`, `minorRiver=0`) is now
    reclassified as a direct-stamping-only failure mode. Current native bulk
    materialization has positive metadata readback, with exact parity and
    rendered visibility still open.
  - Floodplain acceptance is reclassified as inactive for this authored map:
    the same-run proof contains no floodplain-family feature ids on either
    local or live full-grid feature surfaces (`localFloodplainFamily=0`,
    `liveFloodplainFamily=0`). Floodplain capability remains covered by focused
    ecology op/apply tests, including `planFloodplains` and
    `test/ecology/floodplain-feature-product-row.test.ts`; the broader
    `surface.feature.mismatch` residual belongs to non-river ecology/feature
    placement drift and remains out of scope for this river repair.
  - Product-row dispositions are recorded in
    `openspec/changes/swooper-earthlike-product-acceptance-proof/workstream/acceptance-row-ledger.md`.
- [x] 3.3 Run focused package tests/checks for touched owners.
  - Knob decoupling proof:
    `bun run --cwd mods/mod-swooper-maps test -- test/hydrology-knobs.test.ts test/standard-compile-errors.test.ts test/config/maps-schema-valid.test.ts`
    passed on 2026-06-09. It verifies hydrology `riverDensity` no longer moves
    `map-rivers` projection defaults, `navigableRiverDensity` changes the
    Civ-visible trunk lengths, the legacy map-rivers alias remains
    compiled-equivalent, duplicate alias/current values are accepted, and
    conflicting alias/current values fail compilation.
    `test/config/maps-schema-valid.test.ts` also guards shipped/catalog config
    usage so new configs do not adopt the legacy alias.
  - Studio display layer proof:
    `bun run --cwd mods/mod-swooper-maps test -- test/pipeline/viz-emissions.test.ts`
    passed on 2026-06-09. It now requires separated river layers for
    projected navigable terrain, planned minor intent, planned major intent,
    engine terrain readback, engine navigable metadata readback, river terrain
    mismatch, and engine minor metadata readback, with role/visibility metadata
    aligned to the parity proof classes.
  - Downstream ecology, placement, climate refinement, diagnostics, and
    adjacency consumers now use Hydrology's river-class helpers for any-river
    checks instead of duplicating raw `riverClass > 0` /
    `riverClass === 0` semantics.
  - Adapter terrain-vs-metadata regression proof:
    `bun test packages/civ7-adapter/test/civ7-river-projection.test.ts packages/civ7-adapter/test/mock-terrain-policy.test.ts`
    passed on 2026-06-09. It locks the live-observed case where raw
    `TERRAIN_NAVIGABLE_RIVER` rows can be present while Civ river metadata
    remains `NO_RIVER` before native bulk modeling, so map-rivers
    acceptance/rejection/mismatch accounting keeps terrain rows and metadata
    readback separate even when current source also invokes `modelRivers`.
  - Shared river metadata catalog proof:
    `bun run --cwd packages/civ7-map-policy test`,
    `bun run --cwd packages/civ7-types check`,
    `bun run --cwd packages/civ7-map-policy check`, and
    `bun run mapgen-studio:gen-civ7-tables && git diff --exit-code -- apps/mapgen-studio/src/civ7-data/civ7-tables.gen.ts packages/civ7-map-policy/src/civ7-tables.gen.ts packages/civ7-types/generated/river-types.gen.d.ts`
    passed on 2026-06-09. The reviewed river metadata source now lives in
    `@civ7/map-policy`, the generator consumes it for the Studio catalog,
    map-policy catalog, and generated `@civ7/types` ambient declaration, and
    tests assert those generated values stay aligned.
  - The same Studio display proof also requires lake parity layers:
    planned lake intent, engine-accepted lake readback, and rejected lake mask,
    with planned lakes marked as physics and engine lakes marked as readback.
  - Final-surface lake readback proof:
    `bun run --cwd mods/mod-swooper-maps test -- test/diagnostics/live-parity.test.ts`
    passed on 2026-06-09. It requires `lakeReadbackParity` to expose local
    accepted-lake/final-drift counters, preserve current `missing-exact-log`
    semantics for older Studio proof logs, and block future exact/local lake
    counter divergence.
  - `test/map-rivers/plot-rivers-post-refresh.test.ts` guards the exact
    `artifact:map.rivers.projectedNavigableRivers` and
    `artifact:map.rivers.engineProjectionRivers` IDs named by the OpenSpec
    Studio/Civ river parity requirement.
- [x] 3.4 Run `bun run openspec -- validate earthlike-visible-river-acceptance --strict`.
  - Passed on 2026-06-09: `Change 'earthlike-visible-river-acceptance' is valid`.
- [x] 3.5 Run `bun run openspec:validate`.
- [x] 3.6 Record completion audit.
  - `workstream/completion-audit.md` maps the active objective to current
    evidence, separates proved river/lake outcomes from non-claims, and records
    the current native-modeling reclassification without treating the broader
    hydrology/river/lake goal as complete.
