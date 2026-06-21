# Design — Natural Wonders Full-Set, Parity, and Physical-Suitability Placement

This packet covers Solution Design (what we build and why this shape) and
System Design (concrete contracts, owners, data flow). Target-shape decisions
are resolved explicitly; no decision is left as runtime fallback, optional
shape, or compatibility lane. **Revised after pre-code review**
(`output/nw-precode-review.md`); the dispositioned findings (NW-1..NW-16) are
folded in and tracked in `workstream/review-disposition-ledger.md`.

> **See also:** this file is the *decision* record (why each choice was made).
> For the *as-built operating model* — the end-to-end pipeline, the requirement-
> group/suitability model, the odd-R + 4-tile self-orient geometry, the explicit
> tradeoffs, and the honest known-limitations list — read
> [`workstream/natural-wonders-system-reference.md`](./workstream/natural-wonders-system-reference.md).

## 1. Surfaces and owners

| Surface | Owner package/path (kind) | Role in this change |
|---|---|---|
| Footprint geometry + catalog filter | `packages/civ7-map-policy/src/natural-wonder-footprints.ts`, `catalogs/natural-wonders.ts`, `types.ts` (`kind:foundation`) | parity-aware offsets; FOUR\* classes; predicate-tag allowlist; full catalog; single source of footprint truth |
| In-package parity reference | `packages/civ7-map-policy/src/policy-grid.ts` (`kind:foundation`) | existing odd-R neighbor table; footprint tables get an in-package consistency test against it |
| Generated policy tables (read-only) | `packages/civ7-map-policy/src/civ7-tables.gen.ts` | source of truth for placementClass/tags/terrain/biome/noLake/minElev — **not edited** |
| odd-R primitives (reference only) | `packages/mapgen-core/.../hex-oddq.ts` (`kind:engine`) | ground-truth values cross-checked **by test**, **not imported** (foundation may not import engine) |
| Live placement | `packages/civ7-adapter/src/civ7-adapter.ts` (`kind:adapter`) | consumes parity-aware `getNaturalWonderFootprintIndices`; engine `setFeatureType` + readback (the parity gate) |
| Mock placement | `packages/civ7-adapter/src/mock-adapter.ts` (`kind:adapter`) | already calls the shared `getNaturalWonderFootprintIndices`; auto-corrected when that fn is fixed — **not the parity gate** |
| Plan inputs (recipe step) | `mods/mod-swooper-maps/.../derive-placement-inputs/inputs.ts` (`kind:mod`) | imports map-policy; computes parity-keyed `{even,odd}` footprint offsets + forwards physical signals + `placeFirst` |
| Planner (domain op) | `mods/mod-swooper-maps/.../plan-natural-wonders/strategies/default.ts`, `contract.ts` (`kind:plan`) | stays pure (mapgen-core only); applies parity at the anchor from contract data; per-wonder suitability; predicate pre-filters; placeFirst |
| Materialize (recipe step) | `mods/mod-swooper-maps/.../place-natural-wonders/materialize.ts` (`kind:mod`) | parity-aware `getNaturalWonderFootprintIndices` for occupancy/terrain/readback |
| Diagnostics | `mods/mod-swooper-maps/src/dev/diagnostics/surface-delta-context.ts` | parity-aware for anchor-bound reads; shape-only reads unchanged |
| Tests / catalog mirror | `packages/civ7-map-policy/test/map-policy.test.ts`, `packages/civ7-adapter/test/natural-wonder-catalog.test.ts`, `mods/mod-swooper-maps/scripts/placement/verify-manual-catalogs.ts` | flip truncation expectations to full set; add even-row + consistency tests; de-duplicate the support filter |

**Forbidden owners:** mapgen-core hex primitives, ecology/morphology/hydrology
truth stages (signals are forwarded, not recomputed), studio UI, game-data
resources, and generated tables (`civ7-tables.gen.ts`).

**Domain-op purity (NW-7).** The `kind:plan` op stays mapgen-core-only. It does
**not** import `@civ7/map-policy`. Parity-aware footprint geometry is computed in
the recipe step `inputs.ts` (which already imports map-policy) and passed to the
op as contract **data**; the op applies the parity matching each candidate
anchor's row. This keeps one footprint source (map-policy) without coupling the
pure op to it.

## 2. Engine is the legality authority (load-bearing decision)

The C++ engine owns multi-tile footprint stamping (`setFeatureType`) and all
placement legality (`canHaveFeatureParam`); no JS footprint/predicate code
exists in shipped resources. One consistent contract:

- The offline footprint and the planner's predicate checks are **conservative
  pre-filters** that narrow candidates and reserve spacing.
