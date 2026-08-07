import { MapBaseSettings, MapSettingSchema, VoronoiMap } from "/base-standard/scripts/voronoi_maps/map-common.js";
export interface UnifiedContinentsBaseSettings extends MapBaseSettings {
    totalLandmassSize: number;
    maxSizeVariance: number;
    landmassCount: number;
    landmassGroupCount: number;
    totalDistantSize: number;
    maxDistantSizeVariance: number;
    distantCount: number;
    groupBalancedMode: number;
    minPlayersPerLandmassGroup: number;
    minLandmassSpawnCenterDistance: number;
    maxLandmassSpawnCenterDistance: number;
    minDistantSpawnCenterDistance: number;
    maxDistantSpawnCenterDistance: number;
    enforceGroupConstraints: number;
}
export declare const unifiedContinentsSchema: any;
export declare abstract class UnifiedContinentsBase<T extends UnifiedContinentsBaseSettings = UnifiedContinentsBaseSettings> extends VoronoiMap<T> {
    constructor(customSchema?: MapSettingSchema, defaultMapSettings?: object);
    simulateInternal(): void;
    applySettings(): void;
    getSettingsConfig(): MapSettingSchema;
}
