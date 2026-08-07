import { MapBaseSettings, MapSettingSchema, VoronoiMap } from "/base-standard/scripts/voronoi_maps/map-common.js";
export interface VoronoiContinentsSettings extends MapBaseSettings {
    totalLandmassSize: number;
    minLandmassSize: number;
}
export declare const continentsSchema: any;
export declare class VoronoiContinents extends VoronoiMap<VoronoiContinentsSettings> {
    private applyState;
    constructor();
    static getName(): string;
    init(hexDims: float2): void;
    applySettings(): void;
    simulateInternal(): void;
    getSettingsConfig(): MapSettingSchema;
    getFilename(): string;
}