- `canHaveFeatureParam` (pre-check) and post-placement **readback** are the
  final authority for whether a wonder placed and which cells it occupies.
  `civ7-adapter.placeNaturalWonder` (`civ7-adapter.ts:1000-1026`) readback-
  verifies; this is the only true parity gate.

**The mock cannot prove parity (NW-2).** `mock-adapter.placeNaturalWonder`
(`mock-adapter.ts:1380`) already calls the shared
`getNaturalWonderFootprintIndices` and write-and-echoes those cells, so it
reports whatever the shared function computes — including a wrong footprint —
as green. Correcting the shared function fixes the mock automatically; the mock
is never the parity gate. Parity is proven only by (a) even-row **unit tests**
on the shared function against probe-confirmed engine cells and (b) the **live
readback**.

## 3. Parity model (odd-R, anchor-keyed, index-order preserving)

`getNaturalWonderFootprintOffsets` is anchor-independent (no `y`), so it cannot
be parity-correct; parity is resolved in `getNaturalWonderFootprintIndices`,
which has the anchor `y`.

**Decision (NW-1):** introduce two direction-offset tables that **preserve the
existing footprint direction-index convention** (the order the current
`CIV7_DIRECTION_OFFSETS` is authored in and that the placement-class switch keys
`primary=dir`, `clockwise=dir+1` against). Only the two parity-dependent
diagonals differ:

```
index:       0        1       2        3        4        5
ODD  (cur): (1,1)   (1,0)  (1,-1)  (0,-1)  (-1,0)  (0,1)
EVEN (new): (0,1)   (1,0)  (0,-1)  (-1,-1) (-1,0)  (-1,1)
```

(indices 1 and 4 are parity-invariant; 0,2,3,5 swap). The even-row table is
**neither** the `hex-oddq` nor the `policy-grid` table — those use a different
index order for neighbor iteration. The tables are **defined in-package by value**
(NOT imported from `@swooper/mapgen-core`, which would violate
`kind:foundation`→foundation-only) with:
- the **live probe (Task 1.1)** as the authority for the full 6-index order on
  both parities, and
- an **in-package consistency test** asserting the footprint tables' neighbor
  *set* matches `policy-grid.ts` per parity (so the four odd-R copies — core,
  policy-grid, mock, footprint — cannot silently drift; NW-13).

`getNaturalWonderFootprintIndices({x,y,…})` selects the table by `(y & 1)` and
resolves `primary`/`clockwise` (and the FOUR\* cells, §4) from it. Sites that use
anchor-bound indices become parity-correct automatically: live adapter, mock,
materialize, and the anchor-bound diagnostics reads (`surface-delta-context.ts:
606,1147,1238`). Shape-only reads (`:696,699`, used for direction enumeration)
keep using the anchor-independent offsets and are **not** parity-changed (NW-11).

## 4. Plan-contract footprint field migration (NW-3 + NW-7 + NW-8)

`footprintOffsets` (`contract.ts:41`) is a **live** field: produced in
`inputs.ts:164,179`, consumed by the planner for eligibility
(`default.ts:504-509`), spacing reservation (`default.ts:200-207`), and
`getFootprintIndices` (`default.ts:271-291`), and asserted by
`plan-ops.test.ts:94-95,135-136` and `derive-placement-inputs.test.ts:54,112`.
Removing it is a **contract migration**, not a dead-code deletion.

**Decision:** replace the single anchor-independent `footprintOffsets` with a
parity-keyed pair `footprintOffsetsByParity: { even: Offset[]; odd: Offset[] }`
computed in `inputs.ts` via a new map-policy helper
`getNaturalWonderFootprintOffsetsByParity(policy)` (returns both parities for a
policy). The op picks `(anchorY & 1) ? odd : even` and adds to the candidate
anchor — parity-correct, data-only, op stays pure.

**FOUR\* direction normalization (NW-8).** `normalizeFootprintDirection` forces
`-1 → 0` (`natural-wonder-footprints.ts:62-65`), and `inputs.ts:160-165`
normalizes `-1 → 0` before computing offsets. All six FOUR\* wonders carry
`Direction = -1` (engine self-orients). The `byParity` helper computes FOUR\*
cells from the **probe-confirmed** layout (§5), not from a spurious direction-0
offset. If the probe shows orientation is engine-resolved (not a fixed offset),
the helper returns the **conservative bounding** cell set per parity (the union
of plausible orientations) for occupancy/spacing reservation, and final cells
come from engine readback. Either way the reserved `{even,odd}` sets are
parity-correct and do not depend on direction=0.

## 5. Multi-tile geometry (THREE\* confirmed, FOUR\* probe-pinned)

