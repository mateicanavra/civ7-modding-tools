import { BoundingBox } from "/core/scripts/external/TypeScript-Voronoi-master/src/bounding_box.js";
import { Cell } from "/core/scripts/external/TypeScript-Voronoi-master/src/cell.js";
import { Diagram } from "/core/scripts/external/TypeScript-Voronoi-master/src/diagram.js";
import { Site } from "/core/scripts/external/TypeScript-Voronoi-master/src/site.js";
import { BiomeType, DetailsType, FeatureType, MapSize, PathKey, TerrainType } from "/base-standard/scripts/voronoi-types.js";
export declare enum WrapType {
    None = 0,
    WrapX = 1,
    WrapY = 2,
    WrapXY = 3
}
export declare class RegionCell {
    id: number;
    cell: Cell;
    area: number;
    landmassId: number;
    landmassOrder: number;
    plateId: number;
    plateOrder: number;
    elevation: number;
    terrainType: TerrainType;
    biomeType: BiomeType;
    featureType: FeatureType;
    detailsType: DetailsType;
    regionConsiderationBits: bigint;
    ruleConsideration: boolean;
    currentScore: number;
    constructor(cell: Cell, id: number, area: number);
    reset(): void;
}
export declare const RegionCellPosGetter: (cell: RegionCell) => {
    x: any;
    y: any;
};
export declare class PlateBoundary {
    pos: float2;
    normal: float2;
    plateSubduction: number;
    plateSliding: number;
    id1: number;
    id2: number;
}
export declare const PlateBoundaryPosGetter: (data: PlateBoundary) => {
    x: any;
    y: any;
};
export declare class Aabb2 {
    min: float2;
    max: float2;
    constructor(min: float2, max: float2);
    clone(): Aabb2;
    contains(pos: float2): boolean;
    get width(): number;
    get height(): number;
    size(): float2;
    distSqToPoint(px: number, py: number): number;
    intersects(other: Aabb2): boolean;
    getWrappedData(pos: float2, wrapType: WrapType): {
        pos: float2;
        signedNearest: float2;
    };
}
export type WrapDistOptions = {
    wrap?: typeof WrapType.None;
} | {
    wrap: typeof WrapType.WrapX;
    width: number;
} | {
    wrap: typeof WrapType.WrapY;
    height: number;
} | {
    wrap: typeof WrapType.WrapXY;
    width: number;
    height: number;
};
export interface PropertyRef<T> {
    get(): T;
    set(value: T): void;
    subscribe(listener: (newValue: T) => void): () => void;
}
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export declare function getterSetter<T>(get: () => T, set: (newValue: T) => void): PropertyRef<T>;
export declare function propRef<TObj, TKey extends keyof TObj>(obj: TObj, key: TKey): PropertyRef<TObj[TKey]>;
export declare function propArrayRef<TObj, TKey extends keyof TObj>(arr: TObj[], key: TKey): PropertyRef<TObj[TKey]>;
export declare namespace VoronoiUtils {
    export const colors: Color[];
    export function getRandColor(idx: number): Color;
    export function getRandomMinMax(min: number, max: number, strLog: string): number;
    export function getRandomMinMaxFloat(min: number, max: number, strLog: string): number;
    export type RequireDefined<T, K extends keyof T> = T & {
        [P in K]-?: Exclude<T[P], undefined>;
    };
    export function voronoiCellCentroid(cell: Cell): float2;
    export function lloydRelaxation(cells: Cell[], strength: number): Site[];
    export function computeVoronoi(sites: Site[], bbox: BoundingBox, relaxationSteps: number, wrap?: WrapType): Diagram;
    export function createRandomSites<T extends Site = Site>(count: number, maxX: number, maxY: number, factory?: (x: number, y: number) => T): T[];
    export function dot(dir1: float2, dir2: float2): number;
    export function crossZ(dir1: float2, dir2: float2): number;
    export function lerp(a: number, b: number, t: number): number;
    export function normalize(v: float2): float2;
    export function iLerp(a: number, b: number, t: number): number;
    export function clamp(a: number, min: number, max: number): number;
    export function pointInsideCell(cell: Cell, point: float2): boolean;
    export function calculateCellArea(cell: Cell): number;
    export function wrapDelta(d: number, P: number): number;
    export function sqDistance(pt1: float2, pt2: float2, opts?: WrapDistOptions): number;
    export function sqDistanceBetweenSites(site1: Site, site2: Site, opts?: WrapDistOptions): number;
    export function distanceBetweenSites(site1: Site, site2: Site, opts?: WrapDistOptions): any;
    export function defaultEnumRecord<E extends Record<string, string | number>, T>(e: E): Record<E[keyof E], T>;
    export function shuffle<T>(arr: T[], count?: number): void;
    export enum RegionCellFilterResult {
        Continue = 0,
        HaltSuccess = 1,
        HaltFail = 2
    }
    export type RegionCellFilterCallback = (cell: RegionCell) => RegionCellFilterResult;
    export function regionCellAreaFilter(cell: RegionCell, regionCells: RegionCell[], maxDistance: number, filterCallback: RegionCellFilterCallback, distOpts?: WrapDistOptions): RegionCellFilterResult;
    export function deepMerge<T extends object>(to: T, from: Partial<T>): void;
    export function isPlainObject(x: unknown): x is Record<string, unknown>;
    type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
    interface JsonObject {
        [key: string]: JsonValue;
    }
    export function explodeConfig(input: Record<string, unknown>): JsonObject;
    export function loadTextFromPath(url: string): Promise<string | null>;
    export function loadJsonFromPath<T = unknown>(url: string): Promise<T | null>;
    export function loadJsFromPath<T = unknown>(url: string): Promise<T | null>;
    export function clone<T>(obj: T): T;
    export function isArrayIndexKey(key: PathKey): any;
    export function stringToPath(path: string): PathKey[];
    export function getPath(obj: unknown, path: PathKey[]): any;
    export function setPath(obj: unknown, path: PathKey[], value: unknown, createNewNodes?: boolean): boolean;
    export function getRoundedString(value: number, precision: number): any;
    export function swapAndPop<T>(arr: T[], indexToRemove: number): T;
    export function performanceMarker(label: string): void;
    export function posMod(n: number, m: number): number;
    export function hashString(str: string): number;
    export function schlickBias(v: number, b: number): number;
    export function schlickInvBias(v: number, invB: number): number;
    export function getMapSizeForDims(hexDims: float2): MapSize;
    export function gaussian(pos: number, center: number, deviation: number): number;
    export function computeBoundedPartitionRange(count: number, totalSize: number, maxVariance: number): [
        number,
        number
    ];
    export function distributeTotal(totalSize: number, minSize: number, maxSize: number, count: number): number[];
    export function generateLocationsAroundCircle(count: number, minDistance: number, maxDistance: number): float2[];
    export function generateLocationsAroundCircleWithOffsets(distances: number[]): float2[];
    export function getPoissonRands(count: number, label: string, threshold?: number): number[];
    export {};
}
export declare class Color {
    r: number;
    g: number;
    b: number;
    a: number;
    constructor(r: number, g: number, b: number, a?: number);
    toHexString(): string;
    toRGBString(): string;
    toUint(): number;
    toFloat3(): float3;
    toFloat4(): float4;
    private static byteToHex;
    static FromHex(hexString: string): Color;
    static FromRGBString(rgbString: string): Color;
    static FromUint(uintColor: number): Color;
    static lerp(c1: Color, c2: Color, t: number): Color;
}
