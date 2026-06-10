/**
 * @civ7/adapter - Type definitions for the engine adapter interface
 *
 * The EngineAdapter interface abstracts all engine/surface interactions.
 * Core logic consumes this interface; tests can mock it.
 */

/// <reference types="@civ7/types" />

/**
 * Feature placement data
 */
export interface FeatureData {
  Feature: number;
  Direction: number;
  Elevation: number;
}

export interface NaturalWonderCatalogEntry {
  featureType: number;
  direction: number;
}

export interface DiscoveryCatalogEntry {
  discoveryVisualType: number;
  discoveryActivationType: number;
}

/**
 * Runtime resource catalog row used to enrich placement telemetry with
 * symbolic resource names. The live adapter reads GameInfo.Resources; the
 * mock adapter serves the static policy-table catalog.
 */
export interface ResourceCatalogEntry {
  index: number;
  resourceType: string;
  resourceClassType: string | null;
  name: string | null;
}

/**
 * Named resource rejection reasons keep placement reconciliation auditable.
 * MapGen owns the deterministic intent; the adapter owns Civ7 feasibility and
 * readback evidence instead of hiding drift behind aggregate generator counts.
 */
export type ResourcePlacementRejectionReason =
  | "out-of-bounds"
  | "invalid-resource-type"
  | "cannot-have-resource";

export type ResourcePlacementMismatchReason = "wrong-resource-type";

/**
 * A single deterministic resource request from the map recipe to the engine
 * adapter. It is intentionally plot-index based because recipe artifacts use
 * tile-linear plans before adapter materialization converts to x/y.
 */
export interface ResourcePlacementIntent {
  plotIndex: number;
  resourceType: number;
}

/**
 * Resource reconciliation result for one planned intent. Rejections are normal
 * engine feasibility outcomes; mismatches mean the adapter accepted the intent
 * but the engine readback disagreed, which callers should treat as fail-hard.
 */
export type ResourcePlacementOutcome =
  | {
      status: "placed";
      plotIndex: number;
      x: number;
      y: number;
      resourceType: number;
      observedResourceType: number;
    }
  | {
      status: "rejected";
      plotIndex: number;
      x: number;
      y: number;
      resourceType: number;
      reason: ResourcePlacementRejectionReason;
      observedResourceType?: number;
    }
  | {
      status: "mismatch";
      plotIndex: number;
      x: number;
      y: number;
      resourceType: number;
      reason: ResourcePlacementMismatchReason;
      observedResourceType: number;
    };

/**
 * Named discovery rejection reasons mirror resource reconciliation without
 * pretending Civ7 exposes resource-like discovery readback.
 */
export type DiscoveryPlacementRejectionReason =
  | "out-of-bounds"
  | "invalid-discovery-type"
  | "adapter-rejected";

/**
 * A single deterministic discovery request from placement planning. Visual and
 * activation ids stay paired so the adapter can materialize the exact catalog
 * entry selected by the planner.
 */
export interface DiscoveryPlacementIntent {
  plotIndex: number;
  discoveryVisualType: number;
  discoveryActivationType: number;
}

/**
 * Discovery reconciliation result for one planned intent. The adapter can only
 * confirm placement or expose a named rejection, so there is no discovery
 * mismatch state until Civ7 offers richer readback.
 */
export type DiscoveryPlacementOutcome =
  | {
      status: "placed";
      plotIndex: number;
      x: number;
      y: number;
      discoveryVisualType: number;
      discoveryActivationType: number;
    }
  | {
      status: "rejected";
      plotIndex: number;
      x: number;
      y: number;
      discoveryVisualType: number;
      discoveryActivationType: number;
      reason: DiscoveryPlacementRejectionReason;
    };

/**
 * Natural-wonder rejection reasons expose which adapter/materialization
 * boundary failed without changing planner intent.
 */
export type NaturalWonderPlacementRejectionReason =
  | "out-of-bounds"
  | "unsupported-footprint"
  | "can-have-feature-param-false"
  | "set-feature-false"
  | "readback-mismatch";

export type NaturalWonderFootprintReadback = {
  plotIndex: number;
  observedFeatureType: number;
};

export type NaturalWonderFootprintReadbackStatus =
  | "empty-expected-footprint"
  | "partial-expected-footprint";

