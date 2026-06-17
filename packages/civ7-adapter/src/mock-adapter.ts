/**
 * MockAdapter - Test implementation with configurable behavior
 *
 * This module has NO /base-standard/... imports and can be used
 * in unit tests without the Civ7 game engine.
 */

import {
  NO_RESOURCE as ADAPTER_NO_RESOURCE,
  CIV7_BROWSER_TABLES_V0,
  getNaturalWonderFootprintIndices,
  hasUnsupportedNaturalWonderPolicyTags,
  isResourceAdjacentToLandRuntimeOptional,
  NATURAL_WONDER_CATALOG,
  NO_RIVER_TYPE,
  PLACEABLE_RESOURCE_TYPE_IDS,
  RIVER_TYPE_MINOR,
  RIVER_TYPE_NAVIGABLE,
} from "@civ7/map-policy";
import { ENGINE_EFFECT_TAGS } from "./effects.js";
import { getCiv7RowLatitude } from "./map-metadata.js";
import type {
  DiscoveryPlacementIntent,
  DiscoveryPlacementOutcome,
  OfficialDiscoveryGenerationResult,
  EngineAdapter,
  FeatureData,
  LakeProjectionResult,
  LandmassIdName,
  MapInfo,
  MapInitParams,
  MapSizeId,
  NaturalWonderCatalogEntry,
  NaturalWonderPlacementOutcome,
  PlotTagName,
  ResourceCatalogEntry,
  ResourcePlacementIntent,
  ResourcePlacementOutcome,
  RiverProjectionResult,
  VoronoiBoundingBox,
  VoronoiCell,
  VoronoiDiagram,
  VoronoiPoint2D,
  VoronoiSite,
  VoronoiUtils,
} from "./types.js";

type MockRandomFn = (max: number, label: string) => number;
type ResourceValidPlacementRow = readonly [
  biomeType: number,
  terrainType: number,
  featureType: number,
];

type FeaturePolicy = Readonly<{
  noLake: boolean;
  minimumElevation?: number;
  placementClass?: string;
  naturalWonderTiles?: number;
  naturalWonderDirection?: number;
}>;

const FEATURE_VALID_TERRAIN_TYPE_INDICES =
  CIV7_BROWSER_TABLES_V0.featureValidTerrainTypeIndices as Record<
    string,
    readonly number[] | undefined
  >;

const FEATURE_VALID_BIOME_TYPE_INDICES =
  CIV7_BROWSER_TABLES_V0.featureValidBiomeTypeIndices as Record<
    string,
    readonly number[] | undefined
  >;

const FEATURE_POLICIES = CIV7_BROWSER_TABLES_V0.featurePolicies as Record<
  string,
  FeaturePolicy | undefined
>;

const FEATURE_TAGS_BY_FEATURE_TYPE = CIV7_BROWSER_TABLES_V0.featureTagsByFeatureType as Record<
  string,
  readonly string[] | undefined
>;

const RESOURCE_VALID_PLACEMENT_ROWS = CIV7_BROWSER_TABLES_V0.resourceValidPlacementRows as Record<
  string,
  readonly ResourceValidPlacementRow[] | undefined
>;

const RESOURCE_PLACEMENT_FLAGS = CIV7_BROWSER_TABLES_V0.resourcePlacementFlags as Record<
  string,
  { adjacentToLand: boolean; lakeEligible: boolean } | undefined
>;

const MOCK_NO_RIVER = NO_RIVER_TYPE;
const MOCK_RIVER_MINOR = RIVER_TYPE_MINOR;
const MOCK_RIVER_NAVIGABLE = RIVER_TYPE_NAVIGABLE;

const hashMockRngLabel = (label: string): number => {
  let hash = 5381;
  for (let i = 0; i < label.length; i++) {
    hash = ((hash << 5) + hash) ^ label.charCodeAt(i);
  }
  return hash | 0;
};

function createDeterministicMockRng(seed = 0): MockRandomFn {
  const baseSeed = seed | 0;
  const stateByLabel = new Map<string, number>();

  return (max, label) => {
    const bound = Math.max(1, max | 0);
    const key = label && label.length > 0 ? label : "rng";
    let state = stateByLabel.get(key);
    if (state == null) state = (baseSeed ^ hashMockRngLabel(key)) >>> 0;
    state = (state * 1664525 + 1013904223) >>> 0;
    stateByLabel.set(key, state);
    return state % bound;
  };
}

const DEFAULT_VORONOI_UTILS: VoronoiUtils = {
  createRandomSites(count: number, width: number, height: number): VoronoiSite[] {
    const sites: VoronoiSite[] = [];
    for (let id = 0; id < count; id++) {
      const seed1 = (id * 1664525 + 1013904223) >>> 0;
      const seed2 = (seed1 * 1664525 + 1013904223) >>> 0;
      const x = ((seed1 % 10000) / 10000) * width;
      const y = ((seed2 % 10000) / 10000) * height;
      sites.push({ x, y, voronoiId: id });
    }
    return sites;
  },

  computeVoronoi(
    sites: VoronoiSite[],
    _bbox: VoronoiBoundingBox,
    relaxationSteps = 0
  ): VoronoiDiagram {
    let currentSites = [...sites];

    for (let step = 0; step < relaxationSteps; step++) {
      currentSites = currentSites.map((site, i) => ({
        ...site,
        voronoiId: i,
      }));
    }

    const cells: VoronoiCell[] = currentSites.map((site) => ({
      site,
      halfedges: [],
    }));

    return { cells, edges: [], vertices: [] };
  },

  calculateCellArea(_cell: VoronoiCell): number {
    return 100;
  },

  normalize(v: VoronoiPoint2D): VoronoiPoint2D {
    const len = Math.sqrt(v.x * v.x + v.y * v.y);
    if (len < 1e-10) return { x: 0, y: 0 };
    return { x: v.x / len, y: v.y / len };
  },
};

/**
 * Configuration options for MockAdapter
 */
/**
 * Default biome globals for testing
 */
export const DEFAULT_BIOME_GLOBALS: Record<string, number> = {
  ...CIV7_BROWSER_TABLES_V0.biomeGlobals,
};

/**
 * Default feature type indices for testing
 */
export const DEFAULT_FEATURE_TYPES: Record<string, number> = {
  ...CIV7_BROWSER_TABLES_V0.featureTypes,
};

/**
 * Default terrain type indices for testing
 */
export const DEFAULT_TERRAIN_TYPE_INDICES: Record<string, number> = {
  ...CIV7_BROWSER_TABLES_V0.terrainTypeIndices,
};

/**
 * Default plot tag values for testing
 */
export const DEFAULT_PLOT_TAGS: Record<PlotTagName, number> = {
  NONE: 0,
  LANDMASS: 1,
  WATER: 2,
  EAST_LANDMASS: 3,
  WEST_LANDMASS: 4,
  EAST_WATER: 5,
  WEST_WATER: 6,
  ISLAND: 7,
};

/**
 * Default landmass region values for testing
 */
export const DEFAULT_LANDMASS_IDS: Record<LandmassIdName, number> = {
  NONE: 0,
  WEST: 2,
  EAST: 1,
  DEFAULT: 0,
  ANY: -1,
};

export interface MockPlotEffectType {
  id: number;
  name: string;
  tags: string[];
}

export const DEFAULT_PLOT_EFFECT_TYPES: MockPlotEffectType[] = [
  { id: 0, name: "PLOTEFFECT_SNOW_LIGHT_PERMANENT", tags: ["SNOW", "LIGHT", "PERMANENT"] },
  { id: 1, name: "PLOTEFFECT_SNOW_MEDIUM_PERMANENT", tags: ["SNOW", "MEDIUM", "PERMANENT"] },
  { id: 2, name: "PLOTEFFECT_SNOW_HEAVY_PERMANENT", tags: ["SNOW", "HEAVY", "PERMANENT"] },
  { id: 3, name: "PLOTEFFECT_SAND", tags: ["SAND"] },
  { id: 4, name: "PLOTEFFECT_BURNED", tags: ["BURNED"] },
];

