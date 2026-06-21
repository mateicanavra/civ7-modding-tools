# Civ7 Natural Wonders — Consolidated Authoritative Scope

Synthesis of 5 evidence-based facet reports + direct re-verification against game data and generated tables. All paths absolute under the worktree root `…/wt-agent-A-mapgen-oddr-consumer-migration` (abbreviated `<WT>`).

---

## 0. Executive summary

- **Full natural-wonder set in game data = 20** (20 distinct `Feature_NaturalWonders` rows across 5 XML files; reconfirmed: exactly 20 `naturalWonderTiles` entries in `civ7-tables.gen.ts`).
- **Codebase exposes only 10** through `NATURAL_WONDER_CATALOG` (verified at runtime against built dist: `NATURAL_WONDER_CATALOG.length === 10`).
- **10 wonders are silently dropped** by the policy-layer support filter (`isSupportedNaturalWonder`): 6 by missing 4-tile placement classes (`FOURPARALLELAGRM`/`FOURADJACENT`/`FOURL`), 3 by unsupported placement tags, 1 by the `placeFirst && tiles>1` guard.
- **Variety root cause (one line):** a purely deterministic greedy planner (zero RNG/seed) walking an ascending-`featureType`-sorted catalog that is *half-size and ≤ the target count*, so the same lowest-id wonders saturate every run.
- **Parity bug (one line):** multi-tile footprints are laid out from a single parity-agnostic offset table (`CIV7_DIRECTION_OFFSETS`, equals odd-row offsets) with no `y&1` branch, so even-row-anchored wonders compute the wrong cells; the live engine (odd-R adjacency) rejects them via readback-mismatch while MockAdapter (write-and-echo) masks it.

---

## 1. Reconciliation of cross-facet contradictions

| Topic | Facet claim(s) | Resolution (with re-verification) |
|---|---|---|
| Total wonders | gamedata: "20 distinct `Feature_NaturalWonders` rows". policy/adapter/pipeline: "20 features carry `naturalWonderTiles`" | **AGREE = 20.** Re-verified: `grep -c naturalWonderTiles civ7-tables.gen.ts` = 20; feature ids {0,1,28-45}. No contradiction. |
| "Civ7 base game ships ~24 unique NWs" (pipeline facet) | pipeline facet speculates the full game has ~24 | **Flagged as unsupported.** The gamedata facet exhaustively swept all `resources/` and found exactly 20 `Feature_NaturalWonders` rows. The "~24" is a guess from general knowledge, NOT evidence in this data tree. Authoritative count for THIS data = **20**. Treated as an open question only if the data tree is later found incomplete. |
| asia-wonders as NW source | brief hypothesized; gamedata facet refuted | **Refuted.** asia-wonders ships constructed (`ConstructibleClass="WONDER"`) wonders, no `Feature_NaturalWonders`. Out of NW scope. |
| Catalog survivors | policy facet, pipeline facet, adapter facet all list the same 10 | **AGREE.** Re-verified against built dist: featureTypes [30,32,34,35,36,38,39,40,41,42], with Fuji dir=2, Vihren dir=1. |
| Parity table = odd-row offsets | policy facet | **Confirmed.** `CIV7_DIRECTION_OFFSETS` = `[(1,1)(1,0)(1,-1)(0,-1)(-1,0)(0,1)]` ≡ `OFFSETS_ODD_ROW` in `hex-oddq.ts`. Even-row engine offsets differ in dirs 0,2,3,5 (only 1,4 invariant). |
| Mount Everest source module | gamedata facet: base-standard (loaded via base-standard.modinfo) | **Accepted.** Everest + Bermuda load under base-standard's UpdateDatabase action group; they are base-standard wonders, not separate DLC. Module-of-origin is metadata only; it does not change the corpus. |

No remaining hard contradictions. The only soft disagreement (the "~24" aside) is resolved in favor of the exhaustive sweep: **20**.

---

## 2. THE COMPLETE WONDER TABLE (all 20)

Legend: **inCat** = `inMapPolicyCatalog` (survives `isSupportedNaturalWonder`, i.e. present in `NATURAL_WONDER_CATALOG`); **inMod** = `inModPolicies` (reaches the recipe planner — same set as inCat, since recipe re-applies the identical filter via `getNaturalWonderFootprintOffsets` in `derive-placement-inputs/inputs.ts`); **onMap** = `appearsOnMaps` (planned + stamped today). PlacementClass / tiles / tags / terrain / biome all re-verified directly from `civ7-tables.gen.ts`.

