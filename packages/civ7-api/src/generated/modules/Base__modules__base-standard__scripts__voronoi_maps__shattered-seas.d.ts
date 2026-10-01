import { HexTile, VoronoiValidationSettings } from "/base-standard/scripts/hex-map.js";
import { UnifiedContinentsBase, UnifiedContinentsBaseSettings } from "/base-standard/scripts/voronoi_maps/unified-continents-base.js";
export interface VoronoiShatteredSeasSettings extends UnifiedContinentsBaseSettings {
    landmassFactor: number;
    distantFactor: number;
}
export declare class VoronoiShatteredSeas extends UnifiedContinentsBase<VoronoiShatteredSeasSettings> {
    constructor();
    init(hexDims: float2): void;
    simulateInternal(): void;
    protected getVoronoiValidationSettings(): VoronoiValidationSettings;
    /**
     * Creates major player areas by assigning players to landmasses in a round-robin fashion.
     *
     * Landmasses are sorted by size (largest first) and players are distributed across them.
     * Player area IDs are adjusted based on landmass offsets, and landmass IDs are normalized
     * (set to 1 for non-island continents, 0 otherwise).
     *
     * @param valueFunction - Optional function to evaluate tile values for area assignment
     * @remarks
     * - All landmasses should be close in size for balanced distribution
     * - The map is treated as a "pangaea" where player regions span across landmasses
     * - Non-island regions in group 0 have their landmassId set to 1, others to 0
     */
    createMajorPlayerAreas(valueFunction?: (tile: HexTile) => number): void;
    static getName(): string;
    getFilename(): string;
}
