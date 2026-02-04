# Status: Project doc (MapGen Studio)

This page is **not** canonical MapGen documentation.

Canonical entrypoints:
- `docs/system/libs/mapgen/MAPGEN.md`
- `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md`

# BrowserAdapter Capability Spec (MapGen Studio)

This document defines the **minimum viable adapter surface** required to run mapgen in the browser (Web Worker), plus the longer-term “full standard recipe” requirements.

The browser runner should treat Civ7 as a **reference renderer/runtime**, not the primary iteration environment.

## Scope

- Adapter interface: `EngineAdapter` from `@civ7/adapter`
- Runner target: MapGen Studio Web Worker
- Recipe focus:
  - **V0.1:** `browser-test` recipe end-to-end in-browser (currently Foundation-only)
  - **V0.2:** `standard` recipe end-to-end in-browser

## Civ7-derived tables as bundled data packages (no runtime fetching)

The browser runner must be self-contained:
- no server round-trips for mapgen execution
- no runtime HTTP fetches for core Civ7 tables required by adapter lookups

The expected flow is:
1. Source of truth: Civ7 official resources (XML, etc.) in `.civ7/outputs/resources`.
2. A script extracts/normalizes the minimal data needed for browser execution (map sizes, name→index tables, etc.).
3. The script emits checked-in artifacts or build-generated artifacts as TS/JSON modules.
4. The Web Worker imports these modules directly and passes them into the BrowserAdapter.

This keeps:
- bundling deterministic (no “data injection” from the UI at runtime),
- behavior consistent across local dev and static deployments,
- adapter parity anchored to Civ’s source data without importing Civ engine runtime modules.

## Inventory: adapter calls used today

### Browser test recipe (`mods/mod-swooper-maps/src/recipes/browser-test/recipe.ts`)

Foundation stage steps use `ctxRandom(...)`, which calls `adapter.getRandomNumber(...)`.

In addition, `createExtendedMapContext(...)` initializes terrain constants and therefore requires name→index lookups during context creation.

**Required by Foundation (today):**
- `width`, `height`
- `getRandomNumber(max, label)`
- `getTerrainTypeIndex(name)`
- `getBiomeGlobal(name)`
- `getFeatureTypeIndex(name)`

### Standard recipe (`mods/mod-swooper-maps/src/recipes/standard/recipe.ts`)

The standard recipe uses these adapter members (directly or via `createExtendedMapContext` helpers):

- `getMapSizeId()`, `lookupMapInfo(mapSizeId)`
- `getRandomNumber(max, label)`
- `getTerrainTypeIndex(name)`, `getBiomeGlobal(name)`, `getFeatureTypeIndex(name)`, `getPlotEffectTypeIndex(name)`, `getLandmassId(name)`
- `getTerrainType(x,y)`, `setTerrainType(x,y,terrainType)`, `isWater(x,y)`
- `getElevation(x,y)`
- `getRainfall(x,y)`, `setRainfall(x,y,rainfall)`
- `getLatitude(x,y)`
- `getFeatureType(x,y)`, `setFeatureType(x,y,featureData)`, `canHaveFeature(x,y,featureType)`
- `setBiomeType(x,y,biomeId)`
- `addPlotEffect(x,y,plotEffectType)`
- `setLandmassRegionId(x,y,regionId)`
- `setStartPosition(plotIndex, playerId)`
- `validateAndFixTerrain()`, `recalculateAreas()`, `stampContinents()`, `buildElevation()`
- `modelRivers(minLen,maxLen,navigableTerrain)`, `defineNamedRivers()`, `storeWaterData()`
- `generateLakes(width,height,tilesPerLake)`, `expandCoasts(width,height)`
- `addNaturalWonders(width,height,numWonders)`, `generateResources(width,height)`, `generateDiscoveries(width,height,startPositions)`
- `addFloodplains(minLen,maxLen)`, `recalculateFertility()`, `assignAdvancedStartRegions()`
- `verifyEffect(effectId)`

**Direct callsites by stage (standard recipe):**
- `map-morphology`: `buildElevation`, `expandCoasts`, `getFeatureTypeIndex`, `isWater`, `recalculateAreas`, `setFeatureType`, `setTerrainType`, `stampContinents`, `validateAndFixTerrain`
- `map-hydrology`: `defineNamedRivers`, `generateLakes`, `getTerrainType`, `isWater`, `modelRivers`, `validateAndFixTerrain`
- `map-ecology`: `addPlotEffect`, `canHaveFeature`, `getBiomeGlobal`, `getFeatureType`, `getFeatureTypeIndex`, `getPlotEffectTypeIndex`, `recalculateAreas`, `setBiomeType`, `setFeatureType`, `validateAndFixTerrain`
- `placement`: `addFloodplains`, `addNaturalWonders`, `assignAdvancedStartRegions`, `generateDiscoveries`, `generateResources`, `getLandmassId`, `getTerrainType`, `isWater`, `recalculateAreas`, `recalculateFertility`, `setLandmassRegionId`, `setStartPosition`, `storeWaterData`, `validateAndFixTerrain`

**Other usage (standard recipe):**
- Narrative utilities read from the adapter: `getElevation`, `getLatitude`, `getRainfall`, `getTerrainType`, `isWater`.
- Core helpers used by multiple stages:
  - `ctxRandom(...)` → `getRandomNumber(...)`
  - `writeHeightfield(...)` → `setTerrainType(...)`
  - `writeClimateField(...)` → `setRainfall(...)`
  - `snapshotEngineHeightfield(...)` → `getTerrainType(...)`, `getElevation(...)`, `isWater(...)` (viz/dumps only; must not overwrite physics-truth buffers)

