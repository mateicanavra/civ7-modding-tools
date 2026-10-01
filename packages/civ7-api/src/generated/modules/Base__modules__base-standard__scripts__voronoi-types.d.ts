export declare enum RegionType {
    None = 0,
    Ocean = 1,
    Landmass = 2,
    Island = 3,
    CoastalIsland = 4,
    _Length = 5
}
export declare enum TerrainType {
    Unknown = 0,
    Ocean = 1,
    Coast = 2,
    Flat = 3,
    Rough = 4,
    Mountainous = 5,
    NavRiver = 6,
    _Length = 7
}
export declare enum FeatureType {
    None = 0,
    Volcano = 1,
    _Length = 2
}
export declare function isLand(terrainType: TerrainType): terrainType is TerrainType.Flat | TerrainType.Rough | TerrainType.Mountainous;
export declare function isWater(terrainType: TerrainType): terrainType is TerrainType.Ocean | TerrainType.Coast | TerrainType.NavRiver;
export declare enum BiomeType {
    Unknown = 0,
    Ocean = 1,
    Desert = 2,
    Grassland = 3,
    Plains = 4,
    Tropical = 5,
    Tundra = 6,
    _Length = 7
}
export declare enum DetailsType {
    None = 0,
    MinorRiver = 1,
    Wet = 2,
    Vegetated = 3,
    Floodplain = 4,
    Snow = 5,
    _Length = 6
}
export type PathKey = string | number;
export interface Indexable {
    [key: string]: unknown;
    [key: number]: unknown;
}
export type ConfigValueType = number | boolean;
export interface ConfigValueRecord {
    [key: string]: ConfigValueType | ConfigValueRecord | ConfigValueRecord[];
}
export interface RuleConfigType {
    className: string;
    weight: number;
    isActive: boolean;
    config?: ConfigValueRecord;
}
export type RuleConfigValueRecord = Record<string, Record<string, RuleConfigType>>;
export type ConfigValueFromNode<N extends ParameterSpecNode> = N extends {
    children: infer C extends ParameterSpecRecord;
} ? ConfigValueRecordTyped<C>[] : N extends {
    default: infer D;
} ? D extends boolean ? boolean : D extends number ? number : D extends string ? string : D : never;
export type ConfigValueRecordTyped<TSpecs extends ParameterSpecRecord> = {
    -readonly [K in keyof TSpecs]: ConfigValueFromNode<TSpecs[K]>;
};
export declare enum VariantOverrideType {
    Replace = 0,
    Add = 1,
    Multiply = 2
}
export type ParameterSpecNode = ParameterSpec | ParameterSpecGroup;
export type ParameterSpecRecord = Record<string, ParameterSpecNode>;
export interface ParameterSpec {
    visible?: boolean;
    label: string;
    description?: string;
    default: ConfigValueType;
    min?: number;
    max?: number;
    step?: number;
    locked?: boolean;
    unified?: boolean;
}
export interface ParameterSpecGroup {
    visible?: boolean;
    label: string;
    description?: string;
    children: ParameterSpecRecord;
    default?: never;
    min?: never;
    max?: never;
    step?: never;
    locked?: never;
    unified?: never;
}
export declare enum MapSize {
    Tiny = 0,
    Small = 1,
    Standard = 2,
    Large = 3,
    Huge = 4
}
export declare const MapDims: Record<MapSize, {
    x: number;
    y: number;
}>;
export interface VectorField {
    sampleLatLong(latDeg: number, lonDeg: number): float2;
    sampleUV(u: number, v: number): float2;
    sampleSigned(x: number, y: number): float2;
}
