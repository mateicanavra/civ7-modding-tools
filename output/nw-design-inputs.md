# Natural Wonders — Consolidated Design Inputs

> Synthesis of 4 evidence-based facet investigations (effects-corpus, effect-application-mechanism, suitability-inputs, geometry-and-predicates) into authoritative design inputs for the Civ7 Natural Wonders overhaul.
>
> **Scope premise:** effects are now IN scope. "Variety" means a **physically-grounded, weighted, biome-aware suitability** model that is **deterministic per seed** (derived from terrain evaluation), explicitly **NOT random** as the base engine generator is.
>
> All paths are absolute under the worktree root `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-A-mapgen-oddr-consumer-migration/`. Game-data XML lives under `.civ7/outputs/resources/` (abbreviated `…/resources/`).

---

## 0. Executive summary (decisive sizing)

1. **Effects are mostly-free.** Every one of the 20 vanilla natural-wonder effects is **engine-automatic, data-driven, and gated on the feature existing on the map** (`REQUIREMENT_MAP_HAS_FEATURE` / `_PLAYER_HAS_FEATURE` / `_DISCOVERED_NATURAL_WONDER`, or the `<RandomEvents NaturalWonder="…">` binding). The mod already places features through `adapter.placeNaturalWonder → TerrainBuilder.setFeatureType` — byte-for-byte the same engine entry point the base generator uses. **Placing the correct vanilla FeatureType at a legal location activates 100% of that wonder's effects with zero additional mod code.** Explicit effect authoring is required ONLY if the overhaul invents brand-new FeatureTypes (not in scope for reuse). The real work is placement legality + footprint fidelity, which the mod already tracks.

2. **The suitability model is the substantive build.** The current planner uses ONE all-wonders scalar `priority = relief*0.75 + (1-aridity)*0.15 + river*0.1` (`default.ts:127`) that does not vary by wonder. The design replaces this with **per-group, biome-aware weighted scoring** driven by physical signals. Many needed signals are already computed by the pipeline but **dropped before reaching the planner** (volcanoMask, shelfMask, bathymetry, distanceToCoast, vegetationDensity, discharge, slopeClass, orogenyPotential, fertility, moisture, temperature). Forwarding them is cheap; a handful of true gaps remain (cliffs, reef-suitability).

3. **FOUR\* geometry and the 5 predicates are tractable but require a live engine probe.** Both are owned by C++ (`setFeatureType` / `canHaveFeatureParam`); neither has any JS implementation in shipped resources. The repo already has the probe mechanism (`civ7 game exec`). The model must be expressed in **row-parity-aware odd-R offsets** — and the existing static footprint table is already latently wrong on even rows (it only matches odd-row diagonals). Recommended contract: conservative odd-R superset pre-filter + engine-authoritative `canHaveFeatureParam` readback as the final gate.

---

## 1. Effects corpus (per-wonder, with bindings)

### 1.1 Universal bindings (all 20)

- **`TerrainBiomeFeature_YieldChanges`** — keyed by the exact `(TerrainType, BiomeType, FeatureType)` triple. The on-tile yield. `ScaleByGameAge="50"` on every NW row.
- **`District_FreeConstructibles`** — `IMPROVEMENT_EXPEDITION_BASE`, `DISTRICT_RURAL`, Priority 3. Base wonders' rows live in `districts.xml`; DLC/racetowonders/marvelous wonders carry their own. The expedition base is a plain improvement (Cost 25, Population 1, `PLUNDER_HEAL` 30) with **no modifiers of its own** — it only lets a city work the otherwise-Impassable wonder tile.
- **`AiFavoredItems`** — Isabella "Settle Plot Conditions", value 15. AI advisory only, not a player-facing effect.

### 1.2 Per-wonder effects table