export type NaturalWonderPlacementOutcome =
  | {
      status: "placed";
      plotIndex: number;
      x: number;
      y: number;
      featureType: number;
      direction: number;
      elevation: number;
    }
  | {
      status: "rejected";
      plotIndex: number;
      x: number;
      y: number;
      featureType: number;
      direction: number;
      elevation?: number;
      reason: NaturalWonderPlacementRejectionReason;
      observedFeatureType?: number;
      observedPlotIndex?: number;
      expectedFootprintReadback?: NaturalWonderFootprintReadback[];
      expectedFootprintReadbackStatus?: NaturalWonderFootprintReadbackStatus;
    };

/**
 * Map dimensions
 */
export interface MapDimensions {
  width: number;
  height: number;
}

/**
 * Map size selection key as returned by Civ7's `GameplayMap.getMapSize()`.
 *
 * Civ7 type declarations currently surface this as a `string`, but some codepaths
 * treat it as a numeric ID. For adapter extensibility, the boundary accepts both.
 */
export type MapSizeId = string | number;

/**
 * Map initialization parameters for Civ7's `SetMapInitData` engine call.
 *
 * These values establish the grid + latitude bounds for map generation.
 * Wrap posture is Foundation-owned and is not configured at this boundary.
 */
export interface MapInitParams {
  width: number;
  height: number;
  topLatitude?: number;
  bottomLatitude?: number;
  mapSize?: MapSizeId;
}

/**
 * Map info row returned by Civ7's `GameInfo.Maps.lookup(mapSizeId)`.
 *
 * Note: Civ7 fields are PascalCase; values may be missing in tests and should be
 * treated as optional by consumers.
 */
export interface MapInfo {
  // === Map Size Dimensions ===
  GridWidth?: number;
  GridHeight?: number;
  MinLatitude?: number;
  MaxLatitude?: number;
  // === Game Setup Parameters ===
  NumNaturalWonders?: number;
  LakeGenerationFrequency?: number;
  PlayersLandmass1?: number;
  PlayersLandmass2?: number;
  StartSectorRows?: number;
  StartSectorCols?: number;
  [key: string]: unknown;
}

/**
 * Adapter readback for deterministic lake projection.
 *
 * The planned mask is MapGen truth; readback fields are engine evidence used by
 * projection diagnostics and final runtime proof. Water and lake classification
 * are separate because Civ7 can render or cache water without classifying that
 * tile as a lake, which is exactly the failure mode this contract must expose.
 */
export interface LakeProjectionResult {
  width: number;
  height: number;
  plannedLakeMask: Uint8Array;
  stampedLakeMask: Uint8Array;
  rejectedLakeMask: Uint8Array;
  engineTerrain: Int32Array;
  engineWaterMask: Uint8Array;
  engineLakeMask: Uint8Array;
  engineAreaId: Int32Array;
  engineElevation: Int16Array;
  terrainMismatchMask: Uint8Array;
  nonWaterMask: Uint8Array;
  nonLakeMask: Uint8Array;
  plannedLakeTileCount: number;
  stampedLakeTileCount: number;
  rejectedLakeTileCount: number;
  terrainMismatchTileCount: number;
  nonWaterTileCount: number;
  nonLakeTileCount: number;
}

/**
 * Adapter readback for deterministic river projection.
 *
 * MapGen can deterministically choose navigable-river terrain today. Civ7's
 * river metadata remains a separate proof surface from raw terrain rows: a run
 * can have navigable-river terrain while still lacking live river metadata.
 * This result therefore keeps terrain and metadata parity separate. Exact
 * Hydrology-to-engine river parity still requires readback comparison because
 * the engine runtime surface is not a per-tile Hydrology metadata setter.
 */
export interface RiverProjectionResult {
  width: number;
  height: number;
  plannedNavigableRiverMask: Uint8Array;
  /** MapGen-planned tiles accepted as raw TERRAIN_NAVIGABLE_RIVER terrain. */
  stampedNavigableRiverMask: Uint8Array;
  /** MapGen-planned tiles absent from raw TERRAIN_NAVIGABLE_RIVER terrain readback. */
  rejectedNavigableRiverMask: Uint8Array;
  engineTerrain: Int32Array;
  engineRiverType: Int32Array;
  engineIsRiverMask: Uint8Array;
  /** Civ river metadata/API navigable readback; terrain readback is terrainNavigableRiverMask. */
  engineNavigableRiverMask: Uint8Array;
  engineMinorRiverMask: Uint8Array;
  terrainNavigableRiverMask: Uint8Array;
  /** Projected navigable mask vs raw TERRAIN_NAVIGABLE_RIVER terrain mismatch. */
  navigableRiverMismatchMask: Uint8Array;
  plannedNavigableRiverTileCount: number;
  stampedNavigableRiverTileCount: number;
  rejectedNavigableRiverTileCount: number;
  extraNavigableRiverTileCount: number;
  navigableRiverMismatchTileCount: number;
  engineRiverTileCount: number;
  engineNavigableRiverTileCount: number;
  engineMinorRiverTileCount: number;
  terrainNavigableRiverTileCount: number;
  /** Whether this adapter/runtime can author Civ7 minor-river metadata directly from MapGen intent. */
  minorRiverStampingSupported: boolean;
  minorRiverUnsupportedReason: string;
}