const DEFAULT_NATURAL_WONDER_CATALOG: NaturalWonderCatalogEntry[] = NATURAL_WONDER_CATALOG;

const DEFAULT_NO_RESOURCE = ADAPTER_NO_RESOURCE;
const DEFAULT_RESOURCE_TYPE_CATALOG: number[] = [...PLACEABLE_RESOURCE_TYPE_IDS];
const STANDARD_OCEAN_WATER_COLUMNS = 4;

function sanitizeResourceTypeCatalog(input: number[] | undefined, noResource: number): number[] {
  const source = Array.isArray(input) ? input : DEFAULT_RESOURCE_TYPE_CATALOG;
  const unique = new Set<number>();
  for (const value of source) {
    if (!Number.isFinite(value)) continue;
    const normalized = value | 0;
    if (normalized < 0) continue;
    if (normalized === noResource) continue;
    unique.add(normalized);
  }
  return Array.from(unique).sort((a, b) => a - b);
}

const ODD_Q_NEIGHBORS_EVEN: readonly (readonly [number, number])[] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, -1],
  [1, -1],
];

const ODD_Q_NEIGHBORS_ODD: readonly (readonly [number, number])[] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, 1],
  [1, 1],
];

function wrapMockX(x: number, width: number): number {
  return ((x % width) + width) % width;
}

function isWithinStandardCoastExpansionBand(x: number, width: number): boolean {
  const halfOceanColumns = STANDARD_OCEAN_WATER_COLUMNS / 2;
  return (
    x > halfOceanColumns &&
    (x < (width - STANDARD_OCEAN_WATER_COLUMNS) / 2 ||
      x > (width + STANDARD_OCEAN_WATER_COLUMNS) / 2) &&
    x < width - halfOceanColumns
  );
}

export interface MockAdapterConfig {
  width?: number;
  height?: number;
  /** Map size selection id (Civ7: GameplayMap.getMapSize()) */
  mapSizeId?: MapSizeId;
  /** Map info row (Civ7: GameInfo.Maps.lookup(mapSizeId)) */
  mapInfo?: MapInfo | null;
  /**
   * Alive major player count (Civ7: Players.getAliveMajorIds().length). The
   * live engine seats the game's actual alive players, which can be fewer
   * than PlayersLandmass1+PlayersLandmass2 (HUGE advertises 6/6 slots while
   * a 10-player game has 10 alive — Milestone A5 evidence). Defaults to the
   * map-info sum.
   */
  aliveMajorCount?: number;
  /** Default terrain type for all tiles */
  defaultTerrainType?: number;
  /** Default elevation for all tiles */
  defaultElevation?: number;
  /** Default rainfall for all tiles */
  defaultRainfall?: number;
  /** Default temperature for all tiles */
  defaultTemperature?: number;
  /** Default biome type for all tiles */
  defaultBiomeType?: number;
  /** Custom RNG function (default: deterministic label RNG) */
  rng?: MockRandomFn;
  /** Custom biome globals (default: DEFAULT_BIOME_GLOBALS) */
  biomeGlobals?: Record<string, number>;
  /** Custom feature type indices (default: DEFAULT_FEATURE_TYPES) */
  featureTypes?: Record<string, number>;
  /** Custom terrain type indices (default: DEFAULT_TERRAIN_TYPE_INDICES) */
  terrainTypeIndices?: Record<string, number>;
  /** Custom plot tag values (default: DEFAULT_PLOT_TAGS) */
  plotTags?: Partial<Record<PlotTagName, number>>;
  /** Custom landmass region values (default: DEFAULT_LANDMASS_IDS) */
  landmassIds?: Partial<Record<LandmassIdName, number>>;
  /** Optional feature validation hook for tests (return false to reject placement). */
  canHaveFeature?: (x: number, y: number, featureType: number) => boolean;
  /** Optional resource validation hook for tests (return false to reject placement). */
  canHaveResource?: (x: number, y: number, resourceType: number) => boolean;
  /** Sentinel used to represent "no resource". */
  noResourceSentinel?: number;
  /** Adapter-provided resource candidate catalog returned by getPlaceableResourceTypes. */
  resourceTypeCatalog?: number[];
  /** Natural wonder feature catalog used by deterministic planners. */
  naturalWonderCatalog?: NaturalWonderCatalogEntry[];
  /** Plot effect types and tag sets for getPlotEffectTypesContainingTags. */
  plotEffectTypes?: MockPlotEffectType[];
  /**
   * Simulated successful placements returned by generateOfficialDiscoveries().
   * Defaults to 0.
   */
  officialDiscoveriesPlacedCount?: number;
  /**
   * Simulated successful placements returned by generateOfficialResources().
   * Defaults to 0.
   */
  officialResourcesPlacedCount?: number;
}

/**
 * Mock adapter for testing map generation logic without Civ7 engine
 */
export class MockAdapter implements EngineAdapter {
  readonly width: number;
  readonly height: number;

  private mapSizeId: MapSizeId;
  private mapInfo: MapInfo | null;
  private aliveMajorCount: number | null;

  private terrainTypes: Uint8Array;
  private elevations: Int16Array;
  private rainfall: Uint8Array;
  private temperature: Uint8Array;
  private features: Int16Array;
  private resources: Int16Array;
  private biomes: Uint8Array;
  private waterMask: Uint8Array;
  private lakeMask: Uint8Array;
  private validationMaterializedCoastMask: Uint8Array;
  private mountainMask: Uint8Array;
  private landmassRegionIds: Uint8Array;
  private riverMask: Uint8Array;
  private riverTypes: Int8Array;
  private rngFn: (max: number, label: string) => number;
  private biomeGlobals: Record<string, number>;
  private featureTypes: Record<string, number>;
  private terrainTypeIndices: Record<string, number>;
  private plotTags: Record<PlotTagName, number>;
  private landmassIds: Record<LandmassIdName, number>;
  private canHaveFeatureFn?: (x: number, y: number, featureType: number) => boolean;
  private canHaveResourceFn?: (x: number, y: number, resourceType: number) => boolean;
  private noResourceSentinel: number;
  private resourceTypeCatalog: number[];
  private naturalWonderCatalog: NaturalWonderCatalogEntry[];
  private plotEffectTypes: Array<{ id: number; name: string; tags: Set<string> }>;
  private plotEffectsByIndex: Map<number, Set<number>>;
  private readonly effectEvidence = new Set<string>();
  private officialDiscoveriesPlacedCount: number;
  private officialResourcesPlacedCount: number;
  private coastTerrainId: number;
  private oceanTerrainId: number;
  private mountainTerrainId: number;

  /** Track calls for testing */
  readonly calls: {
    setMapInitData: Array<MapInitParams>;
    designateBiomes: Array<{ width: number; height: number }>;
    addFeatures: Array<{ width: number; height: number }>;
    stampNaturalWonder: Array<{
      x: number;
      y: number;
      featureType: number;
      direction: number;
      elevation: number;
    }>;
    stampDiscovery: Array<{
      x: number;
      y: number;
      discoveryVisualType: number;
      discoveryActivationType: number;
    }>;
    generateOfficialDiscoveries: Array<{
      width: number;
      height: number;
      startPositions: number[];
      polarMargin: number;
    }>;
    generateOfficialResources: Array<{
      width: number;
      height: number;
      minMarineResourceTypesOverride?: number;
    }>;
    generateSnow: Array<{ width: number; height: number }>;
    setResourceType: Array<{ x: number; y: number; resourceType: number }>;
    generateLakes: Array<{ width: number; height: number; tilesPerLake: number }>;
    stampLakes: Array<{ width: number; height: number; lakeMask: Uint8Array }>;
    expandCoasts: Array<{ width: number; height: number }>;
    assignStartPositions: Array<{
      playersLandmass1: number;
      playersLandmass2: number;
      startSectorRows: number;
      startSectorCols: number;
    }>;
    setStartPosition: Array<{ plotIndex: number; playerId: number }>;
    assignAdvancedStartRegions: number;
    addFloodplains: Array<{ minLength: number; maxLength: number }>;
    recalculateFertility: number;
    addPlotEffect: Array<{ x: number; y: number; plotEffectType: number }>;
  };
  resourcesPlaced = 0;

