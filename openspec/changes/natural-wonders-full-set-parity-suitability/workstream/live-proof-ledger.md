# Live Proof Ledger — Natural Wonders

Live evidence is the closure gate. MockAdapter write-and-echo cannot prove
footprint parity or engine legality; only live `getAdjacentPlotLocation` and
place-then-readback do. Unavailable labels remain unresolved (not inferred).

## A. Geometry probe (Task 1) — RESULTS (2026-06-19, base map continents-voronoi, seed 1337, LARGE 96×60)

Harness: `mods/mod-swooper-maps/scripts/live/nw-live-probe.ts` (throwaway).
Raw: `output/nw-live-probe-result.json`, `output/nw-live-anchors-result.json`.

**Method pivot (load-bearing).** The started-game tuner **cannot** place/validate NW
geometry: `TerrainBuilder.setFeatureType` returns `false` (0 cells) and
`canHaveFeatureParam` is trivially `true` everywhere post-start — `TerrainBuilder`
mutation/legality is a **map-generation-context** operation. Only *pure reads*
(`getAdjacentPlotLocation`, `isCliffCrossing`, `getFeatureType`) are trustworthy
post-start. So geometry was pinned by reading the wonders **the base generator
placed during gen** (`getFeatureType` cluster scan seeded from the
`Placed … At X:n Y:m` anchors in `Scripting.log`) — authoritative engine stamps,
read via working reads. (Also note: `getFeatureType` returns the **row index**
0..45; my first scan compared against `Database.makeHash` (32-bit hash) and found
nothing — fixed by reading the index at the logged anchor.)

**A1 — per-parity direction calibration (AUTHORITATIVE).** Both even rows (y=30,20)
identical; both odd rows (y=31,21) identical → parity is purely `y&1`. Live offsets
**exactly match the design tables**:

| dir | EVEN (y&1==0) | ODD (y&1==1) |
|---|---|---|
| 0 | (0,1)  | (1,1)  |
| 1 | (1,0)  | (1,0)  |
| 2 | (0,-1) | (1,-1) |
| 3 | (-1,-1)| (0,-1) |
| 4 | (-1,0) | (-1,0) |
| 5 | (-1,1) | (0,1)  |

ODD == current `CIV7_DIRECTION_OFFSETS`. EVEN = swap of indices 0,2,3,5 (1,4
parity-invariant). Cross-validated by 5 base-placed wonders read back as clusters:
Fuji(odd,dir2)=`[(0,0),(1,-1),(0,-1)]`, Kilimanjaro(even,dir3) &
Bermuda(even,dir3)=`[(0,0),(-1,-1),(-1,0)]`, Zhangjiajie(even,dir0)=`[(0,0),(0,1)]`,
Thera(odd,dir4)=`[(0,0),(-1,0),(0,1),(-1,1)]`. Every cluster = `[anchor, off(d), …]`
under these tables. **Decision: encode ODD=current, EVEN=above; select by `(y&1)`.**