// ============================================================================
// Voronoi Utilities (foundation dependency)
// ============================================================================

export interface VoronoiPoint2D {
  x: number;
  y: number;
}

export interface VoronoiSite extends VoronoiPoint2D {
  voronoiId?: number;
}

export interface VoronoiHalfEdge {
  getStartpoint(): VoronoiPoint2D;
  getEndpoint(): VoronoiPoint2D;
}

export interface VoronoiCell {
  site: VoronoiSite;
  halfedges: VoronoiHalfEdge[];
}

export interface VoronoiDiagram {
  cells: VoronoiCell[];
  edges: unknown[];
  vertices: VoronoiPoint2D[];
}

export interface VoronoiBoundingBox {
  xl: number;
  xr: number;
  yt: number;
  yb: number;
}

export interface VoronoiUtils {
  createRandomSites(count: number, width: number, height: number): VoronoiSite[];
  computeVoronoi(
    sites: VoronoiSite[],
    bbox: VoronoiBoundingBox,
    relaxationSteps?: number
  ): VoronoiDiagram;
  calculateCellArea(cell: VoronoiCell): number;
  normalize(v: VoronoiPoint2D): VoronoiPoint2D;
}

/**
 * Plot tag names exposed by the engine.
 */
export type PlotTagName =
  | "NONE"
  | "LANDMASS"
  | "WATER"
  | "EAST_LANDMASS"
  | "WEST_LANDMASS"
  | "EAST_WATER"
  | "WEST_WATER"
  | "ISLAND";

/**
 * Landmass region names exposed by the engine.
 */
export type LandmassIdName = "NONE" | "WEST" | "EAST" | "DEFAULT" | "ANY";

/**
 * EngineAdapter - abstraction for all engine/surface interactions
 *
 * All terrain/feature reads and writes MUST go through this interface.
 * Implementations:
 * - Civ7Adapter: uses GameplayMap, TerrainBuilder, etc. (production)
 * - MockAdapter: configurable mock for testing (no engine dependencies)
 */
export interface EngineAdapter {
  /** Map width */
  readonly width: number;
  /** Map height */
  readonly height: number;

  // === MAP INIT / MAP INFO ===

  /**
   * Get the current map size selection ID (Civ7: `GameplayMap.getMapSize()`).
   *
   * For non-Civ7 adapters, this can return a stable sentinel.
   */
  getMapSizeId(): MapSizeId;

  /**
   * Lookup the Civ7 map info row for the given `mapSizeId`
   * (Civ7: `GameInfo.Maps.lookup(mapSizeId)`).
   */
  lookupMapInfo(mapSizeId: MapSizeId): MapInfo | null;

  /**
   * Apply map initialization parameters (Civ7: `engine.call("SetMapInitData", ...)`).
   */
  setMapInitData(params: MapInitParams): void;

  // === TERRAIN READS ===

  /** Check if tile is water */
  isWater(x: number, y: number): boolean;

  /** Check whether Civ7 classifies the tile as lake water */
  isLake(x: number, y: number): boolean;

  /** Get Civ7's area id for water/land topology readback */
  getAreaId(x: number, y: number): number;

  /** Check if tile is mountain */
  isMountain(x: number, y: number): boolean;

  /** Check if tile is near rivers */
  isAdjacentToRivers(x: number, y: number, radius?: number): boolean;

  /** Get Civ7 river type metadata for a tile, using the runtime's no-river sentinel when absent. */
  getRiverType(x: number, y: number): number;

  /** Check whether Civ7 classifies the tile as any river type. */
  isRiver(x: number, y: number): boolean;

