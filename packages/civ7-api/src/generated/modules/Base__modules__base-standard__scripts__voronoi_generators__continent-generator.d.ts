import { Diagram } from "/core/scripts/external/TypeScript-Voronoi-master/src/diagram.js";
import { ConfigValueRecord, RuleConfigValueRecord } from "/base-standard/scripts/voronoi-types.js";
import { LandmassRegion } from "/base-standard/scripts/voronoi-region.js";
import { RegionCell } from "/base-standard/scripts/voronoi-utils.js";
import { GeneratorSchema, GeneratorSettingRecord, GeneratorType, MapGenerator } from "/base-standard/scripts/voronoi_generators/map-generator.js";
import { Rule } from "/base-standard/scripts/voronoi_rules/rules-base.js";
interface PlateSettings extends GeneratorSettingRecord {
    factor: number;
    curvePower: number;
    linearStrength: number;
    useUniqueVoronoi: boolean;
    voronoiCellRatio: number;
    plateRotationMultiple: number;
}
interface LandmassSettings extends GeneratorSettingRecord {
    enabled: boolean;
    groupId: number;
    size: number;
    variance: number;
    xPos: number;
    yPos: number;
    erosionPercent: number;
    erosionTime: number;
    erosionRandomness: number;
    playerAreas: number;
    coastalIslands: number;
    coastalIslandsMinDistance: number;
    coastalIslandsMaxDistance: number;
    coastalIslandsSize: number;
    coastalIslandsSizeVariance: number;
}
interface IslandSettings extends GeneratorSettingRecord {
    factor: number;
    minSize: number;
    maxSize: number;
    totalSize: number;
    variance: number;
    poleDistance: number;
    meridianDistance: number;
    landmassDistance: number;
    islandDistance: number;
    erosionPercent: number;
    erosionTime: number;
    erosionRandomness: number;
}
interface MountainSettings extends GeneratorSettingRecord {
    percent: number;
    variance: number;
    randomize: number;
}
interface VolcanoSettings extends GeneratorSettingRecord {
    percent: number;
    variance: number;
    randomize: number;
}
export interface ContinentGeneratorSettings extends GeneratorSettingRecord {
    plate: PlateSettings;
    landmass: LandmassSettings[];
    island: IslandSettings;
    mountain: MountainSettings;
    volcano: VolcanoSettings;
}
type ContinentRuleCategories = "Plates" | "Landmasses" | "Coastal Islands" | "Islands" | "Erosion" | "Mountains" | "Volcanoes" | "Elevation";
export declare const continentGeneratorSchema: GeneratorSchema;
export declare const continentGeneratorRulesSettings: RulesSchema<ContinentRuleCategories>;
export declare class ContinentGenerator extends MapGenerator {
    private m_generatorSettingsSchema;
    private m_ruleSettings;
    private m_plateRegions;
    private m_landmassRegions;
    private m_plateBoundaries;
    private m_platesDiagram;
    private m_plateCells;
    protected m_rules: Record<ContinentRuleCategories, Record<string, Rule>>;
    constructor(generatorSchema: typeof continentGeneratorSchema, rulesSettings: typeof continentGeneratorRulesSettings);
    getDefaultGeneratorSettings(): ConfigValueRecord;
    getDefaultRuleSettings(): RuleConfigValueRecord;
    getSchema(): GeneratorSchema;
    private constructRules;
    getType(): GeneratorType;
    getTypedSettings(): ContinentGeneratorSettings;
    getRules(): Readonly<Record<ContinentRuleCategories, Record<string, Rule>>>;
    getLandmassRegions(): readonly LandmassRegion[];
    simulate(): void;
    private clearTempCellData;
    private choosePlateToGrow;
    private growPlates;
    private growLandmasses;
    private growIslands;
    private growCoastalIslands;
    private forcePoles;
    private markLandAndOcean;
    private removeLakes;
    private addCoasts;
    private addMountains;
    calculateElevation(): void;
    private buildLandmassRegions;
    getLandmasses(): LandmassRegion[];
    getPlates(): PlateRegion[];
    getPlateCells(): readonly RegionCell[];
    getPlatesDiagram(): Diagram;
    private getUsableArea;
}
export {};