| id | FeatureType | Display name | PlacementClass | tiles | dir | tags | inCat | inMod | onMap | excluded | exclude reason |
|----|-------------|--------------|----------------|-------|-----|------|-------|-------|-------|----------|----------------|
| 0  | FEATURE_BERMUDA_TRIANGLE | Bermuda Triangle | THREETRIANGLEDEEPOCEAN | 3 | -1 | ADJACENTTOCOAST, NOTADJACENTTOLAND | no | no | no | YES | unsupported tags ADJACENTTOCOAST, NOTADJACENTTOLAND |
| 1  | FEATURE_MOUNT_EVEREST | Mount Everest | FOURPARALLELAGRM | 4 | -1 | ADJACENTTOSAMEBIOME, NOTADJACENTTORIVER, NOTNEARCOAST | no | no | no | YES | placementClass FOURPARALLELAGRM → footprint null |
| 28 | FEATURE_VALLEY_OF_FLOWERS | Valley of Flowers | TWOADJACENT | 2 | -1 | ADJACENTMOUNTAIN, NOTNEARCOAST | no | no | no | YES | placeFirst && tiles>1 (gate 2) |
| 29 | FEATURE_BARRIER_REEF | Great Barrier Reef | FOURADJACENT | 4 | -1 | ADJACENTTOLAND, FEATURE_REEF, NOTADJACENTTOICE, SHALLOWWATER | no | no | no | YES | placementClass FOURADJACENT → footprint null |
| 30 | FEATURE_REDWOOD_FOREST | Redwood Forest | THREETRIANGLE | 3 | -1 | FEATURE_FOREST | YES | YES | YES | no | — |
| 31 | FEATURE_GRAND_CANYON | Grand Canyon | FOURPARALLELAGRM | 4 | -1 | NOTADJACENTTORIVER, NOTNEARCOAST | no | no | no | YES | placementClass FOURPARALLELAGRM → footprint null (also minElev=350) |
| 32 | FEATURE_GULLFOSS | Gullfoss | ONE | 1 | -1 | WATERFALL | YES | YES | YES | no | — (placeFirst but tiles==1, gate 2 doesn't fire) |
| 33 | FEATURE_HOERIKWAGGO | Hoerikwaggo | FOURL | 4 | -1 | (none) | no | no | no | YES | placementClass FOURL → footprint null |
| 34 | FEATURE_IGUAZU_FALLS | Iguazú Falls | ONE | 1 | -1 | WATERFALL | YES | YES | YES | no | — (placeFirst but tiles==1) |
| 35 | FEATURE_KILIMANJARO | Mount Kilimanjaro | THREETRIANGLE | 3 | -1 | VOLCANO | YES | YES | YES | no | — |
| 36 | FEATURE_ZHANGJIAJIE | Zhangjiajie | TWOADJACENT | 2 | -1 | (none) | YES | YES | YES | no | — |
| 37 | FEATURE_THERA | Thera | FOURPARALLELAGRM | 4 | -1 | ADJACENTTOLAND, NOTADJACENTTOICE, SHALLOWWATER, VOLCANO | no | no | no | YES | placementClass FOURPARALLELAGRM → footprint null |
| 38 | FEATURE_TORRES_DEL_PAINE | Torres del Paine | THREETRIANGLE | 3 | -1 | (none) | YES | YES | YES | no | — |
| 39 | FEATURE_ULURU | Uluru | ONE | 1 | -1 | ADJACENTTOSAMEBIOME, NOTADJACENTMOUNTAIN | YES | YES | YES | no | — |
| 40 | FEATURE_MACHAPUCHARE | Machapuchare | THREETRIANGLE | 3 | -1 | (none) | YES | YES | YES | no | — |
| 41 | FEATURE_MOUNT_FUJI | Mount Fuji | THREETRIANGLE | 3 | 2 | VOLCANO | YES | YES | YES | no | — |
| 42 | FEATURE_VIHREN | Vihren | THREETRIANGLE | 3 | 1 | (none) | YES | YES | YES | no | — |
| 43 | FEATURE_VINICUNCA | Vinicunca | FOURPARALLELAGRM | 4 | -1 | (none) | no | no | no | YES | placementClass FOURPARALLELAGRM → footprint null |
| 44 | FEATURE_GREAT_BLUE_HOLE | Great Blue Hole | ONE | 1 | -1 | ADJACENTTOSAMETERRAIN, NOTADJACENTTOICE, SHALLOWWATER | no | no | no | YES | unsupported tag ADJACENTTOSAMETERRAIN |
| 45 | FEATURE_MAPU_A_VAEA_BLOWHOLES | Mapu 'a Vaea Blowholes | TWO | 2 | -1 | ADJACENTCLIFF, ADJACENTTOLAND, NOLANDOPPOSITECLIFF, NOTADJACENTTOICE, SHALLOWWATER | no | no | no | YES | unsupported tags ADJACENTCLIFF, NOLANDOPPOSITECLIFF |

**Totals: 20 total / 10 in catalog / 10 in mod policies / 10 appear on maps / 10 excluded.**

### Excluded breakdown by root cause
- **6 — missing 4-tile placement classes** (footprint switch returns null): Mount Everest (1), Barrier Reef (29), Grand Canyon (31), Hoerikwaggo (33), Thera (37), Vinicunca (43). Classes: FOURPARALLELAGRM ×4, FOURADJACENT ×1, FOURL ×1. Note Bermuda's `THREETRIANGLEDEEPOCEAN` IS handled by the switch — Bermuda is dropped by tags, not class.
- **3 — unsupported placement tags**: Bermuda Triangle (0: ADJACENTTOCOAST, NOTADJACENTTOLAND), Great Blue Hole (44: ADJACENTTOSAMETERRAIN), Mapu 'a Vaea (45: ADJACENTCLIFF, NOLANDOPPOSITECLIFF).
- **1 — placeFirst && tiles>1 guard**: Valley of Flowers (28). (Gullfoss/Iguazu are placeFirst but tiles==1, so they survive.)

Tags present in data but absent from `SUPPORTED_POLICY_TAGS` (each excludes its wonder): `ADJACENTTOCOAST`, `NOTADJACENTTOLAND`, `ADJACENTTOSAMETERRAIN`, `ADJACENTCLIFF`, `NOLANDOPPOSITECLIFF` (and `IN_LAKE`, which only hits non-NW Lotus).

---

## 3. Game-data corpus provenance (5 source files)

`Feature_NaturalWonders` rows exist in exactly 5 XML files (exhaustive sweep):

| File | Module | Wonders |
|---|---|---|
| `Base/modules/base-standard/data/terrain.xml` | base-standard | 12 |
| `Base/modules/base-standard/data/marvelous-mountains-terrain.xml` | base-standard | 1 (Mount Everest) |
| `Base/modules/base-standard/data/racetowonders-terrain.xml` | base-standard | 1 (Bermuda Triangle) |
| `DLC/mountain-natural-wonders/modules/data/terrain.xml` | DLC | 4 (Machapuchare, Fuji, Vihren, Vinicunca) |
| `DLC/water-wonders/modules/data/terrain.xml` | DLC | 2 (Great Blue Hole, Mapu 'a Vaea) |

Predicate: a Feature is a natural wonder iff it has a `Feature_NaturalWonders` row (equivalently, `naturalWonderTiles` present in generated `featurePolicies`). There is no `FeatureClass="Wonder"`. asia-wonders = 0 NWs (constructed wonders only).

---

## 4. Base-game placement algorithm (parity target)

`addNaturalWonders` → `placeWonders` (`Base/modules/base-standard/maps/natural-wonder-generator.js`):
1. **Pool** = one `$hash` per `Feature_NaturalWonders` row (singleton per wonder ⇒ each placed at most once).
2. **Variety** = Fisher–Yates `shuffle` of the pool via engine RNG `TerrainBuilder.getRandomNumber` (line 34). No weighting, no recurrence memory, no cross-map state.
3. **Requested wonders** front-pinned (config `RequestedNaturalWonders` + event wonders) and forced to 100% chance.
4. **Two passes**: `PlaceFirst==true` first (no roll), then `PlaceFirst==false` (rolled). Both stop at `iNumNaturalWonders` (from `Maps.NumNaturalWonders`: TINY=3 … HUGE=7).
5. **`Direction` is -1 for every base wonder** (schema default; no row sets it except DLC Fuji=2, Vihren=1). Footprint shape + orientation owned by C++ `canHaveFeatureParam`/`setFeatureType` via `PlacementClass`.
6. **All terrain/biome/adjacency/elevation/river/spacing gating delegated to `canHaveFeatureParam`** (engine). JS does only a brute-force grid scan + uniform-random anchor pick.
7. Multi-tile footprints stamped atomically by `setFeatureType`. No JS-side sub-resource stamping.
8. Runs once at GenerateMap (after biomes, before floodplains/resources/starts); does NOT re-run on age transitions.

Key contrast vs. the mod pipeline: **base uses RNG shuffle for variety; the mod planner uses zero RNG** (see §6).

---

## 5. Parity bug — full site map

### Defect
`CIV7_DIRECTION_OFFSETS` (`<WT>/packages/civ7-map-policy/src/natural-wonder-footprints.ts:12-19`) is a single parity-agnostic 6-entry table that equals odd-row offsets exactly. Applied via `directionOffset()` and added to the anchor in `getNaturalWonderFootprintIndices` (`:94-116`) and in the planner's local `getFootprintIndices` with **no `y&1` branch**. On EVEN-row anchors, dirs 0,2,3,5 diverge from the engine (`getAdjacentPlotLocation`); only dirs 1,4 are parity-invariant.

Engine-divergent EVEN-row offsets (vs committed/odd):
| dir | committed (==ODD) | EVEN engine | matches? |
|----|----|----|----|
| 0 | (1,1) | (0,1) | no |
| 1 | (1,0) | (1,0) | yes |
| 2 | (1,-1) | (0,-1) | no |
| 3 | (0,-1) | (-1,-1) | no |
| 4 | (-1,0) | (-1,0) | yes |
| 5 | (0,1) | (-1,1) | no |

Canonical parity-correct source already exists: `<WT>/packages/mapgen-core/src/lib/grid/neighborhood/hex-oddq.ts:13-37` (`OFFSETS_ODD_ROW`/`OFFSETS_EVEN_ROW`, keyed `(y&1)`).

### Footprint parity sites (need parity-at-anchor — bug-bearing)
1. **`<WT>/packages/civ7-adapter/src/civ7-adapter.ts:950-1026`** — live `placeNaturalWonder`; computes footprint at real (x,y) then readback-verifies per cell. **Where the bug surfaces live** (readback-mismatch / empty-/partial-expected-footprint on even rows).
2. **`<WT>/packages/civ7-adapter/src/mock-adapter.ts:1360-1447`** — mock `placeNaturalWonder`; writes-and-echoes the SAME parity-naive cells → **masks the bug** (tautologically green).
3. **`<WT>/mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/place-natural-wonders/materialize.ts:337-449`** — recipe materialization; parity-naive footprint for occupancy/terrain pre-check + local readback.
4. **`<WT>/mods/mod-swooper-maps/src/domain/placement/ops/plan-natural-wonders/strategies/default.ts:200-207,271-291,504-528`** — planner: eligibility (`isCandidateCompatibleWithFeature`) and spacing reservation use parity-naive footprint at candidate anchor.
5. **`<WT>/mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/derive-placement-inputs/inputs.ts:157-181`** — precomputes a single anchor-independent `footprintOffsets` list (can't be parity-correct for both parities; structural reason planner can't be fixed by data alone — must apply parity when landing offsets at a concrete anchor).

### Diagnostics sites (read-only, mis-report on even rows)
6–8. `<WT>/mods/mod-swooper-maps/src/dev/diagnostics/surface-delta-context.ts:606-699,1147-1253`.

### Anchor-independent (do NOT need parity — offsets used only as shape/count)
`natural-wonders.ts:39`, `verify-manual-catalogs.ts:32`, `inputs.ts:164` (shape only).

### Why invisible in CI
Mock writes+reads same wrong cells; the one pinned footprint test (`map-policy.test.ts:200-213`) uses anchor (64,**13**) = ODD row where buggy==engine. No EVEN-row footprint test exists.

---

## 6. Variety root cause(s) — evidence

1. **Zero randomness in the mod NW pipeline.** No seed/random/shuffle anywhere in `plan-natural-wonders`, `derive-placement-inputs`, `place-natural-wonders` (grep-empty across `MOD/domain/placement`). No seed in `PlanNaturalWondersContract`. (Contrast: base game DOES use a Fisher–Yates shuffle for variety — `natural-wonder-generator.js:34`.)
2. **Catalog sorted ascending by `featureType`; planner walks it in order and breaks at target.** `default.ts:72-91` sort; `default.ts:153-154` loop. Chosen *set* is always the lowest-id survivors, same order.
3. **Deterministic tile choice.** Priority `clamp01(reliefN*0.75 + (1-aridity)*0.15 + river*0.1)` then sort `(priority desc, relief desc, plotIndex asc)`, first-fit (`default.ts:127,136-140,578-616`). Identical physics → identical tile.
4. **Catalog is half-size (10) and ≤ typical target.** `targetCount = min(wondersCount, featureCatalog.length, candidates.length)` saturates at 10; the loop places essentially every catalog wonder it can fit, so there is no surplus pool to vary over. A seed/shuffle alone would barely change output until the catalog grows past the target.

**Net:** two compounding causes — (a) **catalog truncation to 10 of 20** (footprint-class + tag coverage gaps), and (b) **fully deterministic greedy selection with no seeded sampling/tie-break**. Fixing variety requires BOTH: grow the placeable corpus AND introduce seeded selection.

---

## 7. Constraint wiring status (mod pipeline)

- Terrain/biome — WIRED, dual-checked (planner `default.ts:516-526`; materialize `ensureFeatureValidTerrain` 225-244, will mutate terrain to first valid).
- Feature tags — WIRED but only 12 (`satisfiesFeatureTags` `default.ts:343-485`; FEATURE_FOREST/FEATURE_REEF/SHALLOWWATER/VOLCANO accepted as no-ops; any other tag → `return false`). Same gap as the catalog filter.
- minimumElevation / noLake — WIRED (`default.ts:548-553`, `:527`).
- Polar exclusion — WIRED (`buildNaturalWonderBlockedMask` `inputs.ts:107-118`; enforced `default.ts:512`, `materialize.ts:234`).
- Spacing — WIRED, deterministic, with relaxation fallback (`hexDistanceOddQPeriodicX`, `default.ts:601-612`, `:178-198`).
- **Sub-resources — MISSING.** NW path places features only via `adapter.placeNaturalWonder` (`materialize.ts:397-403`). No resource/yield/sub-resource attachment. (Game data ties some wonders to GameModifiers / District_FreeConstructibles / random events, but none of that is modeled here. Mount Everest reveal-all-mountains, Fuji volcano event, Bermuda teleport/yields, expedition-base improvements — all unrepresented.)

---

## 8. Adapter / browser-tables masking

- Both `Civ7Adapter.getNaturalWonderCatalog()` (`civ7-adapter.ts:1280-1282`) and `MockAdapter` (`mock-adapter.ts:1571-1576`) return the SAME truncated 10-entry const. No live enumeration of `GameInfo.Features`/`Feature_NaturalWonders` to recover the full 20.
- Catalog entry type is only `{ featureType, direction }` (`packages/civ7-map-policy/src/types.ts:1-4`) — no sub-resource/variant/terrain payload travels with it.
- **The mask is structural**, not at the catalog level: mock = propose→static-validate→write→echo (no readback, partial `canHaveFeatureByStaticPolicy` modeling only terrain/biome/elevation/unsupported-tag); live = propose→engine `canHaveFeatureParam` (full C++ adjacency/cliff/ice/coast rules)→write→readback-verify. Mock-valid footprints can be engine-rejected.
- **Tests lock in the truncation**: `natural-wonder-catalog.test.ts:12-15` asserts equality to the truncated const AND `not.toContain(BARRIER_REEF)`; `map-policy.test.ts:184-226` asserts the 10-subset and excludes BARRIER_REEF; `verify-manual-catalogs.ts:24-47` throws on length mismatch (10-entry release gate). Diagnostics iterate only the 10 (`surface-delta-context.ts:691`), so even debug telemetry is blind to the dropped 10.

---

## 9. Full change set (covers BOTH parity fix AND full-wonder variety)

### A. Footprint parity fix
- **A1.** Replace `CIV7_DIRECTION_OFFSETS` single table with parity-aware offsets (odd/even keyed on `y&1`), or import/reuse `hex-oddq.ts` offsets. Make `getNaturalWonderFootprintIndices` (and any anchor-landing path) branch on `anchorY & 1`. Risk: medium — central; every footprint consumer changes shape on even rows.
- **A2.** Change the planner contract so footprints are derived at the concrete anchor (parity-aware), not from a single precomputed anchor-independent offset list. `inputs.ts` must ship a parity-aware footprint function (or policy) instead of a static offset list; `default.ts` `getFootprintIndices` must apply parity at the candidate anchor (eligibility + spacing). Risk: medium-high — touches eligibility, spacing, plan shape.
- **A3.** Fix live readback path expectation only insofar as it now matches engine cells (no logic change to `civ7-adapter.ts` placement itself beyond consuming the corrected footprint). Risk: low.
- **A4.** Make MockAdapter compute the footprint with the SAME parity-aware engine model it already keeps (`ODD_R_NEIGHBORS_*` at `mock-adapter.ts:256-272`) so it stops masking. Risk: medium — will newly surface previously-hidden failures.
- **A5.** Fix diagnostics footprint readers (`surface-delta-context.ts`) to parity-aware so telemetry is accurate. Risk: low (read-only).
- **A6.** Add EVEN-row footprint tests (the current blind spot): assert footprint cells for an even-row anchor for TWO/TWOADJACENT/THREETRIANGLE/THREETRIANGLEDEEPOCEAN and each new 4-tile class, against engine ground truth. Risk: low.

### B. Full-wonder coverage (recover the dropped 10)
- **B1.** Implement the missing 4-tile placement classes in `getNaturalWonderFootprintOffsets`: `FOURPARALLELAGRM`, `FOURADJACENT`, `FOURL` (recovers Everest, Barrier Reef, Grand Canyon, Hoerikwaggo, Thera, Vinicunca). These MUST be parity-aware (depends on A1). Risk: high — geometry must match the engine's C++ footprint exactly per parity; needs live readback validation.
- **B2.** Extend `SUPPORTED_POLICY_TAGS` and the planner's `satisfiesFeatureTags` to handle `ADJACENTTOCOAST`, `NOTADJACENTTOLAND`, `ADJACENTTOSAMETERRAIN`, `ADJACENTCLIFF`, `NOLANDOPPOSITECLIFF` (recovers Bermuda, Great Blue Hole, Mapu 'a Vaea). Risk: medium — new adjacency predicates (coast/cliff/opposite-cliff) need correct odd-R neighbor semantics.
- **B3.** Resolve Valley of Flowers (28): support `placeFirst && tiles>1` (drop or rework gate 2) so multi-tile placeFirst wonders are placeable. Risk: low-medium — requires honoring placeFirst ordering in the planner.
- **B4.** Update tests + verify-manual-catalogs.ts length gate from 10 → 20 (or to the actually-supported count). Flip `natural-wonder-catalog.test.ts` / `map-policy.test.ts` assertions to EXPECT the recovered wonders (e.g. BARRIER_REEF now present). Risk: medium — these tests currently certify truncation.

### C. Variety (after corpus is whole)
- **C1.** Introduce a seeded shuffle/sampling into the planner selection (mirror base-game Fisher–Yates), threading the map seed into `PlanNaturalWondersContract`, so the chosen subset varies run-to-run. Risk: medium — must remain deterministic-per-seed for repro.
- **C2.** Consider a request/pin channel + placeFirst honoring to mirror base behavior (optional parity nicety). Risk: low.

### D. (Out of immediate NW-variety scope, flag) Sub-resource / tied-modifier wiring
- **D1.** Decide whether to model wonder-tied sub-resources/modifiers (Fuji volcano event, Everest reveal, Bermuda yields/teleport, expedition-base improvements). Currently entirely unwired. Risk: high / large — likely a separate workstream; not required for variety+parity.

---

## 10. Footprint parity sites (consolidated, for the parity fix)

| # | File | Change needed |
|---|---|---|
| 1 | `<WT>/packages/civ7-map-policy/src/natural-wonder-footprints.ts:12-19,67-116` | parity-aware offset table + `y&1` branch in indices builder; implement FOUR* classes |
| 2 | `<WT>/packages/civ7-adapter/src/civ7-adapter.ts:950-1026` | consume corrected parity-aware footprint (bug surfaces here live) |
| 3 | `<WT>/packages/civ7-adapter/src/mock-adapter.ts:1360-1447` | compute footprint via parity-aware engine model (stop masking) |
| 4 | `<WT>/mods/mod-swooper-maps/.../place-natural-wonders/materialize.ts:337-449` | parity-aware footprint for occupancy/terrain/readback |
| 5 | `<WT>/mods/mod-swooper-maps/.../plan-natural-wonders/strategies/default.ts:200-207,271-291,504-528` | parity-aware footprint at candidate anchor (eligibility + spacing) |
| 6 | `<WT>/mods/mod-swooper-maps/.../derive-placement-inputs/inputs.ts:157-181` | ship parity-aware footprint fn, not anchor-independent offset list |
| 7 | `<WT>/mods/mod-swooper-maps/src/dev/diagnostics/surface-delta-context.ts:606-699,1147-1253` | parity-aware footprint reads (telemetry accuracy) |
| 8 | `<WT>/mods/mod-swooper-maps/scripts/placement/verify-manual-catalogs.ts:24-47` | update length gate; offsets-as-shape OK |

---

## 11. Open questions for Inquiry Design

1. **Full set authority:** the gamedata sweep found exactly 20 `Feature_NaturalWonders` rows; the pipeline facet's "~24 in base game" is unverified in this data tree. Is the `resources/` snapshot complete, or are additional DLC packs expected that we should design the catalog to absorb? (Affects whether the target is 20 or a moving number.)
2. **FOUR* footprint geometry per parity:** for `FOURPARALLELAGRM`/`FOURADJACENT`/`FOURL`, what are the engine's exact even-row vs odd-row cell sets? The C++ owns this; we have no JS table. Do we derive them empirically via live `getAdjacentPlotLocation` readback, and how do we validate without shipping broken maps?
3. **New adjacency predicates:** `ADJACENTTOCOAST`, `NOTADJACENTTOLAND`, `ADJACENTTOSAMETERRAIN`, `ADJACENTCLIFF`, `NOLANDOPPOSITECLIFF` — exact engine semantics (esp. cliff and "no land opposite cliff" geometry) and odd-R neighbor handling. Reverse-engineer from engine behavior or accept conservative supersets?
4. **placeFirst semantics in the planner:** does the mod planner need to honor PlaceFirst ordering (grab scarce tiles first) to place Valley of Flowers correctly, or is removing gate 2 sufficient?
5. **Variety target:** what is the desired variety contract — uniform random subset like base game, weighted, or per-map biome-aware? Must it be deterministic-per-seed for repro/tests?
6. **Test contract flip:** confirm we are authorized to change the locked tests (`natural-wonder-catalog.test.ts`, `map-policy.test.ts`, `verify-manual-catalogs.ts`) that currently assert truncation, and what the new expected count is (20 vs supported-subset).
7. **Sub-resources/modifiers:** in scope for this workstream or deferred? (Recommend deferred — large, orthogonal to variety+parity.)
8. **Live verification gate:** parity + FOUR* correctness can only be proven against the live engine (MockAdapter masks). What is the live-render closure gate (Scripting.log readback-match for even-row anchors across all 20)?

---

## 12. Key files index (absolute)

- Parity table + filter + footprint switch: `<WT>/packages/civ7-map-policy/src/natural-wonder-footprints.ts`
- Catalog filter: `<WT>/packages/civ7-map-policy/src/catalogs/natural-wonders.ts`
- Generated tables (source of truth for policies/tags/terrains): `<WT>/packages/civ7-map-policy/src/civ7-tables.gen.ts`
- Table generator/verifier: `<WT>/packages/civ7-map-policy/scripts/verify.ts`
- Canonical parity offsets: `<WT>/packages/mapgen-core/src/lib/grid/neighborhood/hex-oddq.ts`
- Live adapter (bug surfaces): `<WT>/packages/civ7-adapter/src/civ7-adapter.ts`
- Mock adapter (masks bug): `<WT>/packages/civ7-adapter/src/mock-adapter.ts`
- Planner: `<WT>/mods/mod-swooper-maps/src/domain/placement/ops/plan-natural-wonders/strategies/default.ts`
- Plan inputs: `<WT>/mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/derive-placement-inputs/inputs.ts`
- Materialize: `<WT>/mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/place-natural-wonders/materialize.ts`
- Diagnostics: `<WT>/mods/mod-swooper-maps/src/dev/diagnostics/surface-delta-context.ts`
- Game data: `…/.civ7/outputs/resources/Base/modules/base-standard/data/terrain.xml` (+ marvelous-mountains, racetowonders, DLC mountain/water terrain.xml)
- Base placement algorithm: `…/.civ7/outputs/resources/Base/modules/base-standard/maps/natural-wonder-generator.js`
- Tests (truncation lock-in): `<WT>/packages/civ7-adapter/test/natural-wonder-catalog.test.ts`, `<WT>/packages/civ7-map-policy/test/map-policy.test.ts`, `<WT>/mods/mod-swooper-maps/scripts/placement/verify-manual-catalogs.ts`