  /** Check whether Civ7 classifies the tile as a navigable river. */
  isNavigableRiver(x: number, y: number): boolean;

  /** Get tile elevation */
  getElevation(x: number, y: number): number;

  /** Get terrain type ID */
  getTerrainType(x: number, y: number): number;

  /**
   * Resolve terrain type index by name
   * @param name - Terrain type name (e.g., "TERRAIN_MOUNTAIN")
   * @returns Terrain index or -1 if not found
   */
  getTerrainTypeIndex(name: string): number;

  /** Get rainfall (0..200) */
  getRainfall(x: number, y: number): number;

  /** Get temperature */
  getTemperature(x: number, y: number): number;

  /** Get latitude in degrees */
  getLatitude(x: number, y: number): number;

  // === TERRAIN WRITES ===

  /** Set terrain type */
  setTerrainType(x: number, y: number, terrainType: number): void;

  /** Set rainfall (0..200) */
  setRainfall(x: number, y: number, rainfall: number): void;

  /** Set landmass region ID for start position filtering */
  setLandmassRegionId(x: number, y: number, regionId: number): void;

  /** Set landmass ID for start position filtering (alias of setLandmassRegionId) */
  setLandmassId(x: number, y: number, regionId: number): void;

  /** Add a plot tag to a tile (used for start position filtering) */
  addPlotTag(x: number, y: number, plotTag: number): void;

  /** Set plot tag (replaces existing tags) */
  setPlotTag(x: number, y: number, plotTag: number): void;

  /**
   * Resolve plot tag ID by name
   * @param name - Plot tag name (e.g., "LANDMASS")
   * @returns Plot tag ID or -1 if not found
   */
  getPlotTagId(name: PlotTagName): number;

  /**
   * Resolve landmass region ID by name
   * @param name - Landmass region name (e.g., "WEST")
   * @returns Landmass region ID or -1 if not found
   */
  getLandmassId(name: LandmassIdName): number;

  // === FEATURE READS/WRITES ===

  /** Get feature type ID */
  getFeatureType(x: number, y: number): number;

  /** Set feature */
  setFeatureType(x: number, y: number, featureData: FeatureData): void;

  /** Validate feature placement */
  canHaveFeature(x: number, y: number, featureType: number): boolean;

  /** Validate parameterized feature placement. */
  canHaveFeatureParam(x: number, y: number, featureData: FeatureData): boolean;

  // === RESOURCE READS/WRITES ===

  /** Adapter-owned sentinel value for "no resource". */
  readonly NO_RESOURCE: number;

  /** Get resource type ID (-1 when no resource is present). */
  getResourceType(x: number, y: number): number;

  /** Set resource type for a tile. */
  setResourceType(x: number, y: number, resourceType: number): void;

  /** Validate resource placement for a tile/resource combination. */
  canHaveResource(x: number, y: number, resourceType: number): boolean;

  /** Adapter-owned placeable resource type catalog used by deterministic placement. */
  getPlaceableResourceTypes(): number[];

  /**
   * Adapter-owned symbolic resource catalog (id, RESOURCE_* type, class,
   * display name) used by placement telemetry. Keeps GameInfo access at the
   * adapter boundary instead of recipe-layer globalThis reads.
   */
  getResourceCatalog(): ResourceCatalogEntry[];

  /**
   * Materialize one planned resource intent and report a typed per-tile outcome.
   * This keeps Civ7 feasibility/readback at the adapter boundary while letting
   * MapGen reconcile deterministic intent without count-equality gates.
   */
  placeResourceIntent(
    width: number,
    height: number,
    intent: ResourcePlacementIntent
  ): ResourcePlacementOutcome;

  // === PLOT EFFECTS ===

  /**
   * Resolve plot effect type indices that match all provided tags.
   * (Civ7: MapPlotEffects.getPlotEffectTypesContainingTags)
   */
  getPlotEffectTypesContainingTags(tags: string[]): number[];

  /**
   * Resolve a plot effect type index by name.
   * (Civ7: GameInfo.PlotEffects.lookup / MapPlotEffects tables)
   */
  getPlotEffectTypeIndex(name: string): number;

  /**
   * Add a plot effect at a tile.
   * (Civ7: MapPlotEffects.addPlotEffect)
   */
  addPlotEffect(x: number, y: number, plotEffectType: number): void;

