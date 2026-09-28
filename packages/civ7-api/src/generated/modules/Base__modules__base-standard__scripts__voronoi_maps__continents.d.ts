import { SectionSettings, UnifiedContinentsBase, UnifiedContinentsBaseSettings } from "/base-standard/scripts/voronoi_maps/unified-continents-base.js";
export type VoronoiContinentsSettings = UnifiedContinentsBaseSettings;
export declare function buildContinentsSettings<T extends SectionSettings>(source: T): T;
export declare class VoronoiContinents extends UnifiedContinentsBase<VoronoiContinentsSettings> {
    constructor();
    static getName(): string;
    init(hexDims: float2): void;
    simulateInternal(): void;
    getFilename(): string;
}
