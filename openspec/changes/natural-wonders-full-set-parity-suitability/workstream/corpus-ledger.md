# Natural-Wonder Corpus Ledger

Canonical corpus extracted from official game data (installed build 2026-05-19,
verified in sync). Source: `output/nw-scope.md` §2 + `output/nw-design-inputs.md`
§1. This ledger is the corpus-before-tuning and expectations baseline; "current"
columns are filled from the verified pre-change state, "expected" from this
change's target. Each id is a `Feature_NaturalWonders` row.

## Full set (20) — current eligibility vs target

| id | FeatureType | placementClass | tiles | tags | group | current | drop reason (current) | expected |
|----|-------------|----------------|-------|------|-------|---------|-----------------------|----------|
| 0  | BERMUDA_TRIANGLE | THREETRIANGLEDEEPOCEAN | 3 | ADJACENTTOCOAST, NOTADJACENTTOLAND | D | dropped | unsupported tags | eligible |
| 1  | MOUNT_EVEREST | FOURPARALLELAGRM | 4 | ADJACENTTOSAMEBIOME, NOTADJACENTTORIVER, NOTNEARCOAST | F | dropped | 4-tile class null | eligible |
| 28 | VALLEY_OF_FLOWERS | TWOADJACENT | 2 | ADJACENTMOUNTAIN, NOTNEARCOAST | G | dropped | placeFirst && tiles>1 | eligible |
| 29 | BARRIER_REEF | FOURADJACENT | 4 | ADJACENTTOLAND, FEATURE_REEF, NOTADJACENTTOICE, SHALLOWWATER | C | dropped | 4-tile class null | eligible |
| 30 | REDWOOD_FOREST | THREETRIANGLE | 3 | FEATURE_FOREST | I | working | — | eligible |
| 31 | GRAND_CANYON | FOURPARALLELAGRM | 4 | NOTADJACENTTORIVER, NOTNEARCOAST (minElev 350) | H | dropped | 4-tile class null | eligible |
| 32 | GULLFOSS | ONE | 1 | WATERFALL (placeFirst) | E | working | — | eligible |
| 33 | HOERIKWAGGO | FOURL | 4 | (none) | F | dropped | 4-tile class null | eligible |
| 34 | IGUAZU_FALLS | ONE | 1 | WATERFALL (placeFirst) | E | working | — | eligible |
| 35 | KILIMANJARO | THREETRIANGLE | 3 | VOLCANO | A | working | — | eligible |
| 36 | ZHANGJIAJIE | TWOADJACENT | 2 | (none) | F | working | — | eligible |
| 37 | THERA | FOURPARALLELAGRM | 4 | ADJACENTTOLAND, NOTADJACENTTOICE, SHALLOWWATER, VOLCANO | B | dropped | 4-tile class null | eligible |
| 38 | TORRES_DEL_PAINE | THREETRIANGLE | 3 | (none) | F | working | — | eligible |
| 39 | ULURU | ONE | 1 | ADJACENTTOSAMEBIOME, NOTADJACENTMOUNTAIN | H | working | — | eligible |
| 40 | MACHAPUCHARE | THREETRIANGLE | 3 | (none) | F | working | — | eligible |
| 41 | MOUNT_FUJI | THREETRIANGLE | 3 (dir 2) | VOLCANO | A | working | — | eligible |
| 42 | VIHREN | THREETRIANGLE | 3 (dir 1) | (none) | F | working | — | eligible |
| 43 | VINICUNCA | FOURPARALLELAGRM | 4 | (none) | F | dropped | 4-tile class null | eligible |
| 44 | GREAT_BLUE_HOLE | ONE | 1 | ADJACENTTOSAMETERRAIN, NOTADJACENTTOICE, SHALLOWWATER | C | dropped | unsupported tag | eligible |
| 45 | MAPU_A_VAEA_BLOWHOLES | TWO | 2 | ADJACENTCLIFF, ADJACENTTOLAND, NOLANDOPPOSITECLIFF, NOTADJACENTTOICE, SHALLOWWATER | C | dropped | unsupported tags | eligible |

**Totals — current:** 20 total / 10 eligible / 10 dropped.
**Totals — expected:** 20 total / 20 eligible / 0 dropped.

**Additional hard constraints (wired in code, not in the tags column above):**
- `noLake` = Mount Everest (1), Bermuda Triangle (0), Great Barrier Reef (29),
  Thera (37), Mapu 'a Vaea (45).
- `minimumElevation` = Grand Canyon (31): 350.
These remain pass/fail filters in the planner; suitability ranks among passing
tiles only.

## Requirement-groups (suitability) and expected placement behavior

| group | wonders | dominant suitability signals | expected behavior |
|---|---|---|---|
| A Volcano (subaerial) | 35, 41 | volcanoMask·strength01, mountain relief, biome | place on volcanic mountains; volcano event active |
| B Volcano (caldera coast) | 37 | volcanoMask ∩ shelfMask ∩ coastalWater | place on shallow coast near volcanism |
| C Reef / shallow marine | 29, 44, 45 | shelfMask, bathymetry depth, distanceToCoast, warm temp | place on warm shallow shelf; cliffs for 45 |
| D Deep ocean | 0 | bathymetry depth, distanceToCoast band | place in deep ocean adjacent to coast, not land |
| E Waterfall / river-fed | 32, 34 | riverClass, discharge/slopeClass/streamOrder, biome | place on river-fed hills; placeFirst |
| F Mountain monolith | 1, 33, 36, 38, 40, 42, 43 | elevation+relief, orogeny/roughness, biome (incl. DESERT for Vinicunca 43 = MOUNTAIN+DESERT), freezeIndex (Torres) | place on high non-volcanic ranges per biome |
| G Mountain-adjacent lowland | 28 | FLAT + neighbor MOUNTAIN, moisture/fertility | place on fertile flats beside mountains; placeFirst |
| H Arid relief (canyon/inselberg) | 31, 39 | aridityIndex, DESERT biome, elevation/minElev, erodibilityK | Grand Canyon (31) is TERRAIN_FLAT, Uluru (39) is TERRAIN_HILL — NOT mountain; do not filter Group H to mountain terrain |
| I Forest | 30 | vegetationDensity, moisture/temperate band | place in dense temperate forest |

## Expectations (predeclared, before tuning)

- E1: after the change, all 20 are catalog-eligible; 0 silent drops.
- E2: on a HUGE map, the per-map vanilla count of distinct wonders place; the
  set differs across ≥2 seeds (cross-seed variety) while being identical for a
  repeated seed (determinism).
- E3: every multi-tile placement's offline footprint equals the engine readback
  on both row parities (no even-row mismatch).
- E4: each placed vanilla wonder's data-bound effects are present live
  (spot-checked: a volcano event, the Expedition Base, on-tile yields).
- E5: previously-dropped wonders (e.g. Barrier Reef, Grand Canyon, Bermuda,
  Valley of Flowers) are observed placing on suitable maps/seeds.

## Observed (filled at verification)

- O1 (catalog eligibility): _pending_
- O2 (cross-seed variety / determinism): _pending_
- O3 (even-row footprint readback match): _pending_
- O4 (effects manifest): _pending_
- O5 (previously-dropped wonders placed): _pending_