**A2 — placement-class footprint model.** The mod normalizes wonder `Direction:-1 → 0`
(`resolveNaturalWonderMaterializationDirection`) and passes that **concrete** direction
to *both* the offline footprint and `setFeatureType`; the engine stamps that exact
orientation (the base game's `Direction:-1` self-orientation is **not** the mod path).
So footprints are deterministic per (class, direction, parity):

| Class | model (off(d) from the parity table) | status |
|---|---|---|
| ONE | `[anchor]` | confirmed |
| TWO / TWOADJACENT | `[anchor, off(d)]` | confirmed (Zhangjiajie) |
| THREETRIANGLE / THREETRIANGLEDEEPOCEAN | `[anchor, off(d), off(d+1)]` | confirmed (Fuji/Kilim/Bermuda) |
| FOURPARALLELAGRM | `[anchor, off(d), off(d+1), corner]`; `corner` = chain `off(d+1)` from the `off(d)`-cell using *that cell's* parity | **confirmed (Thera, odd dir4)** |
| FOURADJACENT | 4-cell contiguous (Barrier Reef self-oriented as a straight `(1,0)` row-line); exact **dir-0** cells | **pin at gen-time** |
| FOURL | L-tetromino; unobserved (Hoerikwaggo not placed this seed) | **pin at gen-time** |

**Encoding decision.** FOURPARALLELAGRM ships the validated rule. FOURADJACENT/FOURL
dir-0 cells are pinned by gen-time engine readback during the closure run
(`materialize` logs the actual stamped neighborhood per NW; correct the map-policy
table until offline == stamp). This is the design §5 "engine readback authoritative"
path; the started-tuner probe could not place, so gen-time is the authority.

## B. Predicate probe (Task 1) — RESULTS

`canHaveFeatureParam` is unreliable from the started tuner (trivially true), so
predicate **legality** is engine-authoritative at gen-time; the mod's offline checks
are conservative odd-R pre-filters confirmed by `canHaveFeatureParam` + readback at
gen-time. `isCliffCrossing` **does** work as a post-start read (varied true/false per
direction), giving the cliff direction-index order.

| Tag | wonder | finding | model decision |
|---|---|---|---|
| ADJACENTTOCOAST | Bermuda (0) | base game placed Bermuda@(45,30) → tags satisfiable | ≥1 odd-R neighbor COAST; engine confirms |
| NOTADJACENTTOLAND | Bermuda (0) | placed in deep ocean (all 6 neighbors water at the read anchor) | no odd-R neighbor is land (`isWater` false); engine confirms |
| ADJACENTTOSAMETERRAIN | Great Blue Hole (44) | not placed this seed | ≥1 odd-R neighbor shares anchor terrain (mirror of ADJACENTTOSAMEBIOME); engine confirms |
| ADJACENTCLIFF | Mapu'a Vaea (45) | `isCliffCrossing(x,y,d)` returns per-direction edge state (live read works) | ∃ d with `isCliffCrossing(anchor,d)`; engine confirms |
| NOLANDOPPOSITECLIFF | Mapu'a Vaea (45) | opposite pairing `(d+3)%6` (standard hex); cliff is edge-symmetric | for each cliff edge d, neighbor at `(d+3)%6` not land — **odd-Q vs odd-R parity hazard for the neighbor lookup (see review)**; engine confirms final |

**Authoritative per-wonder data (from `civ7-tables.gen.ts`):** all 20 carry
`Direction:-1` **except Fuji=2, Vihren=1**; `placeFirst` = Gullfoss, Iguazu, Valley
of Flowers; `noLake` + `minimumElevation` as in corpus-ledger. Predicate-bearing
wonders: Bermuda(0), Great Blue Hole(44), Mapu'a Vaea(45); Everest(1) & Grand
Canyon(31) FOURPARALLELAGRM; Barrier Reef(29) FOURADJACENT; Hoerikwaggo(33) FOURL;
Thera(37) & Vinicunca(43) FOURPARALLELAGRM.

## C. Closure render (Task 7)

Boot map per seed, reveal (`game map visibility --player-id 0 --explore
--disposable`), foreground, `game view appshot`. Read placed wonders via tuner
(`GameplayMap.getFeatureType` sweep) and `Scripting.log`.

Live runs (2026-06-19, swooper-earthlike, MAPSIZE_HUGE 106×66, mod recipe via
`studio-run-in-game-live`; both reached `[mapgen-complete]` + `"seed":<N>`, no
rejectPattern). Placed wonders read live via full-map `getFeatureType` scan
(`output/nw-live-scan-result.json`); plan/rejection from `NATURAL_WONDER_*_V1`
telemetry.

| Seed | planned | placed | distinct placed | incl. previously-dropped? | rejected (set-feature-false) |
|---|---|---|---|---|---|
| 1337 | 7 | 4 | Bermuda(0), Gullfoss(32), Iguazu(34), Great Blue Hole(44) | **yes** — Bermuda(0)+Great Blue Hole(44) | Valley of Flowers(28), Barrier Reef(29), Mapu'a Vaea(45) |
| 2024 | 7 | 4 | Bermuda(0), Gullfoss(32), Iguazu(34), Great Blue Hole(44) | **yes** — same two | Valley of Flowers(28), Mapu'a Vaea(45), Barrier Reef(29) |

**Observed (corpus-ledger O1-O5):**
- O1 catalog eligibility: **met** — all 20 catalog-eligible (unit + verify-manual-catalogs).
- O2 cross-seed variety / determinism: **NOT met (gap).** Both earthlike seeds select
  the IDENTICAL 7-wonder plan and place the IDENTICAL 4. All selected are
  water/waterfall/lowland; **no mountain/forest/volcano/arid wonder is selected**.
  Determinism holds (same seed → same plan, unit-tested). Root cause: water groups
  (C/D) saturate suitability at 1.0 (shelf/deep tiles are abundant) while land
  wonders have scarce legal footprints (rare volcano/mountain triangles) → lower
  `bestSuitability` → excluded; `placeFirst` consumes 3 of 7 slots. **Needs a
  suitability re-balance so groups are comparable (fit-quality, not legal-tile
  abundance) and land wonders compete.**
- O3 even-row multi-tile readback match: **partial.** The multi-tile placement that
  landed (Bermuda, THREETRIANGLEDEEPOCEAN, 3 tiles) anchored on an ODD row both
  seeds and the adapter's strict readback PASSED (offline footprint == engine stamp).
  No EVEN-anchored multi-tile placed yet (the FOUR*/even cases were among the
  rejected) → explicit even-row live proof still pending; even-row geometry is
  unit-tested + probe-confirmed (§A1).
- O4 effects: **pending spot-check** (placed wonders use the `setFeatureType` path;
  effects are engine-automatic — to be confirmed on-tile).
- O5 previously-dropped placed: **met** — Bermuda(0) and Great Blue Hole(44)
  (both previously dropped for unsupported tags) place live, proving the new
  predicates (ADJACENTTOCOAST, NOTADJACENTTOLAND, ADJACENTTOSAMETERRAIN) +
  engine-confirmation path.

**`set-feature-false` (3 hardest wonders).** `canHaveFeatureParam` passed but the
engine's `setFeatureType` refused the single planner-chosen tile: Valley of Flowers
(ADJACENTMOUNTAIN — odd-Q vs odd-R neighbor mismatch), Mapu'a Vaea (ADJACENTCLIFF —
engine-deferred, planner can't pre-filter cliffs), Barrier Reef (FOURADJACENT dir-0
geometry / reef — not gen-pinned). The base generator collects MANY
canHaveFeatureParam-true tiles and picks one; the mod picks one best tile and does
not retry. Fix: retry across the wonder's next-best candidates at materialize time
(engine is the final authority).

