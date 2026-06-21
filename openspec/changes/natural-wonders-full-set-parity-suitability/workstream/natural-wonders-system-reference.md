# Natural-Wonder Placement — System Reference

Status: **as-built reference** for the natural-wonder placement system on branch
`agent-A-natural-wonders-full-set-parity-suitability`. This document is normative
(it states the contracts and invariants the system MUST uphold) and a reference
(it explains how the pieces fit and *why* the shape was chosen, including the
tradeoffs). Live-verified claims mirror
[`live-proof-ledger.md`](./live-proof-ledger.md) §D exactly; anything not proven
live is called out in [§11 Known limitations](#11-known-limitations-honest).

`design.md` is the *decision* record (why each choice was made, NW-1..NW-16);
this document is the *operating* record (how the resulting system behaves). Read
`design.md` for rationale-by-decision; read this for the end-to-end model.

---

## 1. What the system does

Civilization VII has **exactly 20 natural wonders** — every `Feature` with a
`Feature_NaturalWonders` row (ids `{0, 1, 28..45}`). The system selects a subset
of them per map and stamps them onto the generated world during map generation,
deterministically, so that:

- the selected set is a **physically-grounded, cross-type mix** (a mountain map
  surfaces mountain/volcano wonders; a wet map surfaces forest/waterfall
  wonders) rather than the same low-id wonders every seed;
- each wonder lands on terrain it is actually suited to;
- the engine — not the mod — remains the final authority on whether a placement
  is legal and which exact cells a multi-tile wonder occupies.

Selection and placement are **fully deterministic with no RNG**: the same input
artifacts (which are themselves seed-derived) always produce the same plan and
the same placements. Variety comes from *terrain diversity across seeds and map
types*, not from randomness ([§7](#7-tradeoffs-explicit) explains why).

---

## 2. The requirement-group model (A–I)

Every wonder is assigned to one of nine **requirement groups** by feature id.
The `WONDER_GROUPS` registry in
[`plan-natural-wonders/strategies/default.ts`](../../../../mods/mod-swooper-maps/src/domain/placement/ops/plan-natural-wonders/strategies/default.ts)
is the single source of truth for BOTH group membership and the per-group
suitability formula (the feature→group map is derived from it, so the two cannot
drift). A group captures *what physical situation the wonder wants*, and drives
both the per-tile suitability score and the cross-wonder variety decay
([§5](#5-suitability-and-cross-wonder-selection)).

| Group | Theme | Wonders (feature id) |
|---|---|---|
| A | Subaerial volcano | Kilimanjaro (35), Mount Fuji (41) |
| B | Volcano caldera on coast | Thera (37) |
| C | Reef / shallow marine | Barrier Reef (29), Great Blue Hole (44), Mapu'a Vaea (45) |
| D | Deep ocean | Bermuda Triangle (0) |
| E | Waterfall / river-fed | Gullfoss (32), Iguazú Falls (34) |
| F | Mountain monolith | Everest (1), Hoerikwaggo (33), Zhangjiajie (36), Torres del Paine (38), Machapuchare (40), Vihren (42), Vinicunca (43) |
| G | Mountain-adjacent lowland | Valley of Flowers (28) |
| H | Arid relief (canyon / inselberg) | Grand Canyon (31), Uluru (39) |
| I | Forest | Redwood Forest (30) |

An unknown feature id falls back to group **F** (mountain monolith) — the safest
default for an unrecognised wonder, since most wonders are relief-driven.

Per-tile suitability for a `(group, tile)` pair is computed by `suitabilityAt`
as a weighted blend of normalized physical signals in `[0, 1]`. The exact
current weights (load-bearing — change only with re-tuning, never by loosening):

| Group | suitability formula |
|---|---|
| A | `0.55·relief + 0.35·elevN + 0.10·warm` |
| B | `0.50·shelfN + 0.30·relief + 0.20·warm` |
| C | `0.55·shelfN + 0.30·warm + 0.15·(1−arid)` |
| D | `0.70·deepN + 0.30·(1−arid)` |
| E | `0.45·dischN + 0.30·slopeN + 0.25·relief` |
| F | `0.50·elevN + 0.40·relief + 0.10·(1−vegN)` |
| G | `0.45·fertN + 0.30·moist + 0.25·(1−relief)` |
| H | `0.50·arid + 0.30·elevN + 0.20·relief` |
| I | `0.55·vegN + 0.30·moist + 0.15·temperate` |
| default | `0.60·relief + 0.40·elevN` |

where `relief` is normalized local elevation range, `elevN` normalized
elevation, `warm`/`temperate` temperature bands, `shelfN`/`deepN` coastal vs deep
water, `arid` aridity, `dischN` river discharge, `slopeN` slope class, `fertN`
fertility, `moist` effective moisture, `vegN` vegetation density. All signals are
**forwarded** truth artifacts ([§6](#6-boundaries-and-ownership)); none is
recomputed in the planner. Suitability only **ranks** tiles that already pass the
hard constraints — it never overrides legality.

---

## 3. The pipeline (end to end)

Four owners, in order. Each box names the on-disk surface and its architectural
`kind`.

```
 ┌─ derive-placement-inputs (recipe step, kind:mod) ─────────────────────────┐
 │  reads the adapter NW catalog + generated policy tables;                   │
 │  builds the per-wonder featureCatalog: validTerrain/Biome, tags,           │
 │  minElev, noLake, placeFirst, materializationDirection,                    │
 │  footprintOffsetsByParity {even,odd};                                      │
 │  forwards physical signals + engine terrain/biome/feature surfaces.        │
 └───────────────────────────────┬───────────────────────────────────────────┘
                                  │  op input (contract DATA only)
 ┌────────────────────────────────▼──────────────────────────────────────────┐
 │  plan-natural-wonders (domain op, kind:plan — mapgen-core only)            │
 │  per-tile suitability → per-wonder candidate ranking →                     │
 │  diminishing-returns greedy cross-wonder selection →                       │
 │  primary anchor + fallbackPlotIndices.   NO engine, NO map-policy import.  │
 └───────────────────────────────┬───────────────────────────────────────────┘
                                  │  naturalWonderPlan artifact (schema = op output)
 ┌────────────────────────────────▼──────────────────────────────────────────┐
 │  place-natural-wonders (recipe step, kind:mod)                             │
 │  for each planned wonder: try [primary, ...fallbacks];                     │
 │  per anchor: parity footprint → occupancy/terrain pre-check →             │
 │  adapter.placeNaturalWonder → strict readback. Emit telemetry.            │
 └───────────────────────────────┬───────────────────────────────────────────┘
                                  │  adapter.placeNaturalWonder(x,y,feature,dir,elev)
 ┌────────────────────────────────▼──────────────────────────────────────────┐
 │  civ7-adapter (kind:adapter) → engine setFeatureType + readback            │
 │  THE legality + multi-tile-stamping authority (C++).                       │
 └─────────────────────────────────────────────────────────────────────────────┘
```

**Step 1 — `derive-placement-inputs/inputs.ts`** (may import `@civ7/map-policy`).
For each catalog entry it resolves the *materialization direction* and the
*parity-keyed footprint offsets* from map-policy, attaches the generated policy
data (valid terrain/biome, tags, `noLake`, `minimumElevation`, `placeFirst`), and
forwards the already-computed physical signals (vegetation, moisture,
temperature, fertility, discharge, slope) plus the declared engine terrain/biome/
feature surfaces and the `naturalWonderBlockedMask` (polar water rows). It then
invokes the op. **All geometry crosses the boundary as plain data**, so the op
never imports map-policy ([§6](#6-boundaries-and-ownership)).

**Step 2 — `plan-natural-wonders` (the op).** Pure and engine-free. Computes
suitability, ranks each wonder's constraint-passing tiles, runs the
diminishing-returns greedy selection ([§5](#5-suitability-and-cross-wonder-selection)),
and emits a plan: per wonder a primary `plotIndex`, `direction`, `elevation`,
`priority`, and optional `fallbackPlotIndices`.

**Step 3 — `place-natural-wonders/materialize.ts`** (may import map-policy +
adapter). Applies the plan exactly once. For each planned wonder it builds the
anchor candidate list `[primary, ...fallbacks]` and tries them in order
([§5.3](#53-fallbacks-and-the-materialize-retry)). Per anchor it recomputes the
**parity-aware** footprint (`getNaturalWonderFootprintIndices`), runs an
occupancy + valid-terrain pre-check, calls `adapter.placeNaturalWonder`, and
verifies a strict readback. Emits `NATURAL_WONDER_PLACEMENT_V1` telemetry and a
reconcilable outcome artifact ([§8](#8-telemetry-and-the-reconcile-invariant)).

**Step 4 — `civ7-adapter.placeNaturalWonder`.** Computes the engine footprint,
checks `canHaveFeatureParam`, calls `TerrainBuilder.setFeatureType`, then reads
back the footprint. A `false` from `setFeatureType` is surfaced as a `rejected`
outcome — never a thrown error that kills generation.

---

## 4. Geometry: odd-R parity and 4-tile self-orientation

This is the most subtle part of the system and the source of two of the three
remaining wonder gaps, so it is documented in full.

### 4.1 The engine grid is odd-R

The live engine plot grid is **pointy-top, row-offset (odd-R)**: odd rows are
shifted east. Adjacency is therefore keyed on the **row** parity `y & 1`. The
6 neighbor directions (DirectionTypes 0..5) resolve to different `(dx, dy)`
offsets on even vs odd rows — they agree on 4 of 6 neighbors and differ on the
two parity-dependent diagonals.

`packages/civ7-map-policy/src/natural-wonder-footprints.ts` (`kind:foundation`)
ships the two offset tables **by value** (it may not import mapgen-core), keyed
by `y & 1`:

```
index:        0        1       2        3        4        5
ODD  (y&1=1): (1,1)   (1,0)  (1,-1)  (0,-1)  (-1,0)  (0,1)
EVEN (y&1=0): (0,1)   (1,0)  (0,-1)  (-1,-1) (-1,0)  (-1,1)
```

`ODD` is the historical `CIV7_DIRECTION_OFFSETS`; `EVEN` swaps only the four
parity-dependent diagonals (indices 0, 2, 3, 5). Both were **calibrated against a
live `getAdjacentPlotLocation` probe on both parities** (ledger §A1) and
cross-validated against five base-game-placed wonder clusters. An in-package test
pins the neighbor *set* against `policy-grid.ts` per parity so the odd-R copies
cannot silently drift.

A footprint is built by selecting the table for the **anchor's** row parity and
walking the placement-class shape from it. Multi-tile shapes:

| placementClass | footprint (from `off(d)` in the anchor-parity table) |
|---|---|
| ONE / `tiles ≤ 1` | `[anchor]` |
| TWO / TWOADJACENT | `[anchor, off(d)]` |
| THREETRIANGLE / THREETRIANGLEDEEPOCEAN | `[anchor, off(d), off(d+1)]` |
| FOURPARALLELAGRM | `[anchor, off(d), off(d+1), corner]` — `corner` chains `off(d+1)` from the `off(d)` cell using *that cell's* parity |
| FOURADJACENT / FOURL | engine-owned at the sentinel direction (see §4.2) |

The parallelogram `corner` uses `chainOffset`, which resolves the second step
against the *intermediate* cell's parity (`anchorParity XOR (base.dy & 1)`), not
the anchor's — because the far vertex's neighborhood depends on the row it
extends from. This is confirmed live (Thera, odd-row dir 4; ledger §A2).

### 4.2 4-tile wonders self-orient (Direction:-1) — the biggest hard-won fact

**The live engine refuses to stamp any 4-tile class at a forced concrete
`Direction` (0).** Passing `Direction:0` to `setFeatureType` returns `false`
(zero cells placed) for FOURPARALLELAGRM, FOURADJACENT, and FOURL, while every
1/2/3-tile class places fine at a concrete direction. The base game stamps all
4-tile wonders with `Direction:-1` and lets the engine pick a legal orientation.

The system therefore treats the 4-tile classes as **engine-self-orienting**:

- `resolveNaturalWonderMaterializationDirection` keeps the `-1` sentinel for the
  4-tile classes (it does *not* normalize `-1 → 0`).
- `footprintOffsetsForParity` returns **anchor-only** (`[ANCHOR]`) for a 4-tile
  class at the sentinel direction. The offline model reserves and reads back only
  the anchor; the engine owns and stamps the other three cells.

> **INVARIANT.** Every 4-tile wonder in the corpus carries `Direction:-1`. The
> only concrete-direction wonders (Fuji=2, Vihren=1) are 3-tile. So production
> always takes the self-orient branch. The guard is *also* keyed on
> `Direction < 0` so that a concrete direction still resolves the full geometric
> model for diagnostics and tests (e.g. the Thera dir-0 parallelogram test). A
> future 4-tile wonder authored with a concrete direction would hit the
> engine-refused concrete path and must be added to the self-orient set.

**Readback narrowing (deliberate).** Because the offline footprint for a
self-orienting 4-tile wonder is anchor-only, the post-place strict readback
verifies **only the anchor cell**. The other three cells are engine-owned and
not mod-verified. This narrows the original "strict full-footprint readback"
gate, and is sound because the engine is the legality authority: a non-`false`
`setFeatureType` plus an anchor that reads back the exact feature cannot be a
zero-cell placement. The tradeoff is recorded in [§7](#7-tradeoffs-explicit).

Live status: FOURADJACENT (Barrier Reef) and FOURPARALLELAGRM (Everest) place
via self-orientation; FOURL (Hoerikwaggo) shares the identical code path but was
never *selected* in sampled seeds, so its live self-orientation is unproven
([§11](#11-known-limitations-honest)).

---

## 5. Suitability and cross-wonder selection

### 5.1 Per-wonder candidate ranking

For each catalog wonder the op scans every tile, keeps those that pass the hard
constraints (`isCandidateCompatibleWithFeature`: footprint in bounds + free,
`naturalWonderBlockedMask`, no existing feature, valid terrain/biome, `noLake`,
predicate tags, `minimumElevation`), and sorts the survivors by that wonder's
`suitabilityAt` score (descending, tie-broken by ascending plot index). The top
survivor's score is the wonder's **`bestSuitability`**, used to rank wonders
against each other. A wonder with no legal tile has `bestSuitability = -1` and is
dropped from contention.

### 5.2 Diminishing-returns greedy (the variety mechanism)

Cross-wonder selection is a deterministic greedy. Each iteration places the
remaining wonder with the highest **effective score**:

```
effectiveScore(w) = placeFirstBonus(w) + bestSuitability(w) · GROUP_DISCOUNT ^ groupSelectedCount(group(w))
  PLACE_FIRST_BONUS = 1000   (additive; preserves base-generator placeFirst ordering)
  GROUP_DISCOUNT    = 0.5     (per already-selected wonder from the same group)
```

The per-group decay is what produces a cross-type mix: once a group has placed
one wonder, a *second* wonder from that group is discounted by 0.5, so a fresh
group's wonder (even at lower raw suitability) wins the next slot. A second water
wonder at suitability `1.0 · 0.5 = 0.5` loses to a fresh land wonder at `~0.7`.
Selection composition therefore tracks the map's terrain (more mountains → more
mountain wonders) instead of collapsing onto whichever group has the most
abundant legal tiles.

The pick is a strict argmax with a total ordering (`isBetterPick`): higher
`effectiveScore`, then higher `bestSuitability`, then **lower `featureType`** (a
stable last resort — feature ids are unique, so ties always resolve). There is no
RNG and no wall-clock dependency. `groupSelectedCount` is incremented only when a
wonder is actually placed. `targetCount = min(wondersCount, catalog length, map
size)`.

`placeFirst` wonders (Gullfoss, Iguazú, Valley of Flowers) carry the large
additive bonus so they are chosen first, *but the per-group decay still applies*
among them.

The placed tile's per-wonder suitability is emitted as the output `priority`
field (`[0, 1]`), consumed by telemetry, diagnostics, and live-parity baselines.

### 5.3 Fallbacks and the materialize retry

`canHaveFeatureParam`-true does **not** guarantee `setFeatureType`-success — the
engine may still refuse the chosen tile's full neighborhood at stamp time. To
recover, the op publishes up to `FALLBACK_CAP = 6` next-best anchors per wonder
(`collectFallbacks`, suitability-descending). Fallbacks are *alternatives* to the
primary (only one is ever stamped), so they may sit near the primary, but they
must avoid every already-placed wonder's footprint and the primary's own
footprint, and they prefer the spacing floor. They are collected **before** the
primary footprint is marked used, so they are scored as alternatives rather than
as tiles forbidden by the primary.

At materialize time the step tries `[primary, ...fallbacks]` in order and stops
at the first anchor the engine accepts. If all fail, the **primary** anchor's
rejection is recorded (one outcome row per planned wonder). The no-fallback path
is byte-identical to the pre-fallback behavior, so existing telemetry hashes are
preserved.

---

## 6. Boundaries and ownership

The system spans three architectural `kind`s with strict import rules. These are
load-bearing — they keep the pure op testable and keep a single source of
footprint truth.

| Surface | `kind` | May import | May NOT import |
|---|---|---|---|
| `natural-wonder-footprints.ts` (map-policy) | foundation | other foundation | `@swooper/mapgen-core` (engine) — so the odd-R tables are defined by value |
| `plan-natural-wonders` (op) | plan | `@swooper/mapgen-core` (+ its grid/hydrology helpers) | `@civ7/map-policy`, engine — geometry arrives as contract **data** |
| `derive-placement-inputs/inputs.ts` (step) | mod | `@civ7/map-policy`, mapgen-core | truth-stage producers (signals are forwarded, not recomputed) |
| `place-natural-wonders/materialize.ts` (step) | mod | `@civ7/map-policy`, `@civ7/adapter` | — |

Two consequences worth stating explicitly:

1. **The pure op cannot see map-policy geometry.** Footprint offsets cross the
   boundary as plain `{even, odd}` data in the op input contract; the op resolves
   parity at each concrete anchor. For its adjacency predicates the op uses
   mapgen-core's `getHexNeighborIndicesOddQ` — whose `OddQ` name is **legacy**:
   the implementation is odd-R (keyed on `y & 1`) and live-calibrated to the
   engine, so `ADJACENTMOUNTAIN` already matches stamp-time legality.
2. **Signals are forwarded, never recomputed.** The planner consumes
   already-computed ecology/hydrology/pedology truth artifacts. It must not
   recompute them; doing so would create a second, drifting source of truth.

**Engine is the final legality authority.** The offline footprint and the
planner's predicate checks are *conservative pre-filters* that narrow candidates
and reserve spacing. `canHaveFeatureParam` (pre-check) and the post-placement
readback are the final word on whether a wonder placed and which cells it
occupies. There is deliberately **no second offline legality model**.

---

## 7. Tradeoffs (explicit)

| Decision | Chosen | Alternative | Why this side |
|---|---|---|---|
| Variety source | Deterministic suitability + per-group decay | RNG/shuffle (what the base game does) | Determinism is required (reproducible maps, testable plans). Variety still emerges across seeds/types because terrain differs. Cost: two *similar* seeds of the same map type can yield similar sets — accepted, because variety is across map TYPES, not within a single earthlike seed pair. |
| 4-tile footprint reservation | Anchor-only (engine owns the other 3 cells) | Reserve a concrete/bounding 4-cell footprint offline | The engine refuses forced orientations and owns the true cells; a forced offline footprint is wrong. Cost: weaker offline spacing/occupancy reservation around 4-tile wonders, and readback verifies only the anchor (§4.2). |
| Legality model | Single engine authority (`setFeatureType` + readback) | Full offline legality re-implementation | No JS legality code exists in shipped resources; re-implementing it would drift from the C++ truth. Cost: the planner can pick tiles the engine then refuses → handled by the fallback retry (§5.3). |
| Pre-check vs stamp | `canHaveFeatureParam` pre-check is advisory | Trust the pre-check as final | Pre-check ≠ stamp success (esp. multi-tile). Treating it as final would silently drop placeable wonders. Cost: extra stamp attempts. |
| Predicate neighborhood (op) | mapgen-core's `getHexNeighborIndicesOddQ` (already odd-R — `OddQ` is a legacy name) | a map-policy odd-R table forwarded as contract data | Both are odd-R, so forwarding adds no correctness, only a redundant boundary surface. The op stays mapgen-core-only and its adjacency already matches the engine. |
| Shortfall handling | Measure shortfall as an outcome | Force `targetCount` wonders in | Forcing physically-unsuited wonders breaks the "lands where suited" goal. Cost: a map may place fewer than requested when terrain is poor. |

---

## 8. Telemetry and the reconcile invariant

The materialize step emits `NATURAL_WONDER_PLACEMENT_V1` (via
`logNaturalWonderPlacementRuntimeTelemetry`) and publishes an outcome artifact
validated by `place-natural-wonders/validate.ts`. The publish-time invariant the
schema cannot express:

```
placedCount + rejectedCount + skippedOutOfBoundsCount === plannedCount
coordinateRows(placed)   === placedCount
coordinateRows(rejected) === rejectedCount + skippedOutOfBoundsCount   (skips are recorded as rejected rows)
coordinateProof.placed.count / rejected.count agree with the row corpus
```

**Telemetry-precision caveat (load-bearing for evidence claims).** The runtime
telemetry emits per-row coordinates **only for rejected rows**. Placed wonders
are summarised by an opaque `coordinateProof.placedHash32` (FNV-1a 32). So a
wonder's *placed* status is derived as `planned − rejected`, and its exact placed
coordinate is **not individually exposed** (it equals the planned anchor only
when no fallback was consumed). Any claim about a specific *placed* coordinate or
its row parity is therefore not directly provable from telemetry — see ledger
§D O3.

---

## 9. Effects

Every effect of the 20 vanilla wonders is data-driven and engine-automatic on
correct placement (the adapter uses the `setFeatureType` path, which fires the
data-gated `REQUIREMENT_MAP_HAS_FEATURE` bindings). Effects split by when they
manifest:

- **Placement-time** (on-tile yields, volcano eruptibility, Everest reveal
  registration) ride the `setFeatureType` path and are in scope for map-gen.
- **City-acquisition-time** (the free Expedition Base, per-city/adjacency yields)
  manifest only when a city owns or borders the wonder tile, which never happens
  at map-gen for an impassable wonder tile. These are **out of map-gen closure
  scope**.

No new effect code is written for the vanilla types. Full in-game yield
verification is deferred (ledger §D O6).

---

## 10. The catalog: from 20 to the planned set

The full 20 are catalog-eligible. Historically 10 were silently dropped; the
recovery removed those drop sites:

- the `placeFirst && tiles>1` guard (unblocked Valley of Flowers);
- 5 predicate tags added to `SUPPORTED_POLICY_TAGS`
  (`ADJACENTTOCOAST`, `NOTADJACENTTOLAND`, `ADJACENTTOSAMETERRAIN` computed
  in-op; `ADJACENTCLIFF`, `NOLANDOPPOSITECLIFF` engine-deferred);
- the 4-tile placement classes (FOURPARALLELAGRM / FOURADJACENT / FOURL) made
  reservable via the self-orient model (§4.2).

A relative-invariant test asserts the catalog length equals the count of
`naturalWonderTiles` rows in the generated tables (not a literal 20), so a
data-side change cannot silently re-truncate the set.

---

## 11. Known limitations (honest)

These mirror [`live-proof-ledger.md`](./live-proof-ledger.md) §D + §E and are
**not** closed as of the 3-fix DRAFT. (Items being addressed in the current
docs/wonders/refactor phase are noted.)

- **Valley of Flowers (28)** — rejected `set-feature-false`. **Both the
  odd-Q/odd-R predicate AND the `Direction:-1` self-orient hypotheses are DISPROVEN
  by live runs** (ledger §E): the op's adjacency is already odd-R, and a
  `Direction:-1` retry still failed while Zhangjiajie — the same `TWOADJACENT`
  2-tile class — places at the forced `Direction:0`. So VoF's failure is its tight
  constraint combination (`validTerrain=[FLAT]` + `ADJACENTMOUNTAIN` +
  `NOTNEARCOAST`): `canHaveFeatureParam` passes but the engine's `setFeatureType`
  refuses every mod-selected candidate, and on mountain-heavy maps VoF often has
  no legal tile at all (terrain-limited). Not a quick code bug — would need
  engine-exact candidate matching or the base NW placement flow (out of scope).
- **Thera (37, FOURPARALLELAGRM caldera-coast)** — rejected on all runs at
  `Direction:-1`. The CLASS works (Everest, same class, places); Thera needs a
  volcano-adjacent-to-coast neighborhood rarely present at suitability-top
  anchors. **Fix (planned):** terrain-aware group-B anchor pre-filter favouring
  anchors adjacent to both a volcano and a coast.
- **Hoerikwaggo (33, FOURL)** — terrain-limited: it needs a `MOUNTAIN`+`biome 1`
  tile, which the sampled maps lack, so it has no legal footprint and is never
  selected. A forced-`placeFirst` probe (ledger §E3) still could not select it —
  `placeFirst` only adds a ranking bonus and cannot force a wonder whose
  `bestSuitability` is `-1`. FOURL engine-acceptance is therefore code-path-proven
  only (identical `Direction:-1` + anchor-only path to the live-proven
  FOURADJACENT/FOURPARALLELAGRM); proving it needs a `MOUNTAIN`+`biome 1` map.
- **Even-row PLACED anchor** — even-row *geometry* is proven (live calibration +
  unit tests), but no *placed* even-row multi-tile anchor is telemetry-proven
  (placed coords are hashed; §8).
- **Same-binary live determinism** — proven offline by the no-RNG unit tests; no
  same-seed/same-binary live re-run was performed (the live runs compared
  different binaries).
- **In-game effect yields** — placement path confirmed; full yield/
  city-acquisition verification deferred (§9).

---

## 12. File map (where each concern lives)

| Concern | File |
|---|---|
| odd-R parity tables, self-orient, footprint geometry, predicate-tag allowlist | `packages/civ7-map-policy/src/natural-wonder-footprints.ts` |
| in-package parity reference (consistency test target) | `packages/civ7-map-policy/src/policy-grid.ts` |
| suitability, groups, diminishing-returns selection, fallbacks, predicates | `mods/mod-swooper-maps/.../plan-natural-wonders/strategies/default.ts` |
| op input/output schema | `mods/mod-swooper-maps/.../plan-natural-wonders/contract.ts` |
| catalog build + signal/geometry forwarding | `mods/mod-swooper-maps/.../steps/derive-placement-inputs/inputs.ts` |
| materialize + retry + telemetry | `mods/mod-swooper-maps/.../steps/place-natural-wonders/materialize.ts` |
| reconcile invariant | `mods/mod-swooper-maps/.../steps/place-natural-wonders/validate.ts` |
| engine stamp + readback | `packages/civ7-adapter/src/civ7-adapter.ts` (`placeNaturalWonder`) |
| live evidence (source of truth for proven claims) | `openspec/changes/natural-wonders-full-set-parity-suitability/workstream/live-proof-ledger.md` §D + §E |

## 13. Refactor evaluation (2026-06-19)

Evaluated per the `typescript-refactoring` + `civ7-architecture-authority` skills.

- **Wonder groups → single registry — IMPLEMENTED.** The split
  `WONDER_GROUP_BY_FEATURE` map + `suitabilityAt` switch became one `WONDER_GROUPS`
  registry that owns membership *and* the per-group formula; the feature→group map
  is derived from it (no membership/formula drift) and the dead `default` switch
  branch is gone (the group is always A–I). Formulas are now pure module-level
  functions over an explicit `GroupSuitabilitySignals` vector, directly
  unit-tested by a characterization test. Behavior-preserving (verbatim weights;
  determinism + variety-flip tests green). This is primarily a cohesion /
  single-source-of-truth / testability win, not a large state-space collapse —
  recorded honestly per the skill's mandate.
- **Op / stage / step responsibility split — NO CHANGE (already correct).** The
  pure `kind:plan` op owns planning *truth* (suitability, selection, fallbacks);
  `derive-placement-inputs` is the boundary step that forwards policy/signals so
  the op stays engine-/policy-free; `place-natural-wonders` owns
  materialization/retry/telemetry. This already satisfies the architecture
  invariants (`core-stays-pure`, `truth-and-projection-separate`,
  `steps-have-explicit-contracts`); moving logic either way would violate a
  boundary or lose testability, so no refactor earns its diff.
