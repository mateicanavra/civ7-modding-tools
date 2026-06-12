# Placement Realignment — Milestone A2 (live resource counts vs policy) + A6 (StartBias resolution), 2026-06-11

Offline analysis of the captured live run `studio-run-in-game-mq95a8mp-o7l`
(swooper-earthlike, MAPSIZE_HUGE 106×66, seed 1337, 10 majors, AGE_ANTIQUITY).
No live game/tuner access — everything below is computed from the captured
artifacts:

- `/tmp/parity-a3.json` — `.proof.live` full-grid surfaces
  (terrain/biome/feature/resource, 6996 plots, row-major `y*106+x`) +
  `.proof.local` authority surfaces and the local `resourcePlan` /
  `resourcePlanAdjusted` evidence.
- `/tmp/gameinfo-Resources.json` — GameInfo.Resources (`$index` = runtime id).
- `/tmp/gameinfo-Civilizations.json`, `/tmp/gameinfo-Leaders.json`,
  `/tmp/gameinfo-Ages.json` — live tables with `$hash` columns.
- `/tmp/live-identity-a.json` — per-player civHash/leaderHash + start plots +
  `liveAgeHash`.
- `CIV7_POLICY_TABLES_V1` / `CIV7_BROWSER_TABLES_V0`
  (`packages/civ7-map-policy/src/civ7-tables.gen.ts`) and the
  `domain/resources` habitat-lane definitions.

Analysis script: one-off `bun /tmp/a2a6-analysis.ts` (not committed, per
milestone convention). Hash matching normalizes both sides to signed int32.

Live totals: **219 resource placements across 34 types** (local plan stamped
226 — the 7-placement delta is the already-tracked A3
`resourcePlacementCoordinateProof` residual, `missing-exact-log`; per-type
totals differ by at most 1).

## E2.4 — marine resources place (gate: > 0 on a map with coast) — **PASS**

Water mask from the live terrain surface via
`CIV7_BROWSER_TABLES_V0.terrainTypeIndices` (`TERRAIN_COAST=3`,
`TERRAIN_OCEAN=4`): 4452 water plots, of which 4411 coast.

| marine type | live count on water |
| --- | --- |
| RESOURCE_FISH | 9 |
| RESOURCE_CRABS | 7 |
| RESOURCE_DYES | 3 |
| RESOURCE_PEARLS | 3 |
| RESOURCE_TURTLES | 2 |
| RESOURCE_COWRIE | 2 |
| **total** | **26 (6 types)** |

**E2.4 PASS** — 26 > 0 with coast present. Matches the mock-harness S5/S6
baseline exactly (26 marine / 6 types), i.e. the marine pipeline survives the
live engine round-trip with zero water-placement loss. WHALES does not appear
in the antiquity catalog for this map (not planned locally either — not a
live drop).

## Landmass-region segmentation (input to E2.2)

Derived from the live land mask (land = terrain ∉ {COAST, OCEAN};
`TERRAIN_NAVIGABLE_RIVER` counts as land since it stamps over land tiles)
using the repo's odd-q hex adjacency with X-wrap
(`packages/mapgen-core/src/lib/grid/neighborhood/hex-oddq.ts`) and the exact
official region semantics of
`mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/plot-landmass-regions/`:
per-landmass seam-aware column bounds (`computeCircularBounds`) → wrapped
interval center → slot West (center < width/2) or East.

- 2544 land tiles, 39 connected components; West 1145 tiles / East 1399 tiles.
- Major masses: #2 (1383 tiles, cols 50–99) → **East**; #18 (1096 tiles,
  cols 4–49) → **West**; #30 (24 tiles, cols 45–49) → West; remaining 36
  components are islands < 20 tiles.

## E2.2 — region minimums (modifier-adjusted MinimumPerHemisphere) — **PASS**

Policy inputs: `mapResourceMinimumAmountModifier` DEFAULT/MAPSIZE_HUGE
amount **+4**; age gate `isResourceRequiredForAge` evaluated at the resolved
live age **AGE_ANTIQUITY** (see A6). Official semantics (mirrored from
`select-resource-sites`): a minimum is enforced per landmass-region only when
the resource is required for the running age; required = minimum + modifier.

All catalog rows with `MinimumPerHemisphere > 0`, live counts per region:

| resource | min | adj. req (+4) | enforced in AGE_ANTIQUITY? | region | live count | satisfied | local plan regionMinimums row |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RESOURCE_GOLD | 8 | 12 | yes | West | 14 | **YES** | required=12 fromRotation=13 forced=0 shortfall=0 |
| RESOURCE_GOLD | 8 | 12 | yes | East | 6 | **NO** | required=12 fromRotation=5 forced=2 **shortfall=5** |
| RESOURCE_SILVER | 8 | 12 | no (not age-required) | West/East | 11 / 7 | n/a | — |
| RESOURCE_COCOA | 8 | 12 | no (EXPLORATION/MODERN) | West/East | 0 / 0 | n/a | — |
| RESOURCE_SPICES | 8 | 12 | no (EXPLORATION/MODERN) | West/East | 0 / 0 | n/a | — |
| RESOURCE_SUGAR | 8 | 12 | no (EXPLORATION/MODERN) | West/East | 0 / 0 | n/a | — |
| RESOURCE_TEA | 8 | 12 | no (EXPLORATION/MODERN) | West/East | 0 / 0 | n/a | — |
| RESOURCE_COFFEE | 8 | 12 | no (not age-required) | West/East | 0 / 0 | n/a | — |
| RESOURCE_TOBACCO | 8 | 12 | no (not age-required) | West/East | 0 / 0 | n/a | — |
| RESOURCE_CITRUS | 8 | 12 | no (not age-required) | West/East | 0 / 0 | n/a | — |
| RESOURCE_QUININE | 8 | 12 | no (not age-required) | West/East | 0 / 0 | n/a | — |

Enforced rows: 2. Unsatisfied: 1 (GOLD East, 6 < 12). That row corresponds
exactly to the typed shortfall the local plan recorded
(`resourcePlan.regionMinimums`: GOLD slot 2 shortfall 5 — the eligible-site
pool in the East region was exhausted after 5 rotation + 2 forced
placements). **No silent deficit → E2.2 PASS.**

Notes:
- Live GOLD split is 14/6 vs the plan's 13/7: the live engine relocated some
  individual GOLD plots (the A3 coordinate residual), shifting one placement
  across the region boundary. Total GOLD count is identical (20).
- Resources not valid in AGE_ANTIQUITY (cocoa/spices/sugar/tea/coffee/
  tobacco/citrus/quinine) are correctly absent from the live grid.

## E2.1 — live rarity stratification (Spearman count vs Weight) — observational

Grouping used (named per the task): **habitat lanes `family/laneId` from
`mods/mod-swooper-maps/src/domain/resources` (RESOURCE_HABITAT_SIGNALS), as
recorded per type in the run's `resourcePlan.perType`** — the same co-eligible
pools the deficit rotation operates on. Weights are official catalog Weights.

Result: **the within-lane gate statistic is degenerate on this live map** —
every lane is either uniform-Weight (all antiquity members share Weight 10,
e.g. aquatic n=5) or has < 3 members where Weight varies
(orogenic-hydrothermal: GOLD w20:20, SILVER w20:18; open-grazing: HIDES
w40:10, HORSES w10:6; granite-orogen-placer: TIN w25:11 alone). Spearman is
undefined (zero rank variance or n < 3) in all 25 lanes.

Observational cross-lane correlations (confounded — reported for the record,
not gate-bearing):

| pool | n | Spearman(liveCount, Weight) |
| --- | --- | --- |
| geological (family) | 12 | +0.707 |
| terrestrial (family) | 8 | +0.584 |
| aquatic / cultivated (family) | 5 / 9 | n/a (uniform Weight 10) |
| all placed types pooled | 34 | +0.545 |

The positive sign is expected and explained: across lanes, per-type counts
are dominated by (a) region-minimum forcing — GOLD/SILVER (Weight 20) carry
`MinimumPerHemisphere`-driven floors of 12/hemisphere, and (b) the authored
`expectedCountRange` clamps and habitat breadth — exactly the confounds
documented in `placement-metrics.ts` (E2.1 note). Per the repo's metrics
convention the **binding** E2.1 gate is the synthetic fully co-eligible
rotation probe through the real `select-resource-sites` op, which holds at
**Spearman −1.0** (S5/S6 evidence, unchanged op). Anti-uniformity guard on
the live grid: per-type count CV = **0.620** (min 2 / max 20 across 34
types) — no force-uniform regression.

**Verdict: ≤ −0.7 not measurable within shared-habitat pools on this live
map (degenerate pools); gate carried by the co-eligible op probe (−1.0);
live counts show healthy stratification (CV 0.620, no uniformity).**

## A6 — StartBias resolution (live player → civ/leader → official rows → op input)

`$hash` columns are present in all three GameInfo tables; live hashes match
after int32 normalization (10/10 civs, 10/10 leaders resolved — no name-hash
fallback needed).

Age: `liveAgeHash 2077444219` → **AGE_ANTIQUITY** (Ages.$hash exact match).