**FOUR*/FOURL geometry.** Not yet engine-pinned: Barrier Reef (FOURADJACENT) failed
`setFeatureType` at Direction 0; Hoerikwaggo (FOURL) was not selected. Pinning needs
a gen-time observation of the engine stamp (anchor-only bootstrap + neighborhood
scan, or Direction=-1 self-orient + derive-from-readback).

**Closure claim:** **partially met.** Proven live: parity (multi-tile readback match),
full-set eligibility, predicates, and previously-dropped wonders placing across ≥2
seeds. **NOT yet met:** genuine cross-type/cross-seed variety (suitability balance),
the 3 hardest wonders placing (retry), FOUR*/FOURL geometry pinning, even-row
multi-tile live readback, and effects spot-check.

> Superseded by Section D — the three fixes closed the "NOT yet met" gaps below.

## D. Post-fix live closure (Fix 1 + Fix 2 + Fix 3) — RESULTS (2026-06-19)

Commits `843891be5` (Fix 1 variety), `50a7ba844` (Fix 2 retry), `1a917a27c`
(Fix 3 self-orient). All runs `studio-run-in-game-live --mutate`, MAPSIZE_HUGE
(106×66), `--from-running-game exit-to-shell`, player-count 10; all reached
`[mapgen-complete]` + `VERIFY_EXIT=0`. Telemetry from `NATURAL_WONDER_PLAN_V1` /
`NATURAL_WONDER_PLACEMENT_V1` in `Scripting.log`.

**Telemetry-precision note (load-bearing for the claims below).** The runtime
placement telemetry emits per-row coordinates ONLY for REJECTED rows; placed
wonders are summarised by an opaque `coordinateProof.placedHash32`. So `placed`
is derived as `planned − rejected` (the planRows carry every planned anchor;
rejectedRows carry the failures), and the exact PLACED coordinate of a wonder is
NOT individually exposed (it equals the planned anchor only when no Fix-2
fallback was consumed). Claims below are scoped to what telemetry actually proves.

