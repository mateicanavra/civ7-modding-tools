# Tasks — Natural Wonders Full-Set, Parity, and Physical-Suitability Placement

Revised after pre-code review (`output/nw-precode-review.md`); findings folded in.

## 1. Live probes (pin uncertain geometry/semantics)

- [x] 1.1 Direction calibration DONE & AUTHORITATIVE (probe harness, base map
  LARGE 96×60). Parity is purely `y&1`; EVEN/ODD 6-index tables exactly match the
  design; cross-validated by 5 base-placed wonder clusters. See ledger §A1.
- [x] 1.2 FOUR\* geometry: started-tuner CANNOT place (setFeatureType→false post-gen),
  so geometry pinned by reading base-placed clusters. FOURPARALLELAGRM rule
  **confirmed** (Thera). FOURADJACENT/FOURL dir-0 cells deferred to gen-time engine
  readback (design §5 "engine readback authoritative"). See ledger §A2.
- [x] 1.3 Predicate calibration: `isCliffCrossing` works as a post-start read (cliff
  dir order pinned); `canHaveFeatureParam` unreliable post-start → legality is
  engine-authoritative at gen-time, mod uses conservative odd-R pre-filters. Bermuda
  placed by base game → its tags satisfiable. See ledger §B.
- [x] 1.4 Probe outputs + encoding decision recorded in `workstream/live-proof-ledger.md`.

## 2. Footprint parity fix (map-policy)

- [ ] 2.1 Add in-package even/odd direction-offset tables to
  `natural-wonder-footprints.ts` that **preserve the existing index order**,
  swapping only the parity-dependent diagonals (even-row =
  `[(0,1),(1,0),(0,-1),(-1,-1),(-1,0),(-1,1)]`). Define by value (NOT importing
  `hex-oddq`). Make `getNaturalWonderFootprintIndices` select the table by
  `(y & 1)`.
- [ ] 2.2 Add `getNaturalWonderFootprintOffsetsByParity(policy)` returning
  `{ even, odd }`; keep the anchor-independent `getNaturalWonderFootprintOffsets`
  as **shape-only** (count/null-check), documented as parity-agnostic.
- [ ] 2.3 Tests: pin odd-row Redwood/Fuji(dir2)/Vihren(dir1) to current cells
  (`map-policy.test.ts:200-213` baseline); add **even-row** geometry tests per
  class against probe cells; add an in-package consistency test that the
  footprint tables' neighbor set matches `policy-grid.ts` per parity.

## 3. Full-set coverage — placement classes and predicates

- [ ] 3.1 Implement `FOURPARALLELAGRM`/`FOURADJACENT`/`FOURL` in the byParity
  helper per the Task 1 encoding (fixed parity cells, or conservative bounding
  set per parity if orientation is engine-resolved); ensure the `-1→0` direction
  normalization does not corrupt FOUR\* cells. Remove the null-footprint silent
  drop in the catalog (`catalogs/natural-wonders.ts`) and the second drop site
  (`inputs.ts:164-165`).
- [ ] 3.2 Add the 5 predicates to `SUPPORTED_POLICY_TAGS`
  (`natural-wonder-footprints.ts:21-34`) and implement conservative odd-R
  pre-filters in the planner tag switch (`default.ts:343-485`):
  `ADJACENTTOCOAST`, `NOTADJACENTTOLAND`, `ADJACENTTOSAMETERRAIN`,
  `ADJACENTCLIFF`, `NOLANDOPPOSITECLIFF` (cliff dirs per Task 1.3).
- [ ] 3.3 Honor `placeFirst` ordering and remove the `placeFirst && tiles>1`
  guard at `catalogs/natural-wonders.ts:37` so Valley of Flowers is placeable;
  add `placeFirst` to the plan op input contract and forward it from `inputs.ts`
  (catalog entry currently lacks it).
- [ ] 3.4 Coverage test: catalog length equals the count of `naturalWonderTiles`
  rows in the generated tables (relative invariant, not literal 20); all wonders
  footprint-valid on both parities; none dropped at `inputs.ts:165`.

## 4. Plan-contract footprint migration (NW-3 + NW-7)

- [ ] 4.1 Replace `footprintOffsets` in the op input contract
  (`plan-natural-wonders/contract.ts:41`) with
  `footprintOffsetsByParity: { even, odd }`.
- [ ] 4.2 Compute `{even,odd}` in `inputs.ts` (replacing the single-list
  producer at `inputs.ts:164,179`) via the map-policy byParity helper.
