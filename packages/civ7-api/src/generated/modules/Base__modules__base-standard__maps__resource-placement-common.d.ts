/**
 * Shared resource placement utilities used by both initial generation and age transitions.
 * Contains tile classification, blue noise window building, landmass eligibility, and
 * per-plot resource validation logic.
 * @packageDocumentation
 */
export declare const VERBOSE_LOGGING = true;
export type ResourceIndex = number;
export type ResourceHash = number;
export declare const NUM_LANDMASS_GROUPS = 2;
export declare const DENSITY_TARGET = 0.15;
export declare const MAX_DENSITY = 0.5;
export declare const TILE_CLASS_ID_BITS: number;
export declare const TILE_CLASS_ID_MAX: number;
export interface TileClass {
    terrain: TerrainType;
    biome: BiomeType;
    feature: FeatureType;
}
export declare const NUM_TILE_GROUPS: number;
export declare function getDenseTileGroupId(rawTileId: number): number;
export declare function getTileClassId(terrain: number, biome: number, feature: number): number;
export declare function getLandmassTileClassGroupId(denseId: number, extra: number): number;
export declare function getTileClass(x: number, y: number): TileClass;
export declare function getTileId(x: number, y: number): number;
export declare function tileClassFromId(tileId: number): TileClass;
export declare function isCoastalAdjacentToLand(x: number, y: number, tc: TileClass): boolean;
export declare function tileClassIdFromValidBiome(validBiome: {
    TerrainType: string;
    BiomeType: string;
    FeatureType?: string;
}): number | undefined;
export declare function tileClassLabel(tc: TileClass): string;
export declare function isResourceAllowedOnLandmass(assignedLandmass: number, regionId: number, numGroups: number): boolean;
export interface ResourcePlacementContext {
    iWidth: number;
    iHeight: number;
    groupCount: Uint16Array;
    groupAdjCount: Uint16Array;
    groupRawId: Uint16Array;
    tileIdCache: Uint16Array;
    regionIdCache: Uint8Array;
    adjToLandCache: Uint8Array;
    maxPlayerRegion: number;
    nonOceanTileCount: number;
    regionCount: Uint16Array;
    regionAdjCount: Uint16Array;
    landmassEligible: Map<number, {
        count: number;
        adj: number;
    }>;
}
export interface ResourceSet {
    activeResourceIndices: Uint16Array;
    resourceWeight: Float32Array;
    resourceAssignedLandmass: Uint8Array;
    resolvedValidBiomes: ResolvedValidBiome[];
}
export interface ResourceMetrics {
    resourceDesiredCount: Float32Array;
    resourceEligibleTileCounts: Uint32Array;
    resourceEligiblePerLandmass: Uint32Array;
    resourceMinimumPerLandmass: Uint8Array;
}
export interface PackedBlueNoiseWindows {
    types: Uint16Array;
    sizes: Uint16Array;
    offsets: Uint16Array;
    counts: Uint8Array;
    maxGapSize: Uint16Array;
}
export interface BlueNoisePlan {
    windows: PackedBlueNoiseWindows;
    metrics: ResourceMetrics;
}
export interface DensityConfig {
    densityTarget: number;
    maxDensity: number;
    effectiveMinimums?: Uint16Array;
    densityByResourceAndGroup?: Float32Array;
}
export interface PlacementOptions {
    offsetX: number;
    offsetY: number;
    skipMask?: Uint8Array;
    shouldPlaceResource?: (x: number, y: number, resourceIdx: ResourceIndex, regionId: number) => boolean;
    onResourcePlaced?: (x: number, y: number, resourceIdx: ResourceIndex, regionId: number) => void;
}
export declare function buildPlacementContext(iWidth: number, iHeight: number): ResourcePlacementContext;
/**
 * Builds a ResourceSet from a list of candidate resources: filters to Tradeable,
 * assigns landmass groups to LandmassUnique resources via shuffled alternation
 * across NUM_LANDMASS_GROUPS, and packs into the ResourceSet used by placement.
 * The optional 'include' predicate applies additional filtering.
 */
export declare function prepareResourceSet(candidateHashes: ResourceType[], include?: (info: ResourceDefinition) => boolean): ResourceSet;
export interface ResolvedValidBiome {
    tileGroupId: number;
    resourceIdx: ResourceIndex;
    adjacentToLand: boolean;
    weight: number;
}
export declare function buildResourceSet(activeResources: {
    typeIdx: number;
    landmassId: number;
}[], resourceWeight: Float32Array): ResourceSet;
/**
 * Calculates blue noise placement windows for each tile group.
 *
 * For each tile group, competing resources share the density budget proportional to
 * their weight. Windows are packed into [0, 65535] for the placement pass.
 */
export declare function buildBlueNoiseWindows(ctx: ResourcePlacementContext, set: ResourceSet, config: DensityConfig): BlueNoisePlan;
/**
 * Iterates every tile, samples blue noise, and places the resource whose window matches.
 *
 * Window sizes are scaled during placement to account for how far off we are from the expected count
 * to help ensure final counts are close to the desired density. If a resource ever falls behind in its
 * expected minimum count it is force-placed on the next eligible tile.
 */
export declare function placeResourcesWithBlueNoise(ctx: ResourcePlacementContext, set: ResourceSet, plan: BlueNoisePlan, options: PlacementOptions): void;