  constructor(config: MockAdapterConfig = {}) {
    this.width = config.width ?? 128;
    this.height = config.height ?? 80;
    this.mapSizeId = config.mapSizeId ?? 0;
    this.mapInfo = config.mapInfo ?? null;
    this.aliveMajorCount = Number.isFinite(config.aliveMajorCount)
      ? Math.max(0, (config.aliveMajorCount as number) | 0)
      : null;
    this.noResourceSentinel = Number.isFinite(config.noResourceSentinel)
      ? (config.noResourceSentinel as number) | 0
      : DEFAULT_NO_RESOURCE;
    this.resourceTypeCatalog = sanitizeResourceTypeCatalog(
      config.resourceTypeCatalog,
      this.noResourceSentinel
    );
    const size = this.width * this.height;

    this.terrainTypes = new Uint8Array(size).fill(config.defaultTerrainType ?? 0);
    this.elevations = new Int16Array(size).fill(config.defaultElevation ?? 100);
    this.rainfall = new Uint8Array(size).fill(config.defaultRainfall ?? 50);
    this.temperature = new Uint8Array(size).fill(config.defaultTemperature ?? 15);
    this.features = new Int16Array(size).fill(-1);
    this.resources = new Int16Array(size).fill(this.noResourceSentinel);
    this.biomes = new Uint8Array(size).fill(config.defaultBiomeType ?? 0);
    this.waterMask = new Uint8Array(size);
    this.lakeMask = new Uint8Array(size);
    this.validationMaterializedCoastMask = new Uint8Array(size);
    this.mountainMask = new Uint8Array(size);
    this.riverMask = new Uint8Array(size);
    this.riverTypes = new Int8Array(size).fill(MOCK_NO_RIVER);
    this.landmassRegionIds = new Uint8Array(size);
    this.rngFn = config.rng ?? createDeterministicMockRng();
    this.biomeGlobals = config.biomeGlobals ?? { ...DEFAULT_BIOME_GLOBALS };
    this.featureTypes = config.featureTypes ?? { ...DEFAULT_FEATURE_TYPES };
    this.terrainTypeIndices = config.terrainTypeIndices ?? { ...DEFAULT_TERRAIN_TYPE_INDICES };
    this.plotTags = { ...DEFAULT_PLOT_TAGS, ...(config.plotTags ?? {}) };
    this.landmassIds = { ...DEFAULT_LANDMASS_IDS, ...(config.landmassIds ?? {}) };
    this.canHaveFeatureFn = config.canHaveFeature;
    this.canHaveResourceFn = config.canHaveResource;
    this.naturalWonderCatalog = (config.naturalWonderCatalog ?? DEFAULT_NATURAL_WONDER_CATALOG).map(
      (entry) => ({
        featureType: entry.featureType,
        direction: entry.direction,
      })
    );
    this.plotEffectTypes = (config.plotEffectTypes ?? DEFAULT_PLOT_EFFECT_TYPES).map((entry) => ({
      id: entry.id,
      name: entry.name,
      tags: new Set(entry.tags.map((tag) => tag.toUpperCase())),
    }));
    this.plotEffectsByIndex = new Map();
    this.officialDiscoveriesPlacedCount = Number.isFinite(config.officialDiscoveriesPlacedCount)
      ? Math.max(0, Math.trunc(config.officialDiscoveriesPlacedCount as number))
      : 0;
    this.officialResourcesPlacedCount = Number.isFinite(config.officialResourcesPlacedCount)
      ? Math.max(0, Math.trunc(config.officialResourcesPlacedCount as number))
      : 0;

    this.coastTerrainId = this.getTerrainTypeIndex("TERRAIN_COAST");
    this.oceanTerrainId = this.getTerrainTypeIndex("TERRAIN_OCEAN");
    this.mountainTerrainId = this.getTerrainTypeIndex("TERRAIN_MOUNTAIN");
    this.calls = {
      setMapInitData: [],
      designateBiomes: [],
      addFeatures: [],
      stampNaturalWonder: [],
      stampDiscovery: [],
      generateOfficialDiscoveries: [],
      generateOfficialResources: [],
      generateSnow: [],
      setResourceType: [],
      generateLakes: [],
      stampLakes: [],
      expandCoasts: [],
      assignStartPositions: [],
      setStartPosition: [],
      assignAdvancedStartRegions: 0,
      addFloodplains: [],
      recalculateFertility: 0,
      addPlotEffect: [],
    };
  }

  private recordEffect(effectId: string): void {
    this.effectEvidence.add(effectId);
  }

  private recordPlacementEffect(): void {
    this.recordEffect(ENGINE_EFFECT_TAGS.placementApplied);
  }

  verifyEffect(effectId: string): boolean {
    if (effectId === "effect:engine.landmassApplied") {
      // Best-effort: landmass should create at least some land and some water.
      let hasLand = false;
      let hasWater = false;
      const size = this.width * this.height;
      for (let i = 0; i < size; i++) {
        const isWater =
          this.waterMask[i] === 1 ||
          this.terrainTypes[i] === this.coastTerrainId ||
          this.terrainTypes[i] === this.oceanTerrainId;
        if (isWater) hasWater = true;
        else hasLand = true;
        if (hasLand && hasWater) return true;
      }
      return false;
    }

    if (effectId === "effect:engine.coastlinesApplied") {
      const size = this.width * this.height;
      for (let i = 0; i < size; i++) {
        if (this.terrainTypes[i] === this.coastTerrainId) return true;
      }
      return false;
    }

    if (effectId === "effect:engine.riversModeled") {
      const size = this.width * this.height;
      for (let i = 0; i < size; i++) {
        if (this.riverMask[i] === 1) return true;
      }
      return false;
    }

    return this.effectEvidence.has(effectId);
  }

  private idx(x: number, y: number): number {
    return y * this.width + x;
  }

  // === MAP INIT / MAP INFO ===

  getMapSizeId(): MapSizeId {
    return this.mapSizeId;
  }

  lookupMapInfo(_mapSizeId: MapSizeId): MapInfo | null {
    return this.mapInfo;
  }

  setMapInitData(params: MapInitParams): void {
    this.calls.setMapInitData.push({ ...params });
  }

  // === TERRAIN READS ===

  isWater(x: number, y: number): boolean {
    const i = this.idx(x, y);
    if (this.waterMask[i] === 1) return true;
    const terrain = this.terrainTypes[i];
    return terrain === this.coastTerrainId || terrain === this.oceanTerrainId;
  }

  isLake(x: number, y: number): boolean {
    return this.lakeMask[this.idx(x, y)] === 1;
  }

  getAreaId(x: number, y: number): number {
    // Stable coarse ids are enough for tests that need to prove area readback exists.
    return this.isWater(x, y) ? 1 : 0;
  }

  isMountain(x: number, y: number): boolean {
    const i = this.idx(x, y);
    if (this.mountainMask[i] === 1) return true;
    return this.terrainTypes[i] === this.mountainTerrainId;
  }

  isAdjacentToRivers(x: number, y: number, radius = 1): boolean {
    const r = Math.max(0, radius | 0);
    for (let dy = -r; dy <= r; dy++) {
      const ny = y + dy;
      if (ny < 0 || ny >= this.height) continue;
      for (let dx = -r; dx <= r; dx++) {
        const nx = x + dx;
        if (nx < 0 || nx >= this.width) continue;
        if (this.riverMask[this.idx(nx, ny)] === 1) return true;
      }
    }
    return false;
  }

  getRiverType(x: number, y: number): number {
    return this.riverTypes[this.idx(x, y)] ?? MOCK_NO_RIVER;
  }

  isRiver(x: number, y: number): boolean {
    return this.getRiverType(x, y) !== MOCK_NO_RIVER;
  }

  isNavigableRiver(x: number, y: number): boolean {
    return this.getRiverType(x, y) === MOCK_RIVER_NAVIGABLE;
  }

  getElevation(x: number, y: number): number {
    return this.elevations[this.idx(x, y)];
  }

  getTerrainType(x: number, y: number): number {
    return this.terrainTypes[this.idx(x, y)];
  }