`Direction = -1` for all six 4-tile wonders → engine self-selects orientation.
Best-known hypotheses (FOURPARALLELAGRM = rhombus, FOURADJACENT = contiguous
4-hex cluster, FOURL = L-tetromino) are **not shipped as assumptions**. The live
geometry probe (Task 1, protocol in `workstream/live-proof-ledger.md`)
determines the encoding before Task 3.1 closes:

- **Deterministic per parity** → encode the probe-confirmed even/odd cell sets
  in `getNaturalWonderFootprintOffsetsByParity`, asserted by test against probe
  output.
- **Terrain-resolved orientation** → keep `direction = -1`, reserve the
  conservative bounding footprint per parity, and treat post-placement readback
  as the authoritative cell set.

This is a data-determined encoding resolved before implementation, not a runtime
branch. The behavioral requirement is invariant: generated/reserved cells SHALL
match the live stamped cells on both parities.

## 6. Adjacency predicates (5 new tags)

Add the 5 tags to `SUPPORTED_POLICY_TAGS`; implement conservative odd-R
pre-filters in the planner tag switch; the engine confirms legality.

| Tag | Wonder | odd-R pre-filter | Authority note |
|---|---|---|---|
| `ADJACENTTOCOAST` | Bermuda (0) | ≥1 odd-R neighbor is COAST terrain | engine confirms |
| `NOTADJACENTTOLAND` | Bermuda (0) | no odd-R neighbor is land | island-tag edge cases settled by readback |
| `ADJACENTTOSAMETERRAIN` | Great Blue Hole (44) | ≥1 odd-R neighbor shares anchor terrain | mirrors supported `ADJACENTTOSAMEBIOME` |
| `ADJACENTCLIFF` | Mapu'a Vaea (45) | ∃ dir d with `isCliffCrossing(anchor,d)` (edge-based) | direction order pinned by probe |
| `NOLANDOPPOSITECLIFF` | Mapu'a Vaea (45) | for each cliff edge d, neighbor at `(d+3)%6` is not land | opposite-pairing pinned by probe |

Cliff predicates are edge-based; their direction-index order and "opposite"
pairing are pinned by the predicate probe (Task 1.3) before Task 3.2 closes.
`FEATURE_REEF` (Barrier Reef) has no offline reef-suitability signal and stays
an engine-deferred legality filter with no suitability contribution (NW-16).

## 7. Physical-suitability selection model (NW-4 + NW-5)

**Per-tile scoring.** Replace the single tile scalar `priority = relief*0.75 +
(1-aridity)*0.15 + river*0.1` (`default.ts:127`) with a per-wonder, biome-aware
`suitability(wonder, tile) ∈ [0,1]` over the wonder's requirement-group signals.
Hard data constraints (validTerrain, validBiome, minElev, noLake, tags, footprint
legality) remain pass/fail filters; suitability ranks among passing tiles.

**Cross-wonder selection must be terrain-dependent (the variety mechanism).**
The current loop iterates the catalog by ascending `featureType` and breaks at
`targetCount` with one global candidate sort, so the same low-id wonders saturate
every seed. The new selection:

1. For each of the 20 wonders, compute `bestSuitability(wonder) = max over its
   footprint-legal, constraint-passing tiles of suitability(wonder, tile)` (0 if
   none).
2. Order wonders by `bestSuitability` descending (with `placeFirst` wonders
   pinned ahead among those that clear a minimum suitability threshold).
3. Select down the ranking until `targetCount` are placed, each at its
   best-suitability tile subject to the existing min-spacing pass and relaxed
   retry; tie-break by stable tile index. A wonder physically unsuited to this
   map (bestSuitability below threshold) is not forced in.

This changes **which** wonders are selected per map, not just where they land, so
different seeds (different terrain) surface different wonder sets — variety from
physical viability. Same seed → same artifacts → identical selection
(determinism). There is **no RNG** anywhere in selection (NW-9).

**Preserve the `priority` output (NW-5).** The op output `priority`
(`contract.ts:64`, range-validated `[0,1]`, consumed by telemetry, diagnostics,
and live-parity) is retained and now carries the placed tile's per-wonder
suitability. Selection requires **per-wonder candidate re-ranking**, not the
single global `candidates.sort` — that restructure replaces `chooseFeatureCandidate`/
`default.ts:136-198,557-618`. Live-parity `priorityDeltaPpm` will change; the
diagnostic baseline is updated as part of this change.

**Signal forwarding.** `DerivePlacementInputsContract.artifacts.requires`
(`contract.ts:38-48`) and `inputs.ts:190-211` forward the already-computed
sub-artifacts (`coastlineMetrics`, `volcanoes`, `mountains`, `substrate`,
`riverNetworkMetrics`, plus moisture/temperature/fertility) into the planner
contract (`contract.ts:6-51`). No truth artifact is recomputed. The three no-op
tag handlers (`default.ts:360-363`) are wired to real signals (VOLCANO→
volcanoMask, SHALLOWWATER→shelfMask, FEATURE_FOREST→vegetationDensity).