| # | Feature | On-tile yield (Terrain/Biome) | Feature_CityYields | Standalone Modifier(s) | RandomEvent | Special / Features attrs |
|---|---|---|---|---|---|---|
| 0 | BERMUDA_TRIANGLE | +2 SCI +2 CUL (OCEAN/MARINE) `racetowonders-terrain.xml:33-34` | — | `BERMUDA_TRIANGLE_SEA_YIELDS` (+1 SCI all city coast) `…:38`; `BERMUDA_TRIANGLE_UNIT_TELEPORT` (`EFFECT_TELEPORT_UNIT`) `…:39` | — | `AvoidWhenPathfinding`, `PreventUnpack` `…:17` |
| 1 | MOUNT_EVEREST | +2 HAP +2 DIP +2 CUL (MOUNTAIN/TROPICAL) `marvelous-mountains-terrain.xml:34-36` | — | `MOUNT_EVEREST_REVEAL_ALL_MOUNTAIN_TILES` (`EFFECT_REVEAL_PLOTS`, PlayerModifiers, on discovery) `…:40` | — | — |
| 28 | VALLEY_OF_FLOWERS | +2 FOOD +2 CUL +2 HAP (FLAT/PLAINS) `terrain.xml:321-323` | — | `VALLEY_OF_FLOWERS_TRADE_ROUTE_RANGE` (+10 land range) `terrain.xml:357` | — | PlaceFirst |
| 29 | BARRIER_REEF | +2 FOOD +2 HAP +2 SCI (COAST/MARINE) `terrain.xml:324-326` | — | `BARRIER_REEF_ADJACENT_RURAL_SEA_YIELDS` (+2 SCI adj non-NW marine) `terrain.xml:358` | — | — |
| 30 | REDWOOD_FOREST | +2 FOOD +2 PROD +2 HAP (FLAT/GRASSLAND) `terrain.xml:327-329` | +1 CUL, +1 SCI per `FEATURE_CLASS_VEGETATED` `terrain.xml:348-349` | — | — | — |
| 31 | GRAND_CANYON | +2 CUL +4 HAP (FLAT/DESERT) `terrain.xml:330-331` | +1 SCI per TERRAIN_FLAT `terrain.xml:351` | — | — | minElev 350 |
| 32 | GULLFOSS | +6 FOOD (HILL/TUNDRA) `terrain.xml:332` | — | `GULLFOSS_ADJACENT_YIELDS` (+1 PROD +1 CUL adj non-NW) `terrain.xml:361` | — | `AddsFreshWater` `terrain.xml:214` |
| 33 | HOERIKWAGGO | +2 CUL +4 FOOD (MOUNTAIN/GRASSLAND) `terrain.xml:333-334` | — | `HOERIKWAGGO_ADJACENT_URBAN_YIELDS` (+2 HAP adj Quarter non-NW) `terrain.xml:359` | — | — |
| 34 | IGUAZU_FALLS | +4 FOOD +2 HAP (HILL/TROPICAL) `terrain.xml:335-336` | — | `IGUAZU_FALLS_ADJACENT_URBAN_YIELDS` (+2 PROD adj urban/citycenter non-NW) `terrain.xml:360` | — | `AddsFreshWater` `terrain.xml:216` |
| 35 | KILIMANJARO | +4 HAP +2 PROD (MOUNTAIN/PLAINS) `terrain.xml:337-338` | — | — | `RANDOM_EVENT_VOLCANO_KILIMAJARO` (Sev 3) `random-events.xml:62` | TypeTag VOLCANO `terrain.xml:147` |
| 36 | ZHANGJIAJIE | +2 HAP +4 PROD (MOUNTAIN/TROPICAL) `terrain.xml:339-340` | +2 CUL per TERRAIN_HILL `terrain.xml:350` | — | — | — |
| 37 | THERA | +4 CUL +2 HAP (COAST/MARINE) `terrain.xml:341-342` | — | — | `RANDOM_EVENT_VOLCANO_THERA` (Sev 3) `random-events.xml:66` | TypeTag VOLCANO `terrain.xml:149` |
| 38 | TORRES_DEL_PAINE | +2 FOOD +4 HAP (MOUNTAIN/TUNDRA) `terrain.xml:343-344` | +1 FOOD, +1 PROD per BIOME_TUNDRA `terrain.xml:352-353` | — | — | — |
| 39 | ULURU | +6 HAP (HILL/DESERT) `terrain.xml:345` | +2 CUL per BIOME_DESERT `terrain.xml:354` | — | — | — |
| 40 | MACHAPUCHARE | +4 PROD +2 CUL (MOUNTAIN/TROPICAL) `mountain-nw terrain.xml:61-62` | +1 HAP per HILL, +1 HAP per MOUNTAIN `…:75-76` | — | — | — |
| 41 | MOUNT_FUJI | +2 CUL +2 HAP +2 GOLD (MOUNTAIN/GRASSLAND) `mountain-nw terrain.xml:63-65` | — | — | `RANDOM_EVENT_VOLCANO_MOUNT_FUJI` (Sev 3) `mountain-nw terrain.xml:84` | TypeTag VOLCANO; NamedVolcano data `…:23-31` |
| 42 | VIHREN | +4 FOOD +2 PROD (MOUNTAIN/PLAINS) `mountain-nw terrain.xml:66-67` | — | `VIHREN_CULTURE_DISASTERS` (+1 CUL), `VIHREN_HAPPINESS_DISASTERS` (+1 HAP), `EFFECT_PLAYER_ADJUST_YIELD_FROM_DISTATERS` `…:79-80` | — | — |
| 43 | VINICUNCA | +2 SCI +2 PROD +2 HAP (MOUNTAIN/DESERT) `mountain-nw terrain.xml:68-70` | — | `VINICUNCA_ADJACENT_YIELDS` (+2 CUL adj rural/wilderness non-NW) `…:81` | — | — |
| 44 | GREAT_BLUE_HOLE | +2 SCI +4 HAP (COAST/MARINE) `water-wonders terrain.xml:51-52` | — | `BLUE_HOLE_ADJACENT_RURAL_SEA_YIELDS` (+2 CUL adj rural/wilderness marine non-NW) `…:57` | — | — |
| 45 | MAPU_A_VAEA_BLOWHOLES | +2 PROD +4 HAP (COAST/MARINE) `water-wonders terrain.xml:53-54` | — | `MAPU_A_VAEA_BLOWHOLES_COASTAL_LAND_YIELDS` (+2 CUL rural/wilderness coastal-land in city) `…:58` | — | — |