  getTerrainTypeIndex(name: string): number {
    return this.terrainTypeIndices[name] ?? -1;
  }

  getRainfall(x: number, y: number): number {
    return this.rainfall[this.idx(x, y)];
  }

  getTemperature(x: number, y: number): number {
    return this.temperature[this.idx(x, y)];
  }

  getLatitude(x: number, y: number): number {
    return getCiv7RowLatitude(this.mapInfo, this.height, y);
  }

  // === TERRAIN WRITES ===

  setTerrainType(x: number, y: number, terrainType: number): void {
    const index = this.idx(x, y);
    this.terrainTypes[index] = terrainType;
    this.waterMask[index] =
      terrainType === this.coastTerrainId || terrainType === this.oceanTerrainId ? 1 : 0;
    this.mountainMask[index] = terrainType === this.mountainTerrainId ? 1 : 0;
    this.validationMaterializedCoastMask[index] = 0;
    if (terrainType !== this.coastTerrainId) {
      this.lakeMask[index] = 0;
    }
  }

  setRainfall(x: number, y: number, value: number): void {
    this.rainfall[this.idx(x, y)] = Math.max(0, Math.min(200, value));
  }

  setLandmassRegionId(x: number, y: number, regionId: number): void {
    this.landmassRegionIds[this.idx(x, y)] = regionId;
  }

  setLandmassId(x: number, y: number, regionId: number): void {
    this.setLandmassRegionId(x, y, regionId);
  }

  addPlotTag(_x: number, _y: number, _plotTag: number): void {
    // No-op in mock - plot tags are engine-specific
  }

  setPlotTag(_x: number, _y: number, _plotTag: number): void {
    // No-op in mock - plot tags are engine-specific
  }

  getPlotTagId(name: PlotTagName): number {
    return this.plotTags[name] ?? -1;
  }

  getLandmassId(name: LandmassIdName): number {
    return this.landmassIds[name] ?? -1;
  }

  // === FEATURE READS/WRITES ===

  getFeatureType(x: number, y: number): number {
    return this.features[this.idx(x, y)];
  }

  setFeatureType(x: number, y: number, featureData: FeatureData): void {
    this.features[this.idx(x, y)] = featureData.Feature;
    this.recordEffect(ENGINE_EFFECT_TAGS.featuresApplied);
  }

  canHaveFeature(_x: number, _y: number, _featureType: number): boolean {
    if (this.canHaveFeatureFn) {
      return this.canHaveFeatureFn(_x, _y, _featureType);
    }
    return this.canHaveFeatureByStaticPolicy(_x, _y, _featureType);
  }

  canHaveFeatureParam(x: number, y: number, featureData: FeatureData): boolean {
    return this.canHaveFeature(x, y, featureData.Feature);
  }

  private canHaveFeatureByStaticPolicy(x: number, y: number, featureType: number): boolean {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false;
    const normalizedFeatureType = featureType | 0;
    if (normalizedFeatureType < 0) return false;
    if ((this.getFeatureType(x, y) | 0) !== this.NO_FEATURE) return false;

    const featureKey = String(normalizedFeatureType);
    const validTerrainTypes = FEATURE_VALID_TERRAIN_TYPE_INDICES[featureKey];
    if (validTerrainTypes?.length && !validTerrainTypes.includes(this.getTerrainType(x, y) | 0)) {
      return false;
    }

    const validBiomeTypes = FEATURE_VALID_BIOME_TYPE_INDICES[featureKey];
    if (validBiomeTypes?.length && !validBiomeTypes.includes(this.getBiomeType(x, y) | 0)) {
      return false;
    }

    const policy = FEATURE_POLICIES[featureKey];
    if (
      policy?.naturalWonderTiles !== undefined &&
      hasUnsupportedNaturalWonderPolicyTags(FEATURE_TAGS_BY_FEATURE_TYPE[featureKey])
    ) {
      return false;
    }
    if (
      policy?.minimumElevation !== undefined &&
      this.getElevation(x, y) < policy.minimumElevation
    ) {
      return false;
    }

    return true;
  }

  get NO_RESOURCE(): number {
    return this.noResourceSentinel;
  }

  getResourceType(x: number, y: number): number {
    return this.resources[this.idx(x, y)];
  }

  setResourceType(x: number, y: number, resourceType: number): void {
    const i = this.idx(x, y);
    const prev = this.resources[i] ?? this.NO_RESOURCE;
    this.resources[i] = resourceType;
    this.calls.setResourceType.push({ x, y, resourceType });
    const hadResource = prev !== this.NO_RESOURCE;
    const hasResource = resourceType !== this.NO_RESOURCE;
    if (!hadResource && hasResource) this.resourcesPlaced += 1;
    if (hadResource && !hasResource) this.resourcesPlaced = Math.max(0, this.resourcesPlaced - 1);
    this.recordPlacementEffect();
  }

  canHaveResource(x: number, y: number, resourceType: number): boolean {
    if ((resourceType | 0) === (this.NO_RESOURCE | 0)) return false;
    if (this.canHaveResourceFn) {
      return this.canHaveResourceFn(x, y, resourceType);
    }
    return this.canHaveResourceByStaticPolicy(x, y, resourceType);
  }

  private canHaveResourceByStaticPolicy(x: number, y: number, resourceType: number): boolean {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false;
    const normalizedResourceType = resourceType | 0;
    const validRows = RESOURCE_VALID_PLACEMENT_ROWS[String(normalizedResourceType)];
    if (!validRows?.length) return false;

    const biomeType = this.getBiomeType(x, y) | 0;
    const terrainType = this.getTerrainType(x, y) | 0;
    const featureType = this.getFeatureType(x, y) | 0;
    let validSurface = false;
    for (const row of validRows) {
      if (row[0] !== biomeType || row[1] !== terrainType) continue;
      if (row[2] !== featureType) continue;
      validSurface = true;
      break;
    }
    if (!validSurface) return false;

    const flags = RESOURCE_PLACEMENT_FLAGS[String(normalizedResourceType)];
    if (
      flags?.adjacentToLand &&
      !isResourceAdjacentToLandRuntimeOptional(normalizedResourceType) &&
      !this.hasAdjacentLand(x, y)
    ) {
      return false;
    }

    return true;
  }

  private hasAdjacentLand(x: number, y: number): boolean {
    const offsets = (x & 1) === 1 ? ODD_Q_NEIGHBORS_ODD : ODD_Q_NEIGHBORS_EVEN;
    for (const [dx, dy] of offsets) {
      const ny = y + dy;
      if (ny < 0 || ny >= this.height) continue;
      const nx = this.width > 0 ? wrapMockX(x + dx, this.width) : x + dx;
      if (!this.isWater(nx, ny)) return true;
    }
    return false;
  }

  getPlaceableResourceTypes(): number[] {
    return [...this.resourceTypeCatalog];
  }

  getResourceCatalog(): ResourceCatalogEntry[] {
    // Mock runtime catalog: served from the static policy tables so telemetry
    // enrichment behaves the same offline as against GameInfo.Resources.
    return Object.entries(CIV7_BROWSER_TABLES_V0.resourceTypes as Record<string, number>)
      .map(([resourceType, index]) => ({
        index: index | 0,
        resourceType,
        resourceClassType: null,
        name: null,
      }))
      .sort((a, b) => a.index - b.index);
  }

