import { HexMap, HexTile } from "/base-standard/scripts/hex-map.js";
import { PlayerRegion } from "/base-standard/scripts/player-areas.js";
import { ConfigValueRecord, ConfigValueType, PathKey, RuleConfigValueRecord, VariantOverrideType } from "/base-standard/scripts/voronoi-types.js";
import { VoronoiBuilder } from "/base-standard/scripts/voronoi-builder.js";
import { RegionCell, WrapType } from "/base-standard/scripts/voronoi-utils.js";
import { ContinentGeneratorSettings } from "/base-standard/scripts/voronoi_generators/continent-generator.js";
import { GeneratorType, MapGenerator } from "/base-standard/scripts/voronoi_generators/map-generator.js";
export interface MapSettingConfig {
    label: string;
    description?: string;
    default: number;
    min: number;
    max: number;
    step?: number;
    hidden?: boolean;
}
export type MapGeneratorSettings = ContinentGeneratorSettings;
export interface MapTypeSetting {
    generatorType: GeneratorType;
    filename: string;
    generatorSettings: MapGeneratorSettings;
    mapSettings: Record<string, number>;
}
export type OverrideValueType = [
    ConfigValueType,
    VariantOverrideType
];
export type VariantValue = OverrideValueType | VariantRecord | VariantRecord[];
export interface VariantRecord {
    [key: string]: VariantValue;
}
export interface MapVariantSetting {
    mapSettings: VariantRecord;
    generatorSettings: Record<string, VariantRecord>;
    ruleSettings: Record<string, Record<string, VariantRecord>>;
    hexSettings: VariantRecord;
}
export interface MainSettings {
    mapSettings: ConfigValueRecord;
    generatorSettings: Record<string, ConfigValueRecord>;
    ruleSettings: Record<string, Record<string, ConfigValueRecord>>;
    hexSettings: ConfigValueRecord;
}
export interface MapVariant {
    selected: string | undefined;
    settings: Record<string, MapVariantSetting>;
}
export type MapVariants = Record<string, MapVariant>;
export type MapSettingSchema = Record<string, MapSettingConfig>;
export interface MapBaseSettings extends ConfigValueRecord {
    totalPlayers: number;
    voronoiCellCountMultiple: number;
    voronoiRelaxationSteps: number;
    wrapX: boolean;
}
export declare const voronoiMapSchema: Record<string, MapSettingConfig>;
export declare abstract class VoronoiMap<T extends MapBaseSettings = MapBaseSettings> {
    protected m_baseSchema: MapSettingSchema & {
        [K in keyof MapBaseSettings]: MapSettingConfig;
    };
    protected m_builder: VoronoiBuilder;
    protected m_initialized: boolean;
    protected m_settings: T;
    protected m_variants: MapVariants;
    protected m_defaultSettings: MainSettings;
    protected m_defaultJson: object;
    protected m_primarySettings: MainSettings;
    protected m_builderNeedsInit: boolean;
    protected m_hexDims: float2;
    protected m_generator: MapGenerator;
    protected m_hexTiles: HexMap;
    private m_rndInitState;
    private m_rndSimulateInternalState;
    private m_rndSimulateState;
    private m_initialVariants;
    private m_dominantCells;
    abstract init(mapSize: float2): void;
    abstract getFilename(): string;
    protected abstract simulateInternal(): void;
    constructor(baseSchema: typeof voronoiMapSchema, generator: MapGenerator, defaultGeneratorSettings: ConfigValueRecord, defaultRulesSettings: RuleConfigValueRecord, defaultJson?: object);
    getSettings(): T;
    setSettings(settings: T): void;
    getHexTiles(): HexMap;
    getGenerator(): MapGenerator;
    getSettingsConfig(): MapSettingSchema;
    getWrapType(): WrapType;
    createMajorPlayerAreas(valueFunction?: (tile: HexTile) => number, playerRegions?: PlayerRegion[] | undefined): void;
    simulate(): void;
    protected getPlayerLandmassFromCell(cell: RegionCell): number;
    getRegionCellForHex(x: number, y: number): RegionCell | undefined;
    protected getVoronoiValidationSettings(): any;
    initInternal(hexDims: float2): void;
    initBuilder(): void;
    resetToDefault(): void;
    setPrimaryMapSetting(keyPath: PathKey[], value: ConfigValueType): void;
    setPrimaryGeneratorSetting(keyPath: PathKey[], value: ConfigValueType): void;
    setPrimaryRuleSetting(keyPath: PathKey[], value: ConfigValueType): void;
    setPrimaryHexSetting(keyPath: PathKey[], value: ConfigValueType): void;
    getPrimaryMapSetting(keyPath: PathKey[]): ConfigValueType;
    getPrimaryGeneratorSetting(keyPath: PathKey[]): ConfigValueType;
    getPrimaryRuleSetting(keyPath: PathKey[]): ConfigValueType;
    getPrimaryHexSetting(keyPath: PathKey[]): ConfigValueType;
    getVariants(): MapVariants;
    setVariants(variants: MapVariants): void;
    createVariant(name: string): void;
    deleteVariant(name: string): void;
    createVariantKey(variantName: string, key: string): void;
    deleteVariantKey(variantName: string, key: string): void;
    setSelectedVariantKey(variantName: string, key: string | undefined): void;
    applyOverrideAtPath(target: unknown, path: Readonly<string | number>[], [overrideValue, overrideType]: OverrideValueType): void;
    applyVariants(): void;
    getSelectedVariantKey(variantName: string): string | undefined;
    setVariantMapSetting(name: string, key: string, path: string[], value: OverrideValueType): void;
    setVariantGeneratorSetting(name: string, key: string, path: string[], value: OverrideValueType): void;
    setVariantRuleSetting(name: string, key: string, path: string[], value: OverrideValueType): void;
    setVariantHexSetting(name: string, key: string, path: string[], value: OverrideValueType): void;
    getVariantMapSetting(name: string, key: string, path: string[]): OverrideValueType | undefined;
    getVariantGeneratorSetting(name: string, key: string, path: string[]): OverrideValueType | undefined;
    getVariantRuleSetting(name: string, key: string, path: string[]): OverrideValueType | undefined;
    getVariantHexSetting(name: string, key: string, path: string[]): OverrideValueType | undefined;
    deleteVariantMapSetting(name: string, key: string, path: string[]): void;
    deleteVariantGeneratorSetting(name: string, key: string, path: string[]): void;
    deleteVariantRuleSetting(name: string, key: string, path: string[]): void;
    deleteVariantHexSetting(name: string, key: string, path: string[]): void;
    getMapVariantsForPath(path: string[]): {
        name: string;
        setting: string;
    }[];
    getGeneratorVariantsForPath(path: string[]): {
        name: string;
        setting: string;
    }[];
    getRuleVariantsForPath(path: string[]): {
        name: string;
        setting: string;
    }[];
    getHexVariantsForPath(path: string[]): {
        name: string;
        setting: string;
    }[];
    protected getVariantsForPath(path: string[], recordName: keyof MapVariantSetting): {
        name: string;
        setting: string;
    }[];
    getName(): string;
    protected setVariantSettingInternal(variantName: string, variantKey: string, recordName: keyof MapVariantSetting, path: string[], value: OverrideValueType): void;
    protected getVariantSettingInternal(variantName: string, variantKey: string, recordName: keyof MapVariantSetting, path: string[]): OverrideValueType | undefined;
    protected deleteVariantSettingInternal(variantName: string, variantKey: string, recordName: keyof MapVariantSetting, path: string[]): void;
    loadSettingsFromJson(json: string | object): void;
    loadSettingsFromJs(jsText: string): void;
    private static isOverrideValue;
    private static isVariantRecord;
    private static isVariantRecordArray;
    private iterateVariantLeaves;
}