## Feasibility classification (browser runner)

This section classifies each currently-used member into one of four buckets:

### (a) Pure/local emulation (browser-native, deterministic)

Implement in memory with typed arrays / plain objects; no external game resources required beyond constants already carried by the pipeline.

- Dimensions: `width`, `height`
- Deterministic RNG: `getRandomNumber(max, label)`
- Latitude: `getLatitude(x,y)` (derive from `env.latitudeBounds` + tile Y)
- Terrain/fields storage:
  - `getTerrainType(x,y)`, `setTerrainType(x,y,terrainType)`, `isWater(x,y)`
  - `getElevation(x,y)` (if/when stored; otherwise treat as derived field)
  - `getRainfall(x,y)`, `setRainfall(x,y,rainfall)`
  - `getFeatureType(x,y)`, `setFeatureType(x,y,featureData)`
  - `setBiomeType(x,y,biomeId)`
  - `setLandmassRegionId(x,y,regionId)`
  - `setStartPosition(plotIndex, playerId)` (store evidence for viz/debug)
- Effects surface: `verifyEffect(effectId)` (adapter-owned evidence tracking)
- Plot effects: `addPlotEffect(x,y,plotEffectType)` (store a set per tile)

### (b) Needs data tables/resources (must be supplied to the browser)

These are “lookup” calls whose outputs must match Civ7 indices/rows to preserve parity.

- Map size / map info:
  - `getMapSizeId()`
  - `lookupMapInfo(mapSizeId)`
- Name → index mappings:
  - `getTerrainTypeIndex(name)`
  - `getBiomeGlobal(name)`
  - `getFeatureTypeIndex(name)`
  - `getPlotEffectTypeIndex(name)`
  - `getLandmassId(name)`

**Required input data (minimum):**
- `mapInfoById`: map size id → `MapInfo` row (at least width/height and any standard-runtime fields)
- `terrainIndexByName`
- `biomeIndexByName`
- `featureIndexByName`
- `plotEffectIndexByName` (only needed once `map-ecology` runs in-browser)
- `landmassIdByName` (only needed once placement runs in-browser)

**Packaging guidance:**
- Prefer one importable “tables module” per Civ domain (or one consolidated module) rather than many tiny JSON fetches.
- Keep the worker-facing API stable: `{ mapInfoById, terrainIndexByName, ... }`.
- Version table artifacts explicitly (e.g. include an extracted game build/version string if available) so behavior changes are explainable.

### (c) Needs Civ7 engine behavior we must approximate (or replace)

These currently wrap Civ7 engine algorithms (TerrainBuilder/AreaBuilder/base-standard scripts). They should be treated as *engine-coupled*, not simple data mutations.

- Terrain “fixups” + derived area state:
  - `validateAndFixTerrain()`
  - `recalculateAreas()`
  - `stampContinents()`
  - `buildElevation()`
- Rivers / water bookkeeping:
  - `modelRivers(...)`, `defineNamedRivers()`, `storeWaterData()`
- Coast/lake generators:
  - `generateLakes(...)`, `expandCoasts(...)`
- Placement & content generators:
  - `addNaturalWonders(...)`, `generateResources(...)`, `generateDiscoveries(...)`
  - `addFloodplains(...)`, `recalculateFertility()`, `assignAdvancedStartRegions()`
- Validation gates that may encode Civ7-specific rules:
  - `canHaveFeature(x,y,featureType)`

For browser-runner parity, each of these needs one of:
- a mapgen-native reimplementation (preferred long-term), or
- an explicit approximation contract (acceptable for debug-only stages), or
- “stub/throw” until implemented (preferred for V0.1 to avoid false confidence).

### (d) Forbidden in browser-runner mode

These should throw immediately if reached in a browser run because they imply engine ownership or side effects outside the worker.

- `setMapInitData(...)` (engine call boundary; browser runner owns init entirely)
- Anything that would require importing Civ7 `/base-standard/...` modules or reading Civ7 global engine state

## V0.1 requirements (Foundation in-browser)

**Must implement (V0.1):**
- `width`, `height`
- `getRandomNumber(max, label)`
- `getTerrainTypeIndex(name)` (for terrain constants initialization)
- `getBiomeGlobal(name)` (for biome constants initialization)
- `getFeatureTypeIndex(name)` (for feature constants initialization)

**Should stub/throw (V0.1):**
- All “engine behavior” methods in (c) unless Foundation explicitly needs them.
  - Recommended posture: throw with a clear message (e.g. `"BrowserAdapter: modelRivers not supported in V0.1 (foundation-only)"`).

**May remain unimplemented (V0.1) if not imported/used:**
- Any adapter methods not exercised by Foundation (e.g., placement and content generators).

## V0.2 requirements (Standard in-browser)

To run the full standard recipe in-browser, the adapter must:

- Implement all (a) members faithfully and deterministically.
- Provide the data tables listed in (b) in a Civ7-parity form.
- Decide per (c) method whether to:
  - replace with mapgen-native logic (preferred), or
  - preserve a “best-effort” approximation with explicit UX labeling (“engine parity not guaranteed”).

In practice, V0.2 should treat (c) as the main integration backlog.