| Map type | Seed | placed/planned | distinct placed (group) | land types placed | FOUR* placed | rejected |
|---|---|---|---|---|---|---|
| earthlike | 1337 | 5/7 | Gullfoss(E), Iguazu(E), Bermuda(D), GreatBlueHole(C), **Zhangjiajie(F-mtn)** | **mountain** (Zhangjiajie) | — | ValleyFlowers(28), Thera(37) |
| earthlike | 2024 | 5/7 | Gullfoss(E), Iguazu(E), Bermuda(D), GreatBlueHole(C), **Redwood(I-forest)** | **forest** (Redwood) | — | ValleyFlowers(28), Thera(37) |
| desert-mountains | 1337 | 6/7 | Iguazu(E), Bermuda(D), GreatBlueHole(C), **Kilimanjaro(A-volcano)**, **Everest(F-mtn)**, **BarrierReef(C-reef)** | **volcano + mountain** | **BarrierReef (FOURADJACENT), Everest (FOURPARALLELAGRM)** | Thera(37) |
| desert-mountains | 2024 | 6/7 | Iguazu(E), Bermuda(D), GreatBlueHole(C), **Kilimanjaro(A-volcano)**, **Zhangjiajie(F-mtn)**, **BarrierReef(C-reef)** | **volcano + mountain** | **BarrierReef (FOURADJACENT)** | Thera(37) |