  /**
   * Check whether a plot effect exists on a tile.
   * (Civ7: MapPlotEffects.hasPlotEffect)
   */
  hasPlotEffect(x: number, y: number, plotEffectType: number): boolean;

  // === EFFECT VERIFICATION ===

  /**
   * Verify that an engine-surface effect has been applied.
   * Used for effect:* postcondition checks (best-effort, adapter-owned).
   */
  verifyEffect(effectId: string): boolean;

  // === RANDOM NUMBER GENERATION ===

  /**
   * Civ7 engine RNG (0..max-1).
   *
   * MapGen-authored generation must not use this as an entropy source; use
   * `ctxRandom`/`deriveStepSeed` from `@swooper/mapgen-core` so Studio, tests,
   * and Civ7 runtime share the same pipeline-owned randomness. This adapter
   * method remains for adapter-owned compatibility with Civ7 engine surfaces.
   */
  getRandomNumber(max: number, label: string): number;

  // === UTILITIES ===

  /**
   * Voronoi utilities used by foundation plate generation.
   * Adapters must provide a deterministic implementation.
   */
  getVoronoiUtils(): VoronoiUtils;

  /** Run engine validation pass */
  validateAndFixTerrain(): void;

  /** Rebuild continent/area data */
  recalculateAreas(): void;

  /** Initialize fractal */
  createFractal(
    fractalId: number,
    width: number,
    height: number,
    grain: number,
    flags: number
  ): void;

  /** Sample fractal value */
  getFractalHeight(fractalId: number, x: number, y: number): number;

  /** Stamp continent assignments */
  stampContinents(): void;

  /** Build elevation layer */
  buildElevation(): void;

  /**
   * Compatibility-only wrapper for Civ7's high-level river generator
   * (`TerrainBuilder.modelRivers`).
   *
   * Standard MapGen-authored rivers must publish hydrology truth and project
   * selected navigable terrain through dedicated map stages instead of using
   * this method as a river truth or metadata-authoring surface.
   */
  modelRivers(minLength: number, maxLength: number, navigableTerrain: number): void;

  /** Define named rivers */
  defineNamedRivers(): void;

  /** Store water data */
  storeWaterData(): void;

  /**
   * Read back river terrain/metadata parity for a deterministic navigable
   * river projection. This is readback only; minor river stamping is not
   * represented until the adapter exposes a stable write capability.
   */
  readRiverProjection(
    width: number,
    height: number,
    plannedNavigableRiverMask: Uint8Array
  ): RiverProjectionResult;

  /** Generate lakes (wraps Civ7 base-standard elevation terrain generator) */
  generateLakes(width: number, height: number, tilesPerLake: number): void;

  /**
   * Stamp a deterministic lake plan and read back engine water acceptance.
   *
   * MapGen owns the plan; the adapter owns engine terrain mutation and cache refresh.
   */
  stampLakes(width: number, height: number, lakeMask: Uint8Array): LakeProjectionResult;

  /** Expand coasts (wraps Civ7 base-standard elevation terrain generator) */
  expandCoasts(width: number, height: number): void;

  // === BIOMES ===

  /**
   * Run base-standard biome designation
   * Wraps /base-standard/maps/biomes.js designateBiomes()
   */
  designateBiomes(width: number, height: number): void;

  /**
   * Get biome global index by name
   * @param name - Biome name (e.g., "tropical", "grassland", "tundra")
   * @returns Biome index or -1 if not found
   */
  getBiomeGlobal(name: string): number;

  /**
   * Set biome type for a tile
   */
  setBiomeType(x: number, y: number, biomeId: number): void;

  /**
   * Get biome type for a tile
   */
  getBiomeType(x: number, y: number): number;

  // === FEATURES (extended) ===

  /**
   * Run base-standard feature generation
   * Wraps /base-standard/maps/features.js addFeatures()
   */
  addFeatures(width: number, height: number): void;

  /**
   * Get feature type index by name
   * @param name - Feature type name (e.g., "FEATURE_REEF", "FEATURE_FOREST")
   * @returns Feature index or -1 if not found
   */
  getFeatureTypeIndex(name: string): number;

  /**
   * Sentinel value for "no feature"
   */
  readonly NO_FEATURE: number;

  // === PLACEMENT ===

  /**
   * Stamp a natural wonder deterministically at a specific tile.
   * Returns true when the placement succeeds.
   */
  stampNaturalWonder(
    x: number,
    y: number,
    featureType: number,
    direction: number,
    elevation?: number
  ): boolean;