**Effect-verb vocabulary observed** (the `effect=` on bound Modifiers): `EFFECT_CITY_ADJUST_TRADE_ROUTE_RANGE`, `EFFECT_ATTACH_MODIFIERS` (adjacency wrappers), `EFFECT_PLOT_ADJUST_YIELD` (nested adjacency yields), `EFFECT_REVEAL_PLOTS`, `EFFECT_TELEPORT_UNIT`, `EFFECT_PLAYER_ADJUST_YIELD_FROM_DISTATERS`. Adjacency modifiers use an outer `EFFECT_ATTACH_MODIFIERS` on `COLLECTION_ALL_CITIES`/`COLLECTION_ALL_PLOT_YIELDS` attaching an inner `EFFECT_PLOT_ADJUST_YIELD` (data comment: nesting avoids oversubscription to District-Class change signals, `terrain-gameeffects.xml:33`).

### 1.3 Complete set of feature→effect binding tables

1. `TerrainBiomeFeature_YieldChanges` (all 20) — `FeatureType` + Terrain + Biome.
2. `Feature_CityYields` (Redwood, Grand Canyon, Zhangjiajie, Torres, Uluru, Machapuchare) — `FeatureType` + Terrain/Biome/FeatureClass.
3. `GameModifiers` (Bermuda, Valley, Barrier Reef, Gullfoss, Hoerikwaggo, Iguazu, Vihren, Vinicunca, Blue Hole, Mapu'a Vaea) — `ModifierId`; the Modifier itself carries the feature requirement.
4. `PlayerModifiers` (Mount Everest only) — `ModifierId`.
5. `District_FreeConstructibles` (all 20) — `FeatureType`.
6. `RandomEvents` (Kilimanjaro, Thera, Mount Fuji) — `NaturalWonder` column = FeatureType; sub-tables `RandomEventFrequencies/Damages/Yields` keyed by RandomEventType.
7. `TypeTags` — `Type`=FeatureType + Tag; carries the VOLCANO tag (eruptible) + all placement-predicate tags.
8. `NamedVolcanoCivilizations` + `NamedVolcanoes` (Mount Fuji only).
9. `AiFavoredItems` (all 20) — AI advisory.
10. `Features` row attributes — `AddsFreshWater` (Gullfoss, Iguazu), `AvoidWhenPathfinding`/`PreventUnpack` (Bermuda), `Impassable`, `Appeal=6` (all), `SightThroughModifier`.

### 1.4 External cross-references (NOT part of the wonder corpus)

Owned by other systems, conditioning on the feature: Hawaii Syncretism tradition (+4 CUL on volcano wonders), Nepal Sherpa unit (ignores Everest as obstacle), narrative-story requirements (Uluru, Machapuchare). Do not model these as wonder effects.

---

## 2. Effect-application verdict

**Decisive: "include effects" is mostly-free on correct placement. No explicit effect wiring required for the 20 vanilla wonders.**

### 2.1 Engine-automatic categories (zero mod code on correct placement)

| Category | Data mechanism | Gate |
|---|---|---|
| On-tile yields | `TerrainBiomeFeature_YieldChanges` | feature on tile (direct table lookup) |
| Free Expedition Base | `District_FreeConstructibles` | feature on tile |
| Per-city yields | `Feature_CityYields` | feature in city radius |
| Standalone modifiers (yield/trade-range/teleport/disaster-yield) | `GameModifiers`/`PlayerModifiers` + `EFFECT_*` | `REQUIREMENT_MAP_HAS_FEATURE` / `_PLAYER_HAS_FEATURE` |
| Discovery reveal (Everest) | PlayerModifier + `EFFECT_REVEAL_PLOTS` | `REQUIREMENT_PLAYER_DISCOVERED_NATURAL_WONDER` |
| Volcano eruptions (Thera, Kilimanjaro, Fuji) | `<RandomEvents NaturalWonder="…" EffectOperatorType="VOLCANO">` + freq/damage/yield tables | feature on map (engine VOLCANO operator) |
| AI settle hints | `AiFavoredItems` | feature on tile |

**Evidence:** `natural-wonder-generator.js` does exactly one mutating call per wonder — `TerrainBuilder.setFeatureType` (`:83`, `:142`) — and attaches no modifiers/resources/events. A repo-wide grep for `AttachModifier`/`attachModifier`/wonder-id references in `base-standard/scripts/` returned no matches. Everest's reveal modifier and the three volcano events have zero JS references anywhere. The mod's `adapter.placeNaturalWonder` (`packages/civ7-adapter/src/civ7-adapter.ts:923-1037`) resolves the same `{Feature, Direction, Elevation}` param and calls `TerrainBuilder.setFeatureType` at `civ7-adapter.ts:982` — identical to the engine path. `recordPlacementEffect`/`recordEffect` are telemetry only.

### 2.2 Explicit wiring needed (only if scope expands)

- **New FeatureTypes** would require authoring: `Feature_NaturalWonders`, `TerrainBiomeFeature_YieldChanges`, the modifier in `*-gameeffects.xml`, the `GameModifiers`/`PlayerModifiers` registration, and (for volcanoes) a `<RandomEvents NaturalWonder=…>` row. **Reusing the 20 vanilla types requires none of this.**
- **Caveat (a selection decision, not effect plumbing):** because `REQUIREMENT_MAP_HAS_FEATURE` is the gate, a wonder's effects only exist if that wonder is actually placed. Changing *which* of the 20 are placed (or their counts) changes which effects are live. This is the suitability/selection model's responsibility (§3), not effect wiring.

---

## 3. Suitability model

### 3.1 How selection works today (orientation)

The planner `defaultStrategy.run` (`mods/mod-swooper-maps/src/domain/placement/ops/plan-natural-wonders/strategies/default.ts`) is **greedy-priority + hard-filter** (not random, unlike the base engine which picks uniformly at random among `canHaveFeatureParam`-valid plots):

1. One scalar per tile: `priority = clamp01(reliefN*0.75 + (1-aridity)*0.15 + river*0.1)` (`default.ts:127`). **Identical for every wonder.**
2. Sort tiles by priority desc (`default.ts:136`).
3. Per catalog feature (sorted by featureType id, `default.ts:91,153`), take the highest-priority tile whose footprint passes ALL hard filters (`chooseFeatureCandidate`, `default.ts:557-618`), with a min-spacing pass then relaxed retry (`default.ts:156-198`).

The design closes the gap: replace the single all-wonders scalar with **per-group biome-aware weighted suitability**, deterministic per seed (it reads only terrain-eval artifacts, no RNG in scoring).

### 3.2 Available physical signals

**Currently passed into the planner** (`inputs.ts:190-211`, typed `contract.ts:6-51`):

| Signal | Type/Range | Source artifact (file:line) | Meaning |
|---|---|---|---|
| landMask | u8 {0,1} | `morphology/artifacts.ts:13` | land vs water |
| elevation | i16 meters (signed) | `morphology/artifacts.ts:5` | per-tile elevation |
| aridityIndex | f32 0..1 | `ecology/artifacts.ts:16` | 1=most arid |
| riverClass | u8 {0,1,≥2} | `hydrology-hydrography/artifacts.ts:20` | 0 none / 1 minor / ≥2 major |
| lakeMask | u8 {0,1} | `hydrology-hydrography/artifacts.ts:74` | planned lake |
| terrainType | u8 enum | engine readback `inputs.ts:62-72` | MOUNTAIN=0 HILL=1 FLAT=2 COAST=3 OCEAN=4 NAV_RIVER=5 |
| biomeType | u8 enum | `ecology/artifacts.ts:119` | TUNDRA=0 GRASSLAND=1 PLAINS=2 TROPICAL=3 DESERT=4 MARINE=5 |
| featureType | i16 enum | declared `inputs.ts:99-105` | occupancy |
| coast/mountain/ice sentinels, noFeatureType, naturalWonderBlockedMask | consts/u8 | `inputs.ts:200-207` | tag-eval constants; polar-row NW ban |

**Derived in-planner:** `reliefByTile`/`reliefN` (max−min elevation over odd-Q hex neighbors, normalized, `default.ts:104-124`); `priority` (`default.ts:127`).

**Computed in the pipeline but DROPPED before the planner** (forward-cheap):

| Signal | Range | Artifact | Status |
|---|---|---|---|
| effectiveMoisture | f32 | `ecology/artifacts.ts:14` | read `inputs.ts:137` then dropped |
| surfaceTemperature | f32 °C | `ecology/artifacts.ts:15` | read `inputs.ts:138` then dropped |
| fertility | f32 0..1 | `ecology/artifacts.ts:30` | read `inputs.ts:145` then dropped |
| bathymetry | i16 m (≤0 water) | `morphology/artifacts.ts:17` | never read |
| shelfMask | u8 {0,1} | `morphology/artifacts.ts:61` | never read |
| coastalWater / coastalLand | u8 {0,1} | `morphology/artifacts.ts:58,56` | never read |
| distanceToCoast | u16 (0=coast) | `morphology/artifacts.ts:65` | never read |
| volcanoMask | u8 {0,1} | `morphology/artifacts.ts:139` | never read (only true VOLCANO signal) |
| volcano kind/strength01 | enum/0..1 | `morphology/artifacts.ts:148-152` | never read |
| mountainMask/hillMask/foothillMask | u8 {0,1} | `morphology/artifacts.ts:167,177,180` | never read |
| orogenyPotential/roughnessPotential | u8 0..255 | `morphology/artifacts.ts:187,193` | never read |
| substrate.erodibilityK | f32 | `morphology/artifacts.ts:45` | never read |
| discharge/runoff | f32 | `hydrology-hydrography/artifacts.ts:12,16` | never read |
| slopeClass | u8 0..5 | `hydrology-hydrography/artifacts.ts:154` | never read |
| streamOrderProxy/flowPermanenceProxy | u8 | `hydrology-hydrography/artifacts.ts:147,158` | never read |
| vegetationDensity | f32 0..1 | `ecology/artifacts.ts:13` | never read |
| freezeIndex/groundIce01/permafrost01/treeLine01 | f32 0..1 | `ecology/artifacts.ts:17-21` | never read |

### 3.3 Wonder requirement-groups (deterministic, biome-derived, mutually exclusive)

Grouping is derived strictly from the data triple (placementClass shape, validTerrain, validBiome, tags). Each group names the dominant physical driver.

| Group | Wonders (ids) | Key physical requirements | Primary scoring signals (HAVE / AVAIL=forward / GAP) |
|---|---|---|---|
| **A — Volcano (subaerial)** | Kilimanjaro (35), Mount Fuji (41) | tag VOLCANO, MOUNTAIN | volcanoMask (AVAIL) + strength01; biome PLAINS/GRASSLAND (HAVE); relief/elevation (HAVE) |
| **B — Volcano (submarine/caldera coast)** | Thera (37) | VOLCANO+SHALLOWWATER+ADJACENTTOLAND, COAST | volcanoMask ∩ shelfMask ∩ coastalWater (AVAIL); ADJACENTTOLAND/NOTADJACENTTOICE (HAVE) |
| **C — Reef / shallow marine** | Barrier Reef (29), Great Blue Hole (44), Mapu'a Vaea (45) | SHALLOWWATER + (FEATURE_REEF / ADJACENTTOSAMETERRAIN / ADJACENTCLIFF+NOLANDOPPOSITECLIFF), COAST | shelfMask + bathymetry depth (AVAIL); distanceToCoast (AVAIL); warm low-latitude via surfaceTemperature (AVAIL); reef-suitability + cliffs (GAP) |
| **D — Deep ocean** | Bermuda (0) | NOTADJACENTTOLAND+ADJACENTTOCOAST, OCEAN | bathymetry depth (AVAIL) for "deep"; distanceToCoast band (AVAIL) for both predicates |
| **E — Waterfall / river-fed** | Gullfoss (32), Iguazu (34) | tag WATERFALL, HILL, AddsFreshWater | adjacent river (HAVE via riverClass); discharge/streamOrderProxy/slopeClass (AVAIL) for magnitude; biome TUNDRA/GRASSLAND vs TROPICAL (HAVE) |
| **F — Mountain monolith / high-range (non-volcanic)** | Everest (1), Hoerikwaggo (33), Zhangjiajie (36), Torres (38), Machapuchare (40), Vihren (42), Vinicunca (43) | MOUNTAIN; multi-tile mountain classes | elevation+relief (HAVE) dominant; orogenyPotential/roughnessPotential (AVAIL); biome split (HAVE); freezeIndex for Torres (AVAIL) |
| **G — Mountain-adjacent lowland** | Valley of Flowers (28) | ADJACENTMOUNTAIN+NOTNEARCOAST, FLAT/PLAINS | terrain FLAT + neighbor MOUNTAIN (HAVE); moisture/fertility for "flowers" flavor (AVAIL) |
| **H — Arid monolith / desert plateau** | Grand Canyon (31), Uluru (39) | DESERT; minElev (GC); NOTADJACENTMOUNTAIN/ADJACENTTOSAMEBIOME (Uluru) | aridityIndex (HAVE) primary; biome DESERT (HAVE); elevation/minElev (HAVE); relief + erodibilityK for canyon incision (AVAIL) |
| **I — Forest** | Redwood Forest (30) | tag FEATURE_FOREST, FLAT/GRASSLAND | vegetationDensity (AVAIL) primary; moisture/temperate band (AVAIL); biome GRASSLAND (HAVE) |

Coverage: A(35,41) B(37) C(29,44,45) D(0) E(32,34) F(1,33,36,38,40,42,43) G(28) H(31,39) I(30) = all 20.

### 3.4 Scoring approach

- **Per-group weighted suitability function.** For each wonder, evaluate only its group's signals into a `suitability ∈ [0,1]`. Hard data constraints (validTerrain, validBiome, minElev, tags) remain pass/fail filters; the *score* ranks among passing tiles. Replace the single `priority` field with `suitability(wonder, tile)` so high-relief tiles no longer dominate every wonder uniformly.
- **Biome-aware:** each group's weight vector is biome-conditioned (e.g. Group F weights elevation heavily for Everest "tallest peak" but blends `freezeIndex` for Torres). Group H weights `aridityIndex` as the primary term (the inverse of its current 0.15 minor role).
- **Deterministic per seed:** scoring reads only terrain-eval artifacts (no RNG). Selection emerges deterministically: per group, take highest-suitability footprint-valid tile, subject to min-spacing; tie-break by stable tile index. This yields per-seed variety (different terrain → different wonder placement) without randomness.
- **Engine remains final authority on legality.** Suitability ranks; `canHaveFeatureParam` (or post-placement footprint readback) is the last gate, as it is today.

### 3.5 Signal gaps (no usable physical signal today)

1. **FOUR\* footprint geometry** — `FOURADJACENT`, `FOURPARALLELAGRM`, `FOURL` return `null` (`natural-wonder-footprints.ts:89-90`) → 6 wonders (Everest 1, Barrier Reef 29, Grand Canyon 31, Hoerikwaggo 33, Thera 37, Vinicunca 43) are silently dropped at `inputs.ts:165`. **Highest-impact gap** (see §4).
2. **VOLCANO** (35,37,41) — no-op pass in planner (`default.ts:363`); `volcanoMask` AVAIL but unforwarded.
3. **SHALLOWWATER** (29,37,44,45) — no-op pass (`default.ts:362`); `shelfMask` AVAIL but unforwarded.
4. **FEATURE_REEF** (29) — no-op pass (`default.ts:361`); no reef-suitability signal computed anywhere.
5. **FEATURE_FOREST** (30) — no-op pass (`default.ts:360`); `vegetationDensity` AVAIL but unforwarded.
6. **ADJACENTTOCOAST / NOTADJACENTTOLAND** (0) — unhandled → `default` rejects (`default.ts:480`); `distanceToCoast`/`coastalWater` AVAIL but unforwarded.
7. **ADJACENTTOSAMETERRAIN** (44) — unhandled → rejects; terrainType IS available, only logic missing.
8. **ADJACENTCLIFF / NOLANDOPPOSITECLIFF** (45) — unhandled → rejects; **no cliff signal in any artifact** (engine edge-based concept). Hardest gap.
9. **Deep-vs-shallow ocean** (0) — `bathymetry` AVAIL but unforwarded; planner can't distinguish deep from coastal beyond OCEAN/COAST enum.
10. **Waterfall magnitude/slope** (32,34) — planner only checks "adjacent to any river"; discharge/slopeClass/streamOrderProxy AVAIL for quality scoring.
11. **moisture/temperature/fertility** — read into `physical` (`inputs.ts:137,138,145`) but never forwarded — dead inputs today.

---

## 4. FOUR\* geometry — live-probe plan

### 4.1 The three FOUR\* classes (data ground truth)

| Wonder | PlacementClass | Tiles | Direction | Source |
|---|---|---|---|---|
| MOUNT_EVEREST | FOURPARALLELAGRM | 4 | none → -1 | `marvelous-mountains-terrain.xml:18,22` |
| GRAND_CANYON | FOURPARALLELAGRM | 4 | none → -1 | base `terrain.xml:213,227` |
| THERA | FOURPARALLELAGRM | 4 | none → -1 | base `terrain.xml:219,233` |
| VINICUNCA | FOURPARALLELAGRM | 4 | none → -1 | `mountain-nw terrain.xml:37,43` |
| BARRIER_REEF | FOURADJACENT | 4 | none → -1 | base `terrain.xml:211,224` |
| HOERIKWAGGO | FOURL | 4 | none → -1 | base `terrain.xml:215,229` |

All six omit `Direction` (default -1, `01_GameplaySchema.sql:1904`) → **the engine self-selects orientation** at placement. The model must NOT hardcode a direction for FOUR\*; let the engine resolve and validate the resolved footprint by readback. (Contrast: only Fuji `Direction=2` and Vihren `Direction=1` set it, both THREETRIANGLE.)

### 4.2 Why a live probe is mandatory

`PlacementClass` carries the string, not the geometry (`Features.PlacementClass TEXT`, `01_GameplaySchema.sql:1866`). `natural-wonder-generator.js` stamps once per wonder at a single anchor (`:83,142`) and never iterates a footprint — C++ `setFeatureType` expands the anchor using PlacementClass+Direction. `PlacementClass` is consumed in JS only for scatter-family features (`feature-biome-generator.js:392-400`), never for FOUR\*/THREE\*/TWO\* NW layouts. There is **no JS footprint code to read.** Best-known hypotheses (priors only, to confirm): FOURPARALLELAGRM = rhombus (two adjacent rows of two); FOURADJACENT = contiguous 4-tile hex cluster; FOURL = L-shaped hex tetromino.

### 4.3 Odd-R parity correction (load-bearing)

The static `CIV7_DIRECTION_OFFSETS` (`natural-wonder-footprints.ts:12-19`) is **NOT parity-aware**. The verified engine odd-R table (`policy-grid.ts:16-34`) is parity-keyed: **even rows take west diagonals `(-1,1),(-1,-1)`; odd rows take east diagonals `(1,1),(1,-1)`** (the four common neighbors `(1,0),(-1,0),(0,1),(0,-1)` are parity-independent). The static table happens to match odd-row diagonals but is **wrong on even rows** — it differs by one of six neighbors on every even-row tile. Test `map-policy.test.ts:200-213` only exercises an odd row (y=13), so the bug is latent. Any new FOUR\* geometry must be expressed in parity-aware odd-R offsets, and the existing TWO/THREE tables likely need the same correction. This is the explicit purpose of the probe running on **both an even and an odd row**.

### 4.4 Live probe command shape

Mechanism (exists): `civ7 game exec "<JS>"` → tuner socket via `executeCiv7Command` (`packages/cli/src/commands/game/exec.ts:71-77`), default state `"App UI"` (`session/constants.ts:5`), returns `response.output`. Run AFTER a single-player map is generated and loaded (boot via `runCiv7SinglePlayerFromSetup` per MEMORY `civ7-live-map-launch-and-capture`), when `GameplayMap`/`TerrainBuilder` are populated. Pick two anchors, same `x`, one even `y` and one odd `y`, ≥4 tiles from edges, on terrain/biome satisfying the wonder's `Feature_ValidTerrains`/`Feature_ValidBiomes`.

**Method 1 — per-parity direction calibration (no placement):**
```js
JSON.stringify([0,1,2,3,4,5].map(d => {
  const p = GameplayMap.getAdjacentPlotLocation({x:ax,y:ay}, d);
  return {dir:d, dx:p.x-ax, dy:p.y-ay};
}))
```
Run with `ay` even and `ay` odd → authoritative per-parity direction table; directly validates/corrects the static offsets.

**Method 2 — place-then-readback the actual stamp:**
```js
const fp = { Feature: Database.makeHash("FEATURE_GRAND_CANYON"),
             Direction: -1, Elevation: GameplayMap.getElevation(ax, ay) };
// guard: if (!TerrainBuilder.canHaveFeatureParam(ax, ay, fp)) bail
TerrainBuilder.setFeatureType(ax, ay, fp);
const out = [];
for (let dy=-3; dy<=3; dy++) for (let dx=-3; dx<=3; dx++){
  const x=ax+dx, y=ay+dy;
  if (y<0||y>=GameplayMap.getGridHeight()) continue;
  if (GameplayMap.getFeatureType(x,y) === fp.Feature) out.push({dx, dy});
}
JSON.stringify({anchor:{ax,ay}, cells: out})
```
The `cells` set IS the footprint at that parity. Repeat per FOUR\* class (one representative each) and per parity. Cross-check `cells` against Method 1's direction table to express footprints as `anchor + {direction-index combinations}` so they generalize across parity/wrap. Because Direction is -1, also confirm whether the resolved orientation varies with local terrain across several anchors; if so, keep `direction:-1` in the model and validate the resolved footprint by readback.

**Acceptance:** the model is correct only when, for each FOUR\* class, the generated indices match the live `cells` set on **both** an even-row and an odd-row anchor.

**Risk:** if the engine resolves direction differently per anchor terrain, FOUR\* footprints can't be a fixed offset set — the model must defer orientation to the engine and only validate post-resolution. Probe both parities AND multiple anchors per class to detect this before committing a fixed table.

---

## 5. Adjacency predicate odd-R models (the 5 new tags)

All 5 are `Category="FEATURE_ATTRIBUTE"` `TypeTags`, evaluated inside C++ `canHaveFeatureParam`; the strings appear ONLY in terrain XML (declaration + attachment), in NO `.js` file. The 12 currently-supported tags are treated as engine-evaluated predicates the model does not re-implement (`SUPPORTED_POLICY_TAGS`, `natural-wonder-footprints.ts:21-34`); `hasUnsupportedNaturalWonderPolicyTags` merely gates which wonders the policy will place. The 5 new tags should be added to `SUPPORTED_POLICY_TAGS` once the engine readback is confirmed; an odd-R superset is a cheap pre-filter, the engine `canHaveFeatureParam` is the final authority.

Model each predicate as a 6-neighbor odd-R check using the parity offsets from `policy-grid.ts:16-34` (even `(-1,1),(-1,-1)`; odd `(1,1),(1,-1)`; common `(1,0),(-1,0),(0,1),(0,-1)`).

| Tag | Wonder | Semantics | odd-R model | Superset safe? |
|---|---|---|---|---|
| **ADJACENTTOCOAST** | Bermuda (0) | ≥1 neighbor is coast terrain | TRUE iff ≥1 of 6 odd-R neighbors has terrainType==COAST(3). Mirrors `isAdjacentToShallowWater` idiom (`feature-biome-generator.js:337`). | Yes — over-include where any neighbor is coast/shallow; engine rejects |
| **NOTADJACENTTOLAND** | Bermuda (0) | NO neighbor is land | TRUE iff NONE of 6 odd-R neighbors is land (land = non-water; water test mirrors `GameplayMap.isWater`). Engine `isAdjacentToLand` keys on PLOT_TAG_ISLAND (`map-utilities.js:609-625`), uncertain vs `isWater`. | Conservative reading safe; island-tag borderline cases settled by readback |
| **ADJACENTTOSAMETERRAIN** | Great Blue Hole (44) | ≥1 neighbor shares anchor terrain | TRUE iff ≥1 of 6 odd-R neighbors has terrainType==anchor's. GBH is COAST → "adjacent to another coast". Mirrors supported ADJACENTTOSAMEBIOME. | Yes |
| **ADJACENTCLIFF** | Mapu'a Vaea (45) | anchor has ≥1 cliff EDGE | TRUE iff ∃ direction d∈{0..5} with `GameplayMap.isCliffCrossing(ax,ay,d)`. Per-EDGE, not per-neighbor-tile. Mirrors `isCliff` (`map-utilities.js:403-410`); storage `PlotCliffs.IsNEOfCliff/IsWOfCliff/IsNWOfCliff` (`schema-worldbuilder-map.sql:99-101`). Direction index must use engine `getAdjacentPlotLocation` order (calibrate via §4 Method 1). | Yes if every accepted candidate is re-validated by engine |
| **NOLANDOPPOSITECLIFF** | Mapu'a Vaea (45) | for the cliff edge, the tile opposite across it is not land | For each d where `isCliffCrossing(anchor,d)`, neighbor in direction `(d+3)%6` must NOT be land. Composite of cliff-edge + opposite-neighbor + land test; no JS helper. Most dependent on live calibration of the engine's opposite-direction pairing. | **Mandatory readback** — do NOT ship a hardcoded cliff truth table without live confirmation |

**Predicate calibration probe** (same `game exec` mechanism):
```js
// authoritative per-tile verdict
const fp = { Feature: Database.makeHash("FEATURE_MAPU_A_VAEA_BLOWHOLES"),
             Direction:-1, Elevation: GameplayMap.getElevation(ax,ay) };
JSON.stringify({x:ax,y:ay, canPlace: TerrainBuilder.canHaveFeatureParam(ax,ay,fp)})
```
```js
// neighbor + cliff state to reverse-engineer the truth table
JSON.stringify([0,1,2,3,4,5].map(d=>({
  dir:d,
  cliff: GameplayMap.isCliffCrossing(ax,ay,d),
  nbr: (()=>{const p=GameplayMap.getAdjacentPlotLocation({x:ax,y:ay},d);
            return {terrain:GameplayMap.getTerrainType(p.x,p.y), water:GameplayMap.isWater(p.x,p.y)};})()
})))
```
For NOLANDOPPOSITECLIFF: on a tile with exactly one cliff edge, vary the land/water tile across each direction and observe which neighbor's land-state flips `canHaveFeatureParam` — confirms whether "opposite" is `(d+3)%6` in engine index order. Run on both parities.

---

## 6. Refined, dependency-ordered implementation plan

| # | Area | Change | Depends on |
|---|---|---|---|
| 1 | Live probe (geometry) | Boot live single-player map; run §4 Method 1 (direction calibration, both parities) + Method 2 (place-then-readback per FOUR\* class, both parities). Capture ground-truth `cells` sets and per-parity direction tables. | live engine + `civ7 game exec` (exists) |
| 2 | Live probe (predicates) | Run §5 calibration probes for the 5 tags; reverse-engineer truth tables; confirm NOLANDOPPOSITECLIFF opposite-pairing. | step 1 (shares boot + direction calibration) |
| 3 | Footprint parity fix | Make `CIV7_DIRECTION_OFFSETS` parity-aware in `natural-wonder-footprints.ts` (even/odd diagonals per `policy-grid.ts:16-34`); add even-row test alongside `map-policy.test.ts:200-213`. | step 1 |
| 4 | FOUR\* footprints | Implement FOURPARALLELAGRM/FOURADJACENT/FOURL in `getNaturalWonderFootprintOffsets` from probe results; keep engine-resolved direction (-1) if orientation is terrain-dependent. Remove the `inputs.ts:165` silent drop for these classes. | steps 1, 3 |
| 5 | Predicate tags | Add the 5 tags to `SUPPORTED_POLICY_TAGS`; implement odd-R supersets in the planner tag switch (`default.ts:343-485`) for ADJACENTTOCOAST, NOTADJACENTTOLAND, ADJACENTTOSAMETERRAIN, ADJACENTCLIFF, NOLANDOPPOSITECLIFF. Cliffs are edge-based via probe-calibrated direction order. | step 2 |
| 6 | Signal forwarding | Forward already-computed signals into the planner: volcanoMask(+strength), shelfMask, bathymetry, distanceToCoast/coastalWater, vegetationDensity, discharge/slopeClass/streamOrderProxy, freezeIndex, erodibilityK, orogeny/roughnessPotential, moisture/temperature/fertility. Extend `DerivePlacementInputsContract.artifacts.requires` (`contract.ts:38-48`), wire through `inputs.ts:190-211`, type in planner `contract.ts:6-51`. | — (parallel with 1-5) |
| 7 | Replace no-op tag handlers | Wire VOLCANO→volcanoMask, SHALLOWWATER→shelfMask, FEATURE_FOREST→vegetationDensity in the planner switch (currently no-op pass `default.ts:360-363`); decide FEATURE_REEF policy (no suitability signal — keep as engine-deferred filter). | step 6 |
| 8 | Per-group suitability scoring | Replace the single `priority` (`default.ts:127`) with per-wonder-group weighted, biome-aware `suitability(wonder,tile)` using §3.3 groups + forwarded signals. Keep hard filters as pass/fail; rank passing tiles by group score; deterministic tie-break by tile index. | steps 6, 7 |
| 9 | Selection + spacing integration | Update `chooseFeatureCandidate`/min-spacing passes (`default.ts:156-198,557-618`) to consume per-group suitability instead of the global priority sort; preserve relaxed-retry. | step 8 |
| 10 | Effects validation (live) | Confirm effects activate on the new placements: boot live map, place each group's wonders, verify yields/modifiers/volcano events via Scripting.log + tuner readback. (No effect code to write — vanilla types are engine-automatic; this is a placement-fidelity gate.) | steps 4, 5, 9 |
| 11 | Regression: no silent drops | Assert all 20 wonders are catalog-eligible (none dropped at `inputs.ts:165`) and footprint-valid on both parities; add coverage test. | steps 4, 9 |

---

## 7. Open questions

1. **Does the engine resolve FOUR\* orientation deterministically per anchor, or does it depend on local terrain?** If terrain-dependent, FOUR\* cannot be a fixed offset table — the model must defer orientation to the engine. Resolve via §4 Method 2 across multiple anchors per class.
2. **Exact "land" definition in `canHaveFeatureParam`** for NOTADJACENTTOLAND — PLOT_TAG_ISLAND (map-script notion) vs `isWater` (engine). Resolve via §5 readback sweep.
3. **Engine direction-index ordering for cliffs** — is "opposite" `(d+3)%6` in `getAdjacentPlotLocation` order? Required before any ADJACENTCLIFF/NOLANDOPPOSITECLIFF superset is trusted.
4. **Is there a usable reef-suitability signal**, or must FEATURE_REEF (Barrier Reef) stay a pure engine-deferred filter with no scoring contribution? No artifact computes reef potential today.
5. **PlaceFirst ordering** (Valley of Flowers, Gullfoss, Iguazu) is not modeled — the planner orders by featureType id (`default.ts:91`). Does the overhaul need to honor PlaceFirst, or is per-group suitability sufficient?
6. **Polar-row NW ban** (`polarWaterRows=2`, `inputs.ts:107-118`) vs the engine's own latitude constraints — do they agree, and does any group (e.g. Torres/tundra) need polar tiles the ban currently excludes?
7. **Does forwarding ~16 new signal arrays into the placement step hit any memory/perf budget** in the artifact contract, or should signals be lazily derived per-group?
8. **Selection count/quotas** — does the overhaul keep vanilla per-map wonder counts, and does changing which wonders are placed (and thus which effects are live, §2.2) require a balance review?
