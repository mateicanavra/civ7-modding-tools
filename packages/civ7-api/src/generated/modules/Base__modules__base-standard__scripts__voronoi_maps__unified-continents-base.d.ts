import { LandmassSettings } from "/base-standard/scripts/voronoi_generators/continent-generator.js";
import { MapBaseSettings, MapSettingSchema, VoronoiMap } from "/base-standard/scripts/voronoi_maps/map-common.js";
export interface SectionSettings {
    totalLandmassSize: number;
    maxSizeVariance: number;
    landmassCount: number;
    landmassGroupCount: number;
    totalDistantSize: number;
    maxDistantSizeVariance: number;
    distantCount: number;
    groupBalancedMode: 0 | 1 | 2;
    minPlayersPerLandmassGroup: number;
    minLandmassSpawnCenterDistance: number;
    maxLandmassSpawnCenterDistance: number;
    minDistantSpawnCenterDistance: number;
    maxDistantSpawnCenterDistance: number;
}
export interface UnifiedContinentsBaseSettings extends MapBaseSettings, SectionSettings {
}
export declare const unifiedSectionSchema: MapSettingSchema;
export declare const unifiedContinentsSchema: MapSettingSchema;
export interface LandmassSection {
    startAngle: number;
    sweepAngle: number;
    landmassCount: number;
    distantCount: number;
    groupCount: number;
    totalLandmassSize: number;
    maxSizeVariance: number;
    totalDistantSize: number;
    maxDistantSizeVariance: number;
    landmassSpawnDistance: {
        min: number;
        max: number;
    };
    distantSpawnDistance: {
        min: number;
        max: number;
    };
    groupBalancedMode: 0 | 1 | 2;
    minPlayersPerLandmassGroup: number;
    ruleSetKey?: string;
    landmassDefaults: LandmassSettings;
}
export interface SectionPosition {
    x: number;
    y: number;
    size: number;
    groupId: number;
    pinned: boolean;
    ruleSetKey?: string;
}
interface SectionContext {
    groupOffset: number;
    totalGroupCount: number;
    runningLandmassCount: number;
    runningDistantCount: number;
    runningGroupCount: number;
}
export declare abstract class UnifiedContinentsBase<T extends UnifiedContinentsBaseSettings = UnifiedContinentsBaseSettings> extends VoronoiMap<T> {
    constructor(customSchema?: MapSettingSchema, defaultMapSettings?: object, landmassRuleSetNames?: readonly string[]);
    protected buildSection(settings: SectionSettings, startAngle: number, sweepAngle: number, landmassDefaults: LandmassSettings, ruleSetKey?: string): LandmassSection;
    placeDefaultSection(settings: SectionSettings): void;
    placeSections(sections: LandmassSection[]): void;
    placeSection(section: LandmassSection, context: SectionContext): SectionPosition[];
    getSettingsConfig(): MapSettingSchema;
}
export {};