  placeResourceIntent(
    width: number,
    height: number,
    intent: ResourcePlacementIntent
  ): ResourcePlacementOutcome {
    // Mirror the production adapter contract so recipe tests exercise typed
    // reconciliation outcomes instead of a mock-only placement shortcut.
    const resolvedWidth = Math.max(0, Math.trunc(width));
    const resolvedHeight = Math.max(0, Math.trunc(height));
    const plotIndex = Number.isFinite(intent.plotIndex) ? Math.trunc(intent.plotIndex) : -1;
    const resourceType = Number.isFinite(intent.resourceType)
      ? Math.trunc(intent.resourceType)
      : this.NO_RESOURCE;
    const y = resolvedWidth > 0 ? Math.trunc(plotIndex / resolvedWidth) : -1;
    const x = resolvedWidth > 0 ? plotIndex - y * resolvedWidth : -1;

    if (plotIndex < 0 || x < 0 || y < 0 || x >= resolvedWidth || y >= resolvedHeight) {
      return { status: "rejected", plotIndex, x, y, resourceType, reason: "out-of-bounds" };
    }
    if (resourceType < 0 || resourceType === (this.NO_RESOURCE | 0)) {
      return { status: "rejected", plotIndex, x, y, resourceType, reason: "invalid-resource-type" };
    }
    if (!this.canHaveResource(x, y, resourceType)) {
      return {
        status: "rejected",
        plotIndex,
        x,
        y,
        resourceType,
        reason: "cannot-have-resource",
        observedResourceType: this.getResourceType(x, y),
      };
    }

    this.setResourceType(x, y, resourceType);
    const observedResourceType = this.getResourceType(x, y);
    if ((observedResourceType | 0) !== (resourceType | 0)) {
      return {
        status: "mismatch",
        plotIndex,
        x,
        y,
        resourceType,
        reason: "wrong-resource-type",
        observedResourceType,
      };
    }
    return { status: "placed", plotIndex, x, y, resourceType, observedResourceType };
  }

  // === PLOT EFFECTS ===

  getPlotEffectTypesContainingTags(tags: string[]): number[] {
    const required = new Set(tags.map((tag) => tag.toUpperCase()));
    return this.plotEffectTypes
      .filter((entry) => {
        for (const tag of required) {
          if (!entry.tags.has(tag)) return false;
        }
        return true;
      })
      .map((entry) => entry.id);
  }

  getPlotEffectTypeIndex(name: string): number {
    const target = name.toUpperCase().startsWith("PLOTEFFECT_")
      ? name.toUpperCase()
      : `PLOTEFFECT_${name.toUpperCase()}`;
    const match = this.plotEffectTypes.find((entry) => entry.name === target);
    return match ? match.id : -1;
  }

  addPlotEffect(x: number, y: number, plotEffectType: number): void {
    const index = this.idx(x, y);
    const existing = this.plotEffectsByIndex.get(index);
    if (existing) {
      existing.add(plotEffectType);
    } else {
      this.plotEffectsByIndex.set(index, new Set([plotEffectType]));
    }
    this.calls.addPlotEffect.push({ x, y, plotEffectType });
  }

  hasPlotEffect(x: number, y: number, plotEffectType: number): boolean {
    const existing = this.plotEffectsByIndex.get(this.idx(x, y));
    return existing ? existing.has(plotEffectType) : false;
  }

  // === RANDOM NUMBER GENERATION ===

  getRandomNumber(max: number, label: string): number {
    return this.rngFn(max, label);
  }

  // === UTILITIES ===

  getVoronoiUtils(): VoronoiUtils {
    return DEFAULT_VORONOI_UTILS;
  }

  validateAndFixTerrain(): void {
    this.materializeValidationCoasts(this.width, this.height);
    this.storeWaterData();
  }

  recalculateAreas(): void {
    // No-op in mock
  }

  createFractal(
    _fractalId: number,
    _width: number,
    _height: number,
    _grain: number,
    _flags: number
  ): void {
    // No-op in mock
  }

  getFractalHeight(_fractalId: number, _x: number, _y: number): number {
    return 0; // Mock: flat fractal
  }

  stampContinents(): void {
    // No-op in mock
  }

  buildElevation(): void {
    // No-op in mock
  }

  modelRivers(_minLength: number, _maxLength: number, _navigableTerrain: number): void {
    this.riverMask.fill(0);
    this.riverTypes.fill(MOCK_NO_RIVER);

    // Native-writer mock: mirror Civ's bulk writer onto already stamped
    // navigable-river terrain so map-stage tests prove the projection contract
    // without inventing a second fake river network.
    for (let i = 0; i < this.width * this.height; i++) {
      if ((this.terrainTypes[i] ?? 0) !== (_navigableTerrain & 0xff)) continue;
      this.riverMask[i] = 1;
      this.riverTypes[i] = MOCK_RIVER_NAVIGABLE;
    }
  }

  defineNamedRivers(): void {
    // No-op in mock
  }

  storeWaterData(): void {
    const size = this.width * this.height;
    for (let i = 0; i < size; i++) {
      const terrain = this.terrainTypes[i] ?? 0;
      this.waterMask[i] =
        terrain === this.coastTerrainId || terrain === this.oceanTerrainId ? 1 : 0;
      if (terrain !== this.coastTerrainId) {
        this.lakeMask[i] = 0;
      }
    }
  }