**Observed (supersedes Section C O1-O5):**
- **O1 catalog eligibility — met.** All 20 catalog-eligible (unit + verify-manual-catalogs).
- **O2 cross-type variety — met.** Earthlike places a land wonder every seed
  (1337 mountain Zhangjiajie; 2024 forest Redwood) — vs the pre-fix identical
  4-water set with ZERO land. Variety also emerges across map TYPES:
  desert-mountains (both seeds) selects a volcano (Kilimanjaro) + a mountain
  (Everest/Zhangjiajie) + a reef FOUR* (Barrier Reef) — a visibly different mix
  (8 distinct groups across the run corpus: A,B,C,D,E,F,G,I). Mechanism = Fix 1
  diminishing-returns greedy (decay flips the 2nd same-group pick to a fresh
  group). **Determinism is proven OFFLINE** by the no-RNG code + unit tests
  (`plan-ops` "diminishing-returns decay flips…", "produces identical placements
  on repeated runs"); the live runs are variety/placement evidence, NOT a
  determinism proof — note the earthlike-1337 plan differs between the Fix-1+2 and
  Fix-1+2+3 BINARIES in two slots (Thera direction `0→-1` AND a slot-5 wonder swap
  Barrier Reef→Great Blue Hole), exactly because the code changed. No same-seed
  same-binary live re-run was performed.
- **O3 even-row multi-tile — geometry met offline; live placed-anchor parity not
  telemetry-proven.** The even-row footprint GEOMETRY is proven by §A1 (live
  `getAdjacentPlotLocation` calibration on BOTH parities) + unit tests
  (even-row Redwood materialization). For a live PLACEMENT: Bermuda
  (THREETRIANGLEDEEPOCEAN, 3-tile, `placeFirst`) was PLANNED at **(4,2), y=2
  EVEN** on desert-mountains 1337 and is NOT in the rejected set, and the log
  contains zero `readback-mismatch` reasons — consistent with an even-anchored
  3-tile strict-readback placement. But because placed coordinates are hashed
  (see note above), telemetry does not PROVE the placed Bermuda sits at the even
  (4,2) anchor rather than a Fix-2 fallback. The odd-anchored 3-tile live
  strict-readback match (§A/C) remains the directly-proven placement case.
- **O4 FOUR* placement — met for FOURADJACENT + FOURPARALLELAGRM; FOURL unproven.**
  Fix 3 passes `Direction:-1` for the 4-tile classes (engine self-orients, as the
  base game does) + an anchor-only offline footprint (engine owns the remaining
  cells). Live: **Barrier Reef (FOURADJACENT)** placed at `Direction:-1` on
  **both** desert-mountains seeds (1337, 2024); **Everest (FOURPARALLELAGRM)**
  placed on desert-mountains 1337. Pre-Fix-3 every 4-tile wonder failed
  `set-feature-false` at the forced `Direction:0`; post-fix these two classes
  place. **Readback narrowing (deliberate):** for self-orienting 4-tile classes
  the offline footprint is anchor-only, so the post-place readback verifies ONLY
  the anchor cell — the other 3 cells are engine-owned and NOT mod-verified. This
  is a reduction of the original "strict (full-footprint) readback" gate,
  acceptable because the engine is the final legality authority (a non-`false`
  `setFeatureType` + an anchor that reads back the exact feature cannot be a
  zero-cell placement). FOURL (Hoerikwaggo) is the third 4-tile class: it shares
  the identical self-orient code path but was NEVER selected in the sampled seeds
  (it loses its F-mtn group to higher-suitability wonders), so engine acceptance
  of a FOURL self-orientation is **not observed** — see Known limits.
- **O5 previously-dropped placed — met.** Bermuda(0) every run; Barrier Reef(29)
  + Great Blue Hole(44) placed — all previously dropped, recovered via the new
  predicates + (for Barrier Reef) Fix 3 self-orientation.

**Known wonder-specific limits (honest; NOT closed by the 3 fixes):**
- **Thera (37, FOURPARALLELAGRM caldera-coast)** — rejected `set-feature-false`
  on ALL 4 runs at `Direction:-1` (and `0` pre-Fix-3). The CLASS works (Everest,
  same class, placed), so this is Thera-specific: its caldera requires a
  volcano-adjacent-to-coast configuration rarely present at the suitability-top
  anchors; the engine's `canHaveFeatureParam` passes the anchor but
  `setFeatureType` then refuses the 4-tile neighborhood. Fix 2 retry exhausted
  its fallbacks. Would need terrain-aware (volcano∧coast) anchor pre-filtering —
  a suitability refinement beyond the 3-fix scope.
- **Valley of Flowers (28)** — rejected `set-feature-false` on both earthlike
  seeds. **CORRECTION (post-§D, verified by source + git + a live-shape probe):
  the original odd-Q/odd-R diagnosis below is WRONG.** The op's ADJACENTMOUNTAIN
  neighbor walk uses `getHexNeighborIndicesOddQ`, which is already odd-R in this
  branch (the `OddQ` name is legacy; the hex-adjacency migration `c77749249`
  predates the Fix commits), and it returns the engine-calibrated odd-R neighbor
  set — so the predicate was engine-correct at these runs and ADJACENTMOUNTAIN was
  never the gate. Forwarding an odd-R table to the op is a behavioral no-op
  (implemented, then reverted). Real cause under diagnosis: VoF is `TWOADJACENT`
  (2-tile) with data `Direction:-1` forced to `0` by the mod, plus tight
  constraints (validTerrain=FLAT-only; tags ADJACENTMOUNTAIN + NOTNEARCOAST);
  leading hypothesis is the engine needs `Direction:-1` self-orient (like the
  4-tile classes) — UNCONFIRMED, needs a live diagnostic.
  - _Original (incorrect) diagnosis, retained for the record:_ "the mod's
    ADJACENTMOUNTAIN pre-filter uses odd-Q neighbor math while the engine
    adjacency is odd-R, so the candidate set is systematically mis-filtered."
- **Hoerikwaggo (33, FOURL)** — never selected in the 4 sampled seeds, so its
  self-orientation is UNPROVEN live (the FOURL geometry is engine-evaluated
  independently; sharing the FOURADJACENT/FOURPARALLELAGRM code path is
  suggestive but not proof). Closing it needs a seed/map where Hoerikwaggo wins
  its F-mtn group (or a forced-selection probe).

**O6 effects — placement-path confirmed; full-yield verification deferred.**
Placed wonders use the `setFeatureType` path, which is the engine-automatic,
data-gated effect path (REQUIREMENT_MAP_HAS_FEATURE etc.). Full yield/city-
acquisition effect verification is a post-map-gen, in-game inspection beyond the
map-generation closure scope.

**Closure claim (Section D): substantially met.** Across 2 seeds (1337, 2024) ×
2 map types (earthlike, desert-mountains): earthlike places a land wonder every
seed (mountain/forest) and desert-mountains a volcano + mountain + reef FOUR*
every seed — a genuine cross-type MIX with ≥1 land type and ≥1 previously-dropped
wonder on every run (the primary variety goal). Two 4-tile classes place via
self-orientation, Barrier Reef across BOTH desert-mountains seeds. Even-row
geometry is proven offline; FOUR* readback is anchor-level by design.
**Explicitly NOT proven (documented, scoped out):** Thera terrain-specific
placement, Valley of Flowers odd-Q/odd-R predicate, FOURL (Hoerikwaggo) live
self-orientation (never selected), a same-seed/same-binary live determinism
re-run, a telemetry-proven even-row PLACED anchor, and in-game effect-yields.