  /**
   * Stamp a natural wonder and return a named placement outcome.
   */
  placeNaturalWonder(
    x: number,
    y: number,
    featureType: number,
    direction: number,
    elevation?: number
  ): NaturalWonderPlacementOutcome;

  /**
   * Stamp a discovery deterministically at a specific tile.
   * Returns true when the placement succeeds.
   */
  stampDiscovery(
    x: number,
    y: number,
    discoveryVisualType: number,
    discoveryActivationType: number
  ): boolean;

  /**
   * Materialize one planned discovery intent and report a typed per-tile outcome.
   * Discovery placement has no stable engine readback equivalent to resources,
   * so the adapter is the boundary that converts Civ7 acceptance into named
   * reconciliation evidence.
   */
  placeDiscoveryIntent(
    width: number,
    height: number,
    intent: DiscoveryPlacementIntent
  ): DiscoveryPlacementOutcome;

  /**
   * Run Civ7's official resource generator.
   * Wraps /base-standard/maps/resource-generator.js generateResources().
   *
   * Returns an observed/counted number of placed resources for placement outputs.
   */
  generateOfficialResources(
    width: number,
    height: number,
    minMarineResourceTypesOverride?: number
  ): number;

  /**
   * Run Civ7's official discovery generator.
   * Wraps /base-standard/maps/discovery-generator.js generateDiscoveries().
   *
   * Returns the number of successful discovery placements observed during generation.
   */
  generateOfficialDiscoveries(
    width: number,
    height: number,
    startPositions: ReadonlyArray<number>,
    polarMargin: number
  ): number;

  /** Engine catalog of natural wonder feature definitions. */
  getNaturalWonderCatalog(): NaturalWonderCatalogEntry[];

  /** Adapter-owned discovery visual/activation catalog for deterministic planners. */
  getDiscoveryCatalog(): DiscoveryCatalogEntry[];

  /**
   * Generate snow terrain
   * Wraps /base-standard/maps/snow-generator.js generateSnow()
   */
  generateSnow(width: number, height: number): void;

  /**
   * Assign starting positions for players
   * Wraps /base-standard/maps/assign-starting-plots.js assignStartPositions()
   */
  assignStartPositions(
    playersLandmass1: number,
    playersLandmass2: number,
    westContinent: ContinentBounds,
    eastContinent: ContinentBounds,
    startSectorRows: number,
    startSectorCols: number,
    startSectors: number[]
  ): number[];

  /**
   * Set a single player start position by plot index.
   * (Civ7: StartPositioner.setStartPosition)
   */
  setStartPosition(plotIndex: number, playerId: number): void;

  /**
   * Alive major player ids (Civ7: Players.getAliveMajorIds()).
   *
   * READ surface only: the adapter reports ids, it never decides seating.
   * The slot→player mapping is owned by the placement plan-starts op
   * (placement-realignment S4 / D3). The mock adapter returns contiguous ids
   * derived from its map info player counts.
   */
  getAliveMajorIds(): number[];

  /**
   * Assign advanced start regions
   * Wraps /base-standard/maps/assign-advanced-start-region.js assignAdvancedStartRegions()
   */
  assignAdvancedStartRegions(): void;

  /**
   * Add floodplains to rivers
   * Wraps TerrainBuilder.addFloodplains()
   */
  addFloodplains(minLength: number, maxLength: number): void;

  /**
   * Recalculate fertility values
   * Wraps FertilityBuilder.recalculate()
   */
  recalculateFertility(): void;

  /**
   * Choose start sectors for players
   * Wraps /base-standard/maps/assign-starting-plots.js chooseStartSectors()
   */
  chooseStartSectors(
    players1: number,
    players2: number,
    rows: number,
    cols: number,
    humanNearEquator: boolean
  ): unknown[];

  /**
   * Check if human player should start near equator
   * Wraps /base-standard/maps/map-utilities.js needHumanNearEquator()
   */
  needHumanNearEquator(): boolean;
}

/**
 * Continent bounds for start placement
 * Compatible with mapgen-core ContinentBounds
 */
export interface ContinentBounds {
  west: number;
  east: number;
  south: number;
  north: number;
  continent?: number;
}

/**
 * Map context for passing state between generation stages
 */
export interface MapContext {
  dimensions: MapDimensions;
  adapter: EngineAdapter;
  config: Record<string, unknown>;
}
