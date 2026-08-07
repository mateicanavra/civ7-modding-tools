import { VoronoiMap } from "/base-standard/scripts/voronoi_maps/map-common.js";
export declare class VoronoiPangaea extends VoronoiMap {
    constructor();
    static getName(): string;
    init(hexDims: float2): void;
    simulateInternal(): void;
    getFilename(): string;
}
