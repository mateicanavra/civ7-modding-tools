import { Diagram } from "/core/scripts/external/TypeScript-Voronoi-master/src/diagram.js";
import { MapSize, ParameterSpec, RuleConfigType, RuleConfigValueRecord } from "/base-standard/scripts/voronoi-types.js";
import { kdTree } from "/base-standard/scripts/kd-tree.js";
import { LandmassRegion, PlateRegion } from "/base-standard/scripts/voronoi-region.js";
import { RegionCell, WrapDistOptions, WrapType } from "/base-standard/scripts/voronoi-utils.js";
import { Rule } from "/base-standard/scripts/voronoi_rules/rules-base.js";
export declare enum GeneratorType {
    Continent = 0
}
export type MapGeneratorConstructor = new () => MapGenerator;
export interface RuleSetting {
    className: string;
    isActive: boolean;
    weight: number;
    record: object;
}
export type RulesSchema<T extends string> = Record<T, Record<string, Partial<RuleConfigType> & Pick<RuleConfigType, "className">>>;
export declare const ruleDefaults: {
    weight: number;
    isActive: boolean;
};
export declare function resolveRuleConfig(cfg: RulesSchema<string>): RuleConfigValueRecord;
export type GeneratorSchemaGroupChildren = {
    type: "configs";
    data: GeneratorSchema;
} | {
    type: "rules";
    data: [
        Rule,
        RuleSetting
    ][];
};
export declare abstract class GeneratorSchemaGroup {
    groupLabel: string;
    childCount?: number;
    children: GeneratorSchemaGroupChildren;
}
export type GeneratorSchema = Record<string, ParameterSpec | GeneratorSchemaGroup>;
export type GeneratorSettingGroup = Record<string, number | boolean>;
export interface GeneratorSettingRecord {
    [key: string]: number | string | boolean | GeneratorSettingRecord | GeneratorSettingRecord[] | GeneratorSettingGroup | GeneratorSettingGroup[] | undefined;
}
export declare abstract class MapGenerator {
    protected m_generatorSettings: GeneratorSettingRecord;
    protected m_regionCells: RegionCell[];
    protected m_diagram: Diagram;
    protected m_worldDims: float2;
    protected m_hexDims: float2;
    protected m_mapSizeType: MapSize;
    protected m_wrap: WrapType;
    protected m_kdTree: kdTree<RegionCell>;
    protected m_wrapDistOpts: WrapDistOptions;
    abstract getType(): GeneratorType;
    abstract getRules(): Readonly<Record<string, Record<string, Rule>>>;
    abstract getLandmasses(): readonly LandmassRegion[];
    abstract getPlates(): readonly PlateRegion[];
    abstract simulate(): void;
    abstract getSchema(): GeneratorSchema;
    init(worldDims: float2, diagram: Diagram, hexDims: float2, wrap?: WrapType): void;
    logSettings(): void;
    static buildDefaultSettings(nodes: GeneratorSchema): ConfigValueRecord;
    private initializeRules;
    getRegionCells(): readonly RegionCell[];
    getPlateCells(): readonly RegionCell[];
    getKdTree(): Readonly<kdTree<RegionCell>>;
    getSettings(): GeneratorSettingRecord;
    setSettings(generatorSettings: GeneratorSettingRecord): void;
    getDiagram(): Diagram;
    getPlatesDiagram(): Diagram;
}