## 8. Effects by placement — placement-time vs city-acquisition-time (NW-10)

Every effect of the 20 vanilla wonders is data-driven and engine-automatic on
correct placement, and the adapter already uses `setFeatureType`. The design's
only obligation is to **not bypass the engine path** and to verify the
**placement-time** effects at map-gen. Effects split by when they manifest:

- **Placement-time (verifiable at map-gen / closure gate):** on-tile yields
  (`TerrainBiomeFeature_YieldChanges`, intrinsic to the tile), volcano
  eruptibility (the VOLCANO `TypeTag` + `<RandomEvents NaturalWonder>` binding),
  and Everest's reveal-on-discovery registration.
- **City-acquisition-time (NOT verifiable at map-gen):** the free Expedition
  Base (`District_FreeConstructibles`) and per-city/adjacency yields manifest
  only when a city owns/borders the wonder tile — which never happens at map-gen
  for an Impassable wonder tile. These are **out of the map-gen closure scope**;
  the closure gate does not wait for a city to claim the tile and does not fail
  on their absence.

No new effect code for the 20 vanilla types.

## 9. Test contract changes

`natural-wonder-catalog.test.ts:12-15` (incl. `not.toContain(BARRIER_REEF)`) and
`map-policy.test.ts:184-226` are flipped to expect the recovered full set —
correcting tests that certify the bug, authorized by the goal.
`verify-manual-catalogs.ts:24-47` is **not** a length gate; it is a mirror
consistency check against a second copy of the support filter. It is
de-duplicated by reusing an exported `isSupportedNaturalWonder` predicate (NW-6),
so it auto-verifies the full set. New coverage: even-row footprint geometry tests
per class against probe cells; odd-row regression pins for Redwood/Fuji(dir2)/
Vihren(dir1) current cells; an in-package footprint-vs-policy-grid consistency
test; a determinism test (same artifacts → identical placements twice); a
no-silent-drop test asserting `catalog length == count of naturalWonderTiles
rows` (relative invariant, not literal 20; NW-15).

## 10. Review lanes (required before implementation closes)

- **Owner / architecture lane:** map-policy is policy surface (foundation); the
  pure plan op stays mapgen-core-only with parity offsets injected via contract;
  no truth-stage / mapgen-core / generated-table edits; no second legality
  source.
- **Product authority lane:** the full 20 set, groups, and effect bindings match
  official game data; counts/quotas unchanged.
- **Adversarial lane:** probe-pinned geometry/predicates are not shipped as
  assumptions; the shared footprint fn (not the mock) is the unit-tested parity
  surface and live readback is the gate; suitability has no hidden RNG and the
  cross-wonder selection is terrain-dependent; the test changes correct
  bug-certifying tests without loosening real invariants; no shortcut language;
  the live closure gate is non-substitutable.

## 11. Open questions resolved into decisions

| Question | Decision |
|---|---|
| Parity table source | In-package by-value even/odd tables preserving the footprint index order; probe is authority; consistency test vs `policy-grid.ts`. Not a `hex-oddq` import. |
| Planner footprint source | Parity-keyed `{even,odd}` offsets passed via the op contract from `inputs.ts`; pure op applies parity at the anchor. No map-policy import in the op. |
| FOUR\* orientation deterministic? | Pinned by Task 1 probe; §5 specifies both encodings, behavior invariant; `-1→0` normalization handled by the byParity helper. |
| `NOTADJACENTTOLAND` land definition / cliff pairing | Pinned by Task 1.3 probe; conservative pre-filter + engine readback. |
| Variety mechanism | Cross-wonder selection ranked by per-map best suitability (§7); variety from physical viability, deterministic per seed, no RNG. |
| `priority` output | Retained `[0,1]`, now per-wonder suitability of the placed tile; live-parity baseline updated. |
| Reef suitability signal | None; Barrier Reef stays engine-deferred legality filter, no suitability term. |
| `placeFirst` | Honored (pinned ahead among threshold-passing wonders); plumbed via a new contract field + `inputs.ts`. Unblocks Valley of Flowers. |
| Effects verification scope | Placement-time effects verified at closure; city-acquisition-time effects out of map-gen scope. |
| Per-map counts / balance | Unchanged vanilla counts; variety via suitability + full corpus across seeds. |
| Full-set assertion | Relative invariant (catalog == `naturalWonderTiles` row count), not literal 20. |