  readRiverProjection(
    width: number,
    height: number,
    plannedNavigableRiverMask: Uint8Array
  ): RiverProjectionResult {
    const expectedSize = Math.max(0, (width | 0) * (height | 0));
    if (plannedNavigableRiverMask.length !== expectedSize) {
      throw new Error(
        `[MockAdapter] Invalid river mask length for readRiverProjection (expected ${expectedSize}, got ${plannedNavigableRiverMask.length}).`
      );
    }

    const navigableRiverTerrain = this.getTerrainTypeIndex("TERRAIN_NAVIGABLE_RIVER");
    const stampedNavigableRiverMask = new Uint8Array(expectedSize);
    const rejectedNavigableRiverMask = new Uint8Array(expectedSize);
    const engineTerrain = new Int32Array(expectedSize);
    const engineRiverType = new Int32Array(expectedSize);
    const engineIsRiverMask = new Uint8Array(expectedSize);
    const engineNavigableRiverMask = new Uint8Array(expectedSize);
    const engineMinorRiverMask = new Uint8Array(expectedSize);
    const terrainNavigableRiverMask = new Uint8Array(expectedSize);
    const navigableRiverMismatchMask = new Uint8Array(expectedSize);
    let plannedNavigableRiverTileCount = 0;
    let stampedNavigableRiverTileCount = 0;
    let rejectedNavigableRiverTileCount = 0;
    let extraNavigableRiverTileCount = 0;
    let navigableRiverMismatchTileCount = 0;
    let engineRiverTileCount = 0;
    let engineNavigableRiverTileCount = 0;
    let engineMinorRiverTileCount = 0;
    let terrainNavigableRiverTileCount = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const planned = plannedNavigableRiverMask[idx] === 1;
        const terrain = this.getTerrainType(x, y) | 0;
        const riverType = this.getRiverType(x, y) | 0;
        const isRiver = this.isRiver(x, y);
        const isNavigable = this.isNavigableRiver(x, y);
        const hasNavigableTerrain = terrain === navigableRiverTerrain;
        const isMinor = riverType === MOCK_RIVER_MINOR;

        engineTerrain[idx] = terrain;
        engineRiverType[idx] = riverType;
        engineIsRiverMask[idx] = isRiver ? 1 : 0;
        engineNavigableRiverMask[idx] = isNavigable ? 1 : 0;
        engineMinorRiverMask[idx] = isMinor ? 1 : 0;
        terrainNavigableRiverMask[idx] = hasNavigableTerrain ? 1 : 0;

        if (planned) plannedNavigableRiverTileCount += 1;
        if (isRiver) engineRiverTileCount += 1;
        if (isNavigable) engineNavigableRiverTileCount += 1;
        if (isMinor) engineMinorRiverTileCount += 1;
        if (hasNavigableTerrain) terrainNavigableRiverTileCount += 1;

        if (planned && hasNavigableTerrain) {
          stampedNavigableRiverMask[idx] = 1;
          stampedNavigableRiverTileCount += 1;
        } else if (planned) {
          rejectedNavigableRiverMask[idx] = 1;
          rejectedNavigableRiverTileCount += 1;
        } else if (hasNavigableTerrain) {
          extraNavigableRiverTileCount += 1;
        }

        if ((planned ? 1 : 0) !== (hasNavigableTerrain ? 1 : 0)) {
          navigableRiverMismatchMask[idx] = 1;
          navigableRiverMismatchTileCount += 1;
        }
      }
    }

    return {
      width,
      height,
      plannedNavigableRiverMask,
      stampedNavigableRiverMask,
      rejectedNavigableRiverMask,
      engineTerrain,
      engineRiverType,
      engineIsRiverMask,
      engineNavigableRiverMask,
      engineMinorRiverMask,
      terrainNavigableRiverMask,
      navigableRiverMismatchMask,
      plannedNavigableRiverTileCount,
      stampedNavigableRiverTileCount,
      rejectedNavigableRiverTileCount,
      extraNavigableRiverTileCount,
      navigableRiverMismatchTileCount,
      engineRiverTileCount,
      engineNavigableRiverTileCount,
      engineMinorRiverTileCount,
      terrainNavigableRiverTileCount,
      minorRiverStampingSupported: true,
      minorRiverUnsupportedReason:
        "MockAdapter mirrors Civ river-type metadata readback semantics; exact Hydrology minor-river parity remains diagnostic and must compare planned minor intent to engineMinorRiverMask.",
    };
  }

  generateLakes(width: number, height: number, tilesPerLake: number): void {
    this.calls.generateLakes.push({ width, height, tilesPerLake });
    // Mock: no-op
  }

  /**
   * Test-double counterpart to the engine adapter lake projection boundary.
   * It stamps requested lake terrain and reports readback masks so map-stage
   * tests exercise the same plan/project/diagnose shape as runtime.
   */
  stampLakes(width: number, height: number, lakeMask: Uint8Array): LakeProjectionResult {
    this.calls.stampLakes.push({ width, height, lakeMask });
    const expectedSize = Math.max(0, (width | 0) * (height | 0));
    if (lakeMask.length !== expectedSize) {
      throw new Error(
        `[MockAdapter] Invalid lake mask length for stampLakes (expected ${expectedSize}, got ${lakeMask.length}).`
      );
    }

    let plannedLakeTileCount = 0;
    this.lakeMask.fill(0);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (lakeMask[idx] !== 1) continue;
        plannedLakeTileCount += 1;
        this.terrainTypes[idx] = this.coastTerrainId & 0xff;
        this.lakeMask[idx] = 1;
      }
    }

    this.recalculateAreas();
    this.storeWaterData();

    const stampedLakeMask = new Uint8Array(expectedSize);
    const rejectedLakeMask = new Uint8Array(expectedSize);
    const engineTerrain = new Int32Array(expectedSize);
    const engineWaterMask = new Uint8Array(expectedSize);
    const engineLakeMask = new Uint8Array(expectedSize);
    const engineAreaId = new Int32Array(expectedSize);
    const engineElevation = new Int16Array(expectedSize);
    const terrainMismatchMask = new Uint8Array(expectedSize);
    const nonWaterMask = new Uint8Array(expectedSize);
    const nonLakeMask = new Uint8Array(expectedSize);
    let stampedLakeTileCount = 0;
    let rejectedLakeTileCount = 0;
    let terrainMismatchTileCount = 0;
    let nonWaterTileCount = 0;
    let nonLakeTileCount = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const terrain = this.getTerrainType(x, y) | 0;
        const isWater = this.isWater(x, y);
        const isLake = this.isLake(x, y);
        engineTerrain[idx] = terrain;
        engineWaterMask[idx] = isWater ? 1 : 0;
        engineLakeMask[idx] = isLake ? 1 : 0;
        engineAreaId[idx] = this.getAreaId(x, y) | 0;
        engineElevation[idx] = Math.max(-32768, Math.min(32767, this.getElevation(x, y) | 0));
        if (lakeMask[idx] !== 1) continue;
        if (terrain !== this.coastTerrainId) {
          terrainMismatchMask[idx] = 1;
          terrainMismatchTileCount += 1;
        }
        if (!isWater) {
          nonWaterMask[idx] = 1;
          nonWaterTileCount += 1;
        }
        if (!isLake) {
          nonLakeMask[idx] = 1;
          nonLakeTileCount += 1;
        }
        if (isWater) {
          stampedLakeMask[idx] = 1;
          stampedLakeTileCount += 1;
        } else {
          rejectedLakeMask[idx] = 1;
          rejectedLakeTileCount += 1;
        }
      }
    }

    return {
      width,
      height,
      plannedLakeMask: lakeMask,
      stampedLakeMask,
      rejectedLakeMask,
      engineTerrain,
      engineWaterMask,
      engineLakeMask,
      engineAreaId,
      engineElevation,
      terrainMismatchMask,
      nonWaterMask,
      nonLakeMask,
      plannedLakeTileCount,
      stampedLakeTileCount,
      rejectedLakeTileCount,
      terrainMismatchTileCount,
      nonWaterTileCount,
      nonLakeTileCount,
    };
  }

  expandCoasts(width: number, height: number): void {
    this.calls.expandCoasts.push({ width, height });

    const resolvedWidth = Math.max(0, Math.min(this.width, width | 0));
    const resolvedHeight = Math.max(0, Math.min(this.height, height | 0));
    if (resolvedWidth <= 0 || resolvedHeight <= 0) return;

    const coastTerrain = this.coastTerrainId;
    for (let y = 0; y < resolvedHeight; y++) {
      for (let x = 0; x < resolvedWidth; x++) {
        if (!isWithinStandardCoastExpansionBand(x, resolvedWidth)) continue;
        const idx = this.idx(x, y);
        if ((this.terrainTypes[idx] | 0) !== this.oceanTerrainId) continue;
        const adjacentCoastRegionId = this.adjacentCoastRegionId(
          x,
          y,
          resolvedWidth,
          resolvedHeight
        );
        if (adjacentCoastRegionId === null) continue;
        if (this.rngFn(4, "Shallow Water Scatter") !== 0) continue;
        this.terrainTypes[idx] = coastTerrain & 0xff;
        this.landmassRegionIds[idx] = adjacentCoastRegionId & 0xff;
      }
    }
  }

  private materializeValidationCoasts(width: number, height: number): void {
    const nextTerrain = new Uint8Array(this.terrainTypes);
    const nextLandmassRegionIds = new Uint8Array(this.landmassRegionIds);
    const nextValidationMaterializedCoastMask = new Uint8Array(
      this.validationMaterializedCoastMask
    );
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = this.idx(x, y);
        if ((this.terrainTypes[idx] | 0) !== this.oceanTerrainId) continue;
        if (!this.hasAdjacentLandTerrain(x, y, width, height)) continue;
        const adjacentCoastRegionId = this.adjacentCoastRegionId(x, y, width, height, {
          includeValidationMaterializedCoast: false,
        });
        if (adjacentCoastRegionId === null) continue;
        nextTerrain[idx] = this.coastTerrainId & 0xff;
        nextLandmassRegionIds[idx] = adjacentCoastRegionId & 0xff;
        nextValidationMaterializedCoastMask[idx] = 1;
      }
    }
    this.terrainTypes = nextTerrain;
    this.landmassRegionIds = nextLandmassRegionIds;
    this.validationMaterializedCoastMask = nextValidationMaterializedCoastMask;
  }

  private adjacentCoastRegionId(
    x: number,
    y: number,
    width: number,
    height: number,
    options: Readonly<{ includeValidationMaterializedCoast?: boolean }> = {}
  ): number | null {
    const neighbors = (x & 1) === 1 ? ODD_Q_NEIGHBORS_ODD : ODD_Q_NEIGHBORS_EVEN;
    for (const [dx, dy] of neighbors) {
      const ny = y + dy;
      if (ny < 0 || ny >= height) continue;
      const nx = wrapMockX(x + dx, width);
      const neighborIndex = this.idx(nx, ny);
      if ((this.terrainTypes[neighborIndex] | 0) === this.coastTerrainId) {
        if (
          options.includeValidationMaterializedCoast === false &&
          this.validationMaterializedCoastMask[neighborIndex] === 1
        ) {
          continue;
        }
        return this.landmassRegionIds[neighborIndex] | 0;
      }
    }
    return null;
  }

  private hasAdjacentLandTerrain(x: number, y: number, width: number, height: number): boolean {
    const neighbors = (x & 1) === 1 ? ODD_Q_NEIGHBORS_ODD : ODD_Q_NEIGHBORS_EVEN;
    for (const [dx, dy] of neighbors) {
      const ny = y + dy;
      if (ny < 0 || ny >= height) continue;
      const nx = wrapMockX(x + dx, width);
      const terrain = this.terrainTypes[this.idx(nx, ny)] | 0;
      if (terrain !== this.coastTerrainId && terrain !== this.oceanTerrainId) return true;
    }
    return false;
  }

  // === BIOMES ===

  designateBiomes(width: number, height: number): void {
    // Track call for testing
    this.calls.designateBiomes.push({ width, height });
    // Mock: no-op (biomes already initialized to default)
    this.recordEffect(ENGINE_EFFECT_TAGS.biomesApplied);
  }

  getBiomeGlobal(name: string): number {
    const biomeType = name.toUpperCase().startsWith("BIOME_")
      ? name.toUpperCase()
      : `BIOME_${name.toUpperCase()}`;
    return this.biomeGlobals[biomeType] ?? -1;
  }

  setBiomeType(x: number, y: number, biomeId: number): void {
    this.biomes[this.idx(x, y)] = biomeId;
    this.recordEffect(ENGINE_EFFECT_TAGS.biomesApplied);
  }

  getBiomeType(x: number, y: number): number {
    return this.biomes[this.idx(x, y)];
  }

  // === FEATURES (extended) ===

  addFeatures(width: number, height: number): void {
    // Track call for testing
    this.calls.addFeatures.push({ width, height });
    // Mock: no-op (features already initialized to NO_FEATURE)
    this.recordEffect(ENGINE_EFFECT_TAGS.featuresApplied);
  }

  getFeatureTypeIndex(name: string): number {
    return this.featureTypes[name] ?? -1;
  }

  get NO_FEATURE(): number {
    return -1;
  }

  // === PLACEMENT ===

  stampNaturalWonder(
    x: number,
    y: number,
    featureType: number,
    direction: number,
    elevation?: number
  ): boolean {
    return this.placeNaturalWonder(x, y, featureType, direction, elevation).status === "placed";
  }

  placeNaturalWonder(
    x: number,
    y: number,
    featureType: number,
    direction: number,
    elevation?: number
  ): NaturalWonderPlacementOutcome {
    const plotIndex = y * this.width + x;
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return {
        status: "rejected",
        plotIndex,
        x,
        y,
        featureType,
        direction,
        reason: "out-of-bounds",
      };
    }
    const policy = FEATURE_POLICIES[String(featureType | 0)];
    const footprint = getNaturalWonderFootprintIndices({
      x,
      y,
      width: this.width,
      height: this.height,
      policy: policy ?? {},
      direction,
    });
    if (!footprint) {
      return {
        status: "rejected",
        plotIndex,
        x,
        y,
        featureType,
        direction,
        reason: "unsupported-footprint",
      };
    }
    for (const plotIndex of footprint) {
      const fy = (plotIndex / this.width) | 0;
      const fx = plotIndex - fy * this.width;
      if (!this.canHaveFeature(fx, fy, featureType)) {
        return {
          status: "rejected",
          plotIndex: y * this.width + x,
          x,
          y,
          featureType,
          direction,
          reason: "can-have-feature-param-false",
          observedFeatureType: this.getFeatureType(fx, fy),
          observedPlotIndex: plotIndex,
        };
      }
    }

    const i = this.idx(x, y);
    const resolvedElevation = Number.isFinite(elevation)
      ? (elevation as number)
      : this.elevations[i]!;
    for (const plotIndex of footprint) {
      const fy = (plotIndex / this.width) | 0;
      const fx = plotIndex - fy * this.width;
      this.setFeatureType(fx, fy, {
        Feature: featureType,
        Direction: direction,
        Elevation: resolvedElevation,
      });
    }
    this.calls.stampNaturalWonder.push({
      x,
      y,
      featureType,
      direction,
      elevation: resolvedElevation,
    });
    this.recordPlacementEffect();
    return {
      status: "placed",
      plotIndex,
      x,
      y,
      featureType,
      direction,
      elevation: resolvedElevation,
    };
  }

  stampDiscovery(
    x: number,
    y: number,
    discoveryVisualType: number,
    discoveryActivationType: number
  ): boolean {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
    this.calls.stampDiscovery.push({
      x,
      y,
      discoveryVisualType,
      discoveryActivationType,
    });
    this.recordPlacementEffect();
    return true;
  }

  placeDiscoveryIntent(
    width: number,
    height: number,
    intent: DiscoveryPlacementIntent
  ): DiscoveryPlacementOutcome {
    // Keep mock discovery behavior aligned with Civ7Adapter: placement success
    // is explicit evidence, and rejection is a typed result the recipe can
    // publish for review/debugging.
    const resolvedWidth = Math.max(0, Math.trunc(width));
    const resolvedHeight = Math.max(0, Math.trunc(height));
    const plotIndex = Number.isFinite(intent.plotIndex) ? Math.trunc(intent.plotIndex) : -1;
    const discoveryVisualType = Number.isFinite(intent.discoveryVisualType)
      ? Math.trunc(intent.discoveryVisualType)
      : -1;
    const discoveryActivationType = Number.isFinite(intent.discoveryActivationType)
      ? Math.trunc(intent.discoveryActivationType)
      : -1;
    const y = resolvedWidth > 0 ? Math.trunc(plotIndex / resolvedWidth) : -1;
    const x = resolvedWidth > 0 ? plotIndex - y * resolvedWidth : -1;

    if (plotIndex < 0 || x < 0 || y < 0 || x >= resolvedWidth || y >= resolvedHeight) {
      return {
        status: "rejected",
        plotIndex,
        x,
        y,
        discoveryVisualType,
        discoveryActivationType,
        reason: "out-of-bounds",
      };
    }
    if (discoveryVisualType < 0 || discoveryActivationType < 0) {
      return {
        status: "rejected",
        plotIndex,
        x,
        y,
        discoveryVisualType,
        discoveryActivationType,
        reason: "invalid-discovery-type",
      };
    }

    const placed = this.stampDiscovery(x, y, discoveryVisualType, discoveryActivationType);
    if (!placed) {
      return {
        status: "rejected",
        plotIndex,
        x,
        y,
        discoveryVisualType,
        discoveryActivationType,
        reason: "adapter-rejected",
      };
    }
    return { status: "placed", plotIndex, x, y, discoveryVisualType, discoveryActivationType };
  }

  generateOfficialDiscoveries(
    width: number,
    height: number,
    startPositions: ReadonlyArray<number>,
    polarMargin: number
  ): OfficialDiscoveryGenerationResult {
    const resolvedStartPositions = (Array.isArray(startPositions) ? startPositions : [])
      .filter((value) => Number.isFinite(value) && value >= 0)
      .map((value) => Math.trunc(value));
    const resolvedPolarMargin = Number.isFinite(polarMargin)
      ? Math.max(0, Math.trunc(polarMargin))
      : 0;

    this.calls.generateOfficialDiscoveries.push({
      width,
      height,
      startPositions: resolvedStartPositions,
      polarMargin: resolvedPolarMargin,
    });
    this.recordPlacementEffect();
    // The mock does not run the real generator; it reports the configured count
    // as both attempted and placed (no engine-side rejection in the mock).
    return {
      attemptedCount: this.officialDiscoveriesPlacedCount,
      placedCount: this.officialDiscoveriesPlacedCount,
    };
  }

  generateOfficialResources(
    width: number,
    height: number,
    minMarineResourceTypesOverride?: number
  ): number {
    const resolvedMinMarineResourceTypesOverride = Number.isFinite(minMarineResourceTypesOverride)
      ? Math.max(0, Math.trunc(minMarineResourceTypesOverride as number))
      : undefined;
    this.calls.generateOfficialResources.push({
      width,
      height,
      minMarineResourceTypesOverride: resolvedMinMarineResourceTypesOverride,
    });
    const placedCount = this.officialResourcesPlacedCount;
    this.resourcesPlaced += placedCount;
    this.recordPlacementEffect();
    return placedCount;
  }

  getNaturalWonderCatalog(): NaturalWonderCatalogEntry[] {
    return this.naturalWonderCatalog.map((entry) => ({
      featureType: entry.featureType,
      direction: entry.direction,
    }));
  }

  generateSnow(width: number, height: number): void {
    this.calls.generateSnow.push({ width, height });
    // Mock: no-op
    this.recordPlacementEffect();
  }

  assignStartPositions(
    playersLandmass1: number,
    playersLandmass2: number,
    _westContinent: { west: number; east: number; south: number; north: number },
    _eastContinent: { west: number; east: number; south: number; north: number },
    startSectorRows: number,
    startSectorCols: number,
    _startSectors: number[]
  ): number[] {
    this.calls.assignStartPositions.push({
      playersLandmass1,
      playersLandmass2,
      startSectorRows,
      startSectorCols,
    });
    this.recordPlacementEffect();
    // Mock: return array of placeholder positions (one per player)
    const totalPlayers = playersLandmass1 + playersLandmass2;
    return Array.from({ length: totalPlayers }, (_, i) => i * 100);
  }

  setStartPosition(plotIndex: number, playerId: number): void {
    this.calls.setStartPosition.push({ plotIndex, playerId });
    this.recordPlacementEffect();
  }

  getAliveMajorIds(): number[] {
    // Mock semantics: contiguous major ids 0..N-1 (Milestone A5 verified the
    // live engine is also contiguous-from-zero, human first). Count comes
    // from the explicit aliveMajorCount when configured (live games can have
    // fewer alive players than the map-info landmass slots), else from the
    // configured map info player counts.
    const players =
      this.aliveMajorCount ??
      Math.max(0, (this.mapInfo?.PlayersLandmass1 ?? 0) | 0) +
        Math.max(0, (this.mapInfo?.PlayersLandmass2 ?? 0) | 0);
    return Array.from({ length: players }, (_, index) => index);
  }

  assignAdvancedStartRegions(): void {
    this.calls.assignAdvancedStartRegions++;
    // Mock: no-op
    this.recordPlacementEffect();
  }

  addFloodplains(minLength: number, maxLength: number): void {
    this.calls.addFloodplains.push({ minLength, maxLength });
    // Mock: no-op
    this.recordPlacementEffect();
  }

  recalculateFertility(): void {
    this.calls.recalculateFertility++;
    // Mock: no-op
    this.recordPlacementEffect();
  }

  chooseStartSectors(
    _players1: number,
    _players2: number,
    _rows: number,
    _cols: number,
    _humanNearEquator: boolean
  ): unknown[] {
    // Mock: empty; callers can supply custom behavior if they need it.
    return [];
  }

  needHumanNearEquator(): boolean {
    return false;
  }

  // === MOCK-SPECIFIC HELPERS ===

  /** Set water mask for testing */
  setWater(x: number, y: number, isWater: boolean): void {
    const index = this.idx(x, y);
    this.waterMask[index] = isWater ? 1 : 0;
    if (!isWater) {
      this.lakeMask[index] = 0;
    }
  }

  /** Set mountain mask for testing */
  setMountain(x: number, y: number, isMountain: boolean): void {
    this.mountainMask[this.idx(x, y)] = isMountain ? 1 : 0;
  }

  /** Fill all tiles with water/land */
  fillWater(isWater: boolean): void {
    this.waterMask.fill(isWater ? 1 : 0);
    if (!isWater) {
      this.lakeMask.fill(0);
    }
  }

  /** Reset all data to defaults */
  reset(config: MockAdapterConfig = {}): void {
    if (Number.isFinite(config.noResourceSentinel)) {
      this.noResourceSentinel = (config.noResourceSentinel as number) | 0;
    }
    this.resourceTypeCatalog = sanitizeResourceTypeCatalog(
      config.resourceTypeCatalog ?? this.resourceTypeCatalog,
      this.noResourceSentinel
    );

    this.terrainTypes.fill(config.defaultTerrainType ?? 0);
    this.elevations.fill(config.defaultElevation ?? 100);
    this.rainfall.fill(config.defaultRainfall ?? 50);
    this.temperature.fill(config.defaultTemperature ?? 15);
    this.features.fill(-1);
    this.resources.fill(this.NO_RESOURCE);
    this.biomes.fill(config.defaultBiomeType ?? 0);
    this.waterMask.fill(0);
    this.lakeMask.fill(0);
    this.validationMaterializedCoastMask.fill(0);
    this.mountainMask.fill(0);
    this.riverMask.fill(0);
    this.landmassRegionIds.fill(0);
    this.mapSizeId = config.mapSizeId ?? 0;
    this.mapInfo = config.mapInfo ?? null;
    this.calls.setMapInitData.length = 0;
    this.calls.designateBiomes.length = 0;
    this.calls.addFeatures.length = 0;
    this.calls.stampNaturalWonder.length = 0;
    this.calls.stampDiscovery.length = 0;
    this.calls.generateOfficialDiscoveries.length = 0;
    this.calls.generateOfficialResources.length = 0;
    this.calls.generateSnow.length = 0;
    this.calls.setResourceType.length = 0;
    this.calls.generateLakes.length = 0;
    this.calls.stampLakes.length = 0;
    this.calls.expandCoasts.length = 0;
    this.calls.assignStartPositions.length = 0;
    this.calls.setStartPosition.length = 0;
    this.calls.assignAdvancedStartRegions = 0;
    this.calls.addFloodplains.length = 0;
    this.calls.recalculateFertility = 0;
    this.calls.addPlotEffect.length = 0;
    this.resourcesPlaced = 0;
    this.effectEvidence.clear();
    this.terrainTypeIndices = config.terrainTypeIndices ?? { ...DEFAULT_TERRAIN_TYPE_INDICES };
    this.plotTags = { ...DEFAULT_PLOT_TAGS, ...(config.plotTags ?? {}) };
    this.landmassIds = { ...DEFAULT_LANDMASS_IDS, ...(config.landmassIds ?? {}) };
    this.canHaveFeatureFn = config.canHaveFeature ?? this.canHaveFeatureFn;
    this.canHaveResourceFn = config.canHaveResource ?? this.canHaveResourceFn;
    this.naturalWonderCatalog = (
      config.naturalWonderCatalog ??
      this.naturalWonderCatalog ??
      DEFAULT_NATURAL_WONDER_CATALOG
    ).map((entry) => ({
      featureType: entry.featureType,
      direction: entry.direction,
    }));
    this.plotEffectTypes = (config.plotEffectTypes ?? DEFAULT_PLOT_EFFECT_TYPES).map((entry) => ({
      id: entry.id,
      name: entry.name,
      tags: new Set(entry.tags.map((tag) => tag.toUpperCase())),
    }));
    this.officialDiscoveriesPlacedCount = Number.isFinite(config.officialDiscoveriesPlacedCount)
      ? Math.max(0, Math.trunc(config.officialDiscoveriesPlacedCount as number))
      : this.officialDiscoveriesPlacedCount;
    this.officialResourcesPlacedCount = Number.isFinite(config.officialResourcesPlacedCount)
      ? Math.max(0, Math.trunc(config.officialResourcesPlacedCount as number))
      : this.officialResourcesPlacedCount;
    this.plotEffectsByIndex.clear();

    this.coastTerrainId = this.getTerrainTypeIndex("TERRAIN_COAST");
    this.oceanTerrainId = this.getTerrainTypeIndex("TERRAIN_OCEAN");
    this.mountainTerrainId = this.getTerrainTypeIndex("TERRAIN_MOUNTAIN");
  }

  /** Set biome type for testing */
  setBiome(x: number, y: number, biomeId: number): void {
    this.biomes[this.idx(x, y)] = biomeId;
  }

  /** Fill all tiles with a biome type */
  fillBiome(biomeId: number): void {
    this.biomes.fill(biomeId);
  }

  /** Register a custom biome global */
  registerBiomeGlobal(name: string, index: number): void {
    this.biomeGlobals[name] = index;
  }

  /** Register a custom feature type */
  registerFeatureType(name: string, index: number): void {
    this.featureTypes[name] = index;
  }
}

/**
 * Create a mock adapter with default configuration
 */
export function createMockAdapter(config?: MockAdapterConfig): MockAdapter {
  return new MockAdapter(config);
}
