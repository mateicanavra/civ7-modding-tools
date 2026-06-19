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
