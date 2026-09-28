import { VoronoiValidationSettings } from "/base-standard/scripts/hex-map.js";
import { RegionCell } from "/base-standard/scripts/voronoi-utils.js";
import { SectionSettings, UnifiedContinentsBase, UnifiedContinentsBaseSettings } from "/base-standard/scripts/voronoi_maps/unified-continents-base.js";
export interface VoronoiFractalSettings extends UnifiedContinentsBaseSettings {
    minLandmassSeeds: number;
    maxLandmassSeeds: number;
    minDistantSeeds: number;
    maxDistantSeeds: number;
    landmassSeedSizeFactor: number;
    forceAtLeastTwo: number;
    forceAtLeastThree: number;
}
export declare const fractalMapSchema: MapSettingSchema;
export declare function buildFractalSettings(source: VoronoiFractalSettings, hexDims: float2): SectionSettings;
export declare class VoronoiFractal extends UnifiedContinentsBase<VoronoiFractalSettings> {
    constructor();
    init(hexDims: float2): void;
    simulateInternal(): void;
    protected getVoronoiValidationSettings(): VoronoiValidationSettings;
    protected getPlayerLandmassFromCell(cell: RegionCell): number;
    static getName(): string;
    getFilename(): string;
}
