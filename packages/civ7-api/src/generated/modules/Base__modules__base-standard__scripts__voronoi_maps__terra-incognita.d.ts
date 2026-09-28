import { SectionType, VoronoiShuffle } from "/base-standard/scripts/voronoi_maps/shuffle.js";
export declare class VoronoiTerraIncognita extends VoronoiShuffle {
    constructor();
    simulateInternal(): void;
    protected getSectionWeights(): number[];
    protected getSectionTypes(count: number): SectionType[];
    simulate(): void;
    getContinentPlayerRegionId(): number;
    static getName(): string;
}