Per-seat resolution + official `CIV7_POLICY_TABLES_V1.startBias*` rows
(scores are summed over matching civ rows + leader rows; `value:score`):

| seat | civ | leader | start | river | lake | adjCoast | biome biases | terrain biases | feature-class biases |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 (human) | CIVILIZATION_GREECE | LEADER_ALEXANDER | (34,41) | 0 | 0 | 0 | GRASSLAND:5 | HILL:15 | — |
| 1 | CIVILIZATION_ROME | LEADER_ADA_LOVELACE | (25,37) | 0 | 0 | 0 | GRASSLAND:5 | — | — |
| 2 | CIVILIZATION_CARTHAGE | LEADER_EDWARD_TEACH | (45,19) | 0 | 0 | **350** | MARINE:5, PLAINS:5 | — | — |
| 3 | CIVILIZATION_ASSYRIA | LEADER_BENJAMIN_FRANKLIN | (39,28) | 5 | 0 | 0 | — | FLAT:15 | — |
| 4 | CIVILIZATION_MAURYA | LEADER_LAKSHMIBAI | (31,48) | 0 | 0 | 0 | — | — | VEGETATED:5 |
| 5 | CIVILIZATION_PERSIA | LEADER_GILGAMESH | (48,27) | 0 | 0 | 0 | DESERT:5 | — | — |
| 6 | CIVILIZATION_TONGA | LEADER_CATHERINE | (90,19) | 0 | 0 | 0 | TUNDRA:10, TROPICAL:5 | COAST:15 | — |
| 7 | CIVILIZATION_EGYPT | LEADER_FRIEDRICH | (95,25) | 0 | 0 | 0 | DESERT:5 | NAVIGABLE_RIVER:20 | — |
| 8 | CIVILIZATION_MISSISSIPPIAN | LEADER_AUGUSTUS | (69,40) | 5 | 0 | 0 | — | FLAT:15 | — |
| 9 | CIVILIZATION_KHMER | LEADER_MACHIAVELLI | (58,26) | 0 | 0 | 0 | TROPICAL:5 | — | FLOODPLAIN:40 |

No `startBias.resources` or `startBias.naturalWonders` rows match this
roster. Carthage's 350 adjacentToCoast = civ row 200 + Edward Teach leader
row 150.

The `SeatBias[]` input the `plan-starts` op would receive
(`mods/mod-swooper-maps/src/domain/placement/ops/plan-starts/policy/start-bias.ts`
— scorable families river/lake/adjacentToCoast; biome/terrain/featureClass
families need engine id projection and are the Milestone A follow-up):

```json
[
  { "seatIndex": 0, "river": 0, "lake": 0, "adjacentToCoast": 0 },
  { "seatIndex": 1, "river": 0, "lake": 0, "adjacentToCoast": 0 },
  { "seatIndex": 2, "river": 0, "lake": 0, "adjacentToCoast": 350 },
  { "seatIndex": 3, "river": 5, "lake": 0, "adjacentToCoast": 0 },
  { "seatIndex": 4, "river": 0, "lake": 0, "adjacentToCoast": 0 },
  { "seatIndex": 5, "river": 0, "lake": 0, "adjacentToCoast": 0 },
  { "seatIndex": 6, "river": 0, "lake": 0, "adjacentToCoast": 0 },
  { "seatIndex": 7, "river": 0, "lake": 0, "adjacentToCoast": 0 },
  { "seatIndex": 8, "river": 5, "lake": 0, "adjacentToCoast": 0 },
  { "seatIndex": 9, "river": 0, "lake": 0, "adjacentToCoast": 0 }
]
```

**A6 data path proven end-to-end**: live player hashes → GameInfo `$hash`
rows → `CIVILIZATION_*`/`LEADER_*` → official StartBias rows →
`SeatBias` op input shape. Wiring `seatBiases` into the live run remains the
planned Milestone A6 follow-up CODE change (the shipped run used the neutral
default — consistent with `seatBiasTerm` returning 0 for absent rows).

## Verdict summary

| gate | verdict |
| --- | --- |
| E2.4 marine | **PASS** — 26 marine placements / 6 types on water |
| E2.2 region minimums | **PASS** — 1 unsatisfied (GOLD East 6 < 12), matched by typed plan shortfall (5); no silent deficit |
| E2.1 live rarity | within-lane rho degenerate on live map (uniform weights / n<3); observational pooled +0.545 (confounded, explained); op-probe gate −1.0 stands; CV 0.620 ≠ uniform |
| A6 resolution | **PASS** — 10/10 civs, 10/10 leaders, age resolved (AGE_ANTIQUITY); per-seat SeatBias table built |
