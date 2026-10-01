import { kdTree } from "/base-standard/scripts/kd-tree.js";
import { LandmassRegion } from "/base-standard/scripts/voronoi-region.js";
import { BiomeType, ConfigValueRecord, FeatureType, ParameterSpecNode, TerrainType } from "/base-standard/scripts/voronoi-types.js";
import { RegionCell } from "/base-standard/scripts/voronoi-utils.js";
export declare enum SeparationFilterOptions {
    OFF = 0,
    DIFFERENT_LANDMASSES = 1,
    DIFFERENT_LANDMASS_GROUPS = 2,
    DIFFERENT_TYPES = 4,
    ALL = 7
}
export declare enum RemoveBridgingLandmassOptions {
    OFF = 0,
    FORCE_COASTS = 1,
    FORCE_OCEANS = 2
}
export declare class HexValidationSettings {
    polarMargin: number;
    removeBridgingPlayerLandmasses: RemoveBridgingLandmassOptions;
    forceCoasts: boolean;
    removeLakes: boolean;
    removeOrphanCoastTiles: boolean;
    lakeDensityAllowed: number;
    maxLakeSize: number;
    removeAdjacentVolcanos: boolean;
    rebuildPlayerLandmasses: boolean;
}
export declare class VoronoiValidationSettings {
    forceCoasts: SeparationFilterOptions;
    forceOceans: SeparationFilterOptions;
}
export declare class HexTile {
    pos: float2;
    coord: float2;
    playerLandmassId: number;
    majorPlayerRegionId: number;
    terrainType: TerrainType;
    biomeType: BiomeType;
    featureType: FeatureType;
    visited: number;
    isPassable(): boolean;
}
export declare class HexTileDesc {
    playerLandmassId: number;
    terrainType: TerrainType;
    biomeType: BiomeType;
    featureType: FeatureType;
}
export declare enum FloodFillResult {
    Include = 0,
    Exclude = 1,
    Halt = 2
}
export interface LandmassTiles {
    land: number;
    coast: number;
    playerLandmassId: number;
}
export declare class HexMapStats {
    oceanTileCount: number;
    totalCoastCount: number;
    totalLandCount: number;
    playerLandmasses: LandmassTiles[];
    nonPlayerLand: LandmassTiles;
    log(): void;
}
export interface LakeSettings extends ConfigValueRecord {
    lakeDensity: number;
    meanSize: number;
    stdDevBelow: number;
    stdDevAbove: number;
    clumpiness: number;
}
export declare const lakeSettingsSchema: ParameterSpecGroup;
export declare const hexMapSchema: ParameterSpecGroup;
export declare function getDefaultHexSettings(): ConfigValueRecord;
export declare class HexMap {
    private m_tiles;
    private m_wrappedXIndices;
    private m_xOffset;
    private m_yOffset;
    private m_validationSettings;
    private m_lakeTiles;
    private m_settings;
    getSettings(): ConfigValueRecord;
    setSettings(settings: ConfigValueRecord): void;
    setValidationSettings(validationSettings: HexValidationSettings): void;
    buildWrappedIndices(xCount: number): void;
    getSettingsSchema(): ParameterSpecNode;
    initFromRegionCells(width: number, height: number, tree: Readonly<kdTree<RegionCell>>, landmassRegions: readonly LandmassRegion[], playerRegionCallback: (cell: RegionCell) => number, voronoiValidationSettings?: VoronoiValidationSettings, dominantCells?: RegionCell[][]): void;
    initFromTiles(xCount: number, yCount: number, getTile: (x: number, y: number, pos: float2) => HexTileDesc): void;
    initFromTerrainBuilder(): void;
    writeToTerrainBuilder(): void;
    consolePrintMap(tiles: {
        terrainType: TerrainType;
    }[][]): void;
    EvenRowDeltas: [
        number,
        number
    ][];
    OddRowDeltas: [
        number,
        number
    ][];
    forNeighbors<T = HexTile>(x: number, y: number, sourceArray: readonly T[][], callback: (neighbor: T) => void): void;
    getNeighborsOfArr<T = HexTile>(neighbors: T[], x: number, y: number, sourceArr: readonly T[][]): void;
    getNeighborsOfArrFiltered<T = HexTile>(neighbors: T[], x: number, y: number, sourceArr: readonly T[][], condition: (neighbor: T) => boolean): void;
    appendNeighbors(tile: HexTile, list: HexTile[], condition: (neighbor: HexTile) => boolean): void;
    anyNeighborOfArr<T = HexTile>(x: number, y: number, sourceArr: readonly T[][], condition: (neighbor: T) => boolean): boolean;
    anyNeighbor(tile: HexTile, condition: (neighbor: HexTile) => boolean): boolean;
    forAllTiles(callback: (tile: HexTile) => void): void;
    validate(): void;
    getMapStats(): HexMapStats;
    validatePoles(marginSize: number): void;
    validateCoasts(): void;
    removeLakes(): void;
    removeOrphanCoastTiles(): void;
    removeAdjacentVolcanoes(): void;
    GenerateLakes(): void;
    removeBridgingPlayerLandmasses(option: RemoveBridgingLandmassOptions): void;
    rebuildPlayerLandmasses(): void;
    offset(x: number, y: number): void;
    getOffsetX(): number;
    getOffsetY(): number;
    alignToBestMeridian(): void;
    floodFill(initialTile: HexTile, considerCallback: (tile: HexTile) => FloodFillResult): HexTile[];
    clearVisited(): void;
    getTiles(): readonly HexTile[][];
}