- [ ] 4.3 Rewrite the planner to apply parity at the concrete anchor
  (`(anchorY & 1) ? odd : even`): `getFootprintIndices` (`default.ts:271-291`),
  eligibility (`default.ts:504-509`), spacing reservation (`default.ts:200-207`).
  The op stays mapgen-core-only (no map-policy import).
- [ ] 4.4 Update the two affected tests (`test/placement/plan-ops.test.ts:94-95,
  135-136`, `test/placement/derive-placement-inputs.test.ts:54,112`) to the new
  contract shape.

## 5. Physical-suitability selection (NW-4 + NW-5)

- [ ] 5.1 Forward the already-computed physical sub-artifacts into the placement
  step: extend `DerivePlacementInputsContract.artifacts.requires`
  (`contract.ts:38-48`) with `coastlineMetrics`, `volcanoes`, `mountains`,
  `substrate`, `riverNetworkMetrics` (+ moisture/temperature/fertility);
  forward through `inputs.ts:190-211`; type in the planner contract
  (`contract.ts:6-51`). No truth artifact recomputed.
- [ ] 5.2 Wire the no-op tag handlers to real signals (VOLCANO→volcanoMask,
  SHALLOWWATER→shelfMask, FEATURE_FOREST→vegetationDensity) (`default.ts:360-363`).
- [ ] 5.3 Implement per-wonder, biome-aware `suitability(wonder, tile) ∈ [0,1]`
  using the §7 groups; keep hard constraints as pass/fail filters. Group F biome
  term includes DESERT (Vinicunca); Group H is arid-relief (FLAT/HILL), not
  mountain.
- [ ] 5.4 Replace the cross-wonder selection: rank wonders by per-map
  `bestSuitability`, pin `placeFirst` ahead of threshold-passing wonders, select
  down to `targetCount`, place each at its best tile subject to spacing +
  relaxed retry; per-wonder candidate re-ranking (replace the single global
  `candidates.sort`, `default.ts:136-198,557-618`). No RNG.
- [ ] 5.5 Preserve the `priority` output field `[0,1]` (`contract.ts:64`),
  emitting the placed tile's per-wonder suitability; update the live-parity
  `priorityDeltaPpm` baseline (`surface-delta-context.ts`, `live-parity.ts`).

## 6. Test contract + diagnostics

- [ ] 6.1 Flip the truncation expectations: `natural-wonder-catalog.test.ts:12-15`
  (remove `not.toContain(BARRIER_REEF)`), `map-policy.test.ts:184-226`.
- [ ] 6.2 De-duplicate the support filter: export `isSupportedNaturalWonder` and
  have `verify-manual-catalogs.ts` reuse it (currently a second copy with its own
  guard at `:29` and mirror assert `:38-47`); it then auto-verifies the full set.
- [ ] 6.3 Split diagnostics footprint reads: anchor-bound
  (`surface-delta-context.ts:606,1147,1238`) become parity-aware; shape-only
  (`:696,699`) unchanged; iterate the full catalog.
- [ ] 6.4 Add the determinism test (same artifacts → identical placements twice).

## 7. Verification (repo gates)

- [ ] 7.1 `bun run build` green across affected packages.
- [ ] 7.2 `nx run @civ7/map-policy:test`, `nx run @civ7/adapter:test`,
  `nx run mod-swooper-maps:test` green.
- [ ] 7.3 `bun run openspec -- validate natural-wonders-full-set-parity-suitability --strict`.

## 8. Live closure proof

- [ ] 8.1 Live render across ≥2 seeds; record distinct wonders placed per seed
  (incl. ≥1 previously-dropped wonder) in `workstream/live-proof-ledger.md`.
- [ ] 8.2 Record an even-row multi-tile placement whose readback matches the
  offline footprint.
- [ ] 8.3 Record **placement-time** effects manifesting (on-tile yields, a
  volcano-wonder's VOLCANO/eruptible registration, Everest reveal registration).
  Expedition Base / per-city yields are city-acquisition-time — out of map-gen
  closure scope (NW-10); note them as such, do not block on them.
- [ ] 8.4 Leave any unavailable live label unresolved rather than inferred.

## 9. Downstream realignment + closure

- [ ] 9.1 Update `workstream/phase-record.md`, `workstream/corpus-ledger.md`
  (mark expected-vs-observed), and `workstream/review-disposition-ledger.md`.
- [ ] 9.2 Confirm no truth-stage artifact, mapgen-core primitive, or generated
  table was edited; `git diff --check` passes.
- [ ] 9.3 Record repo/Graphite state and close, or hand off via a next packet.
