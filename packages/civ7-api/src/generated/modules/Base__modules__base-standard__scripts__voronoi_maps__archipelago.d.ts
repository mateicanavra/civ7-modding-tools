import { VoronoiValidationSettings } from "/base-standard/scripts/hex-map.js";
import { RegionCell } from "/base-standard/scripts/voronoi-utils.js";
import { UnifiedContinentsBase, UnifiedContinentsBaseSettings } from "/base-standard/scripts/voronoi_maps/unified-continents-base.js";
export interface VoronoiArchipelagoSettings extends UnifiedContinentsBaseSettings {
    minLandmassSeeds: number;
    landmassSeedVariance: number;
    minDistantSeeds: number;
    maxDistantSeeds: number;
}
export declare class VoronoiArchipelago extends UnifiedContinentsBase<VoronoiArchipelagoSettings> {
    constructor();
    init(hexDims: float2): void;
    simulateInternal(): void;
    protected getVoronoiValidationSettings(): VoronoiValidationSettings;
    protected getPlayerLandmassFromCell(cell: RegionCell): number;
    static getName(): string;
    getFilename(): string;
}
