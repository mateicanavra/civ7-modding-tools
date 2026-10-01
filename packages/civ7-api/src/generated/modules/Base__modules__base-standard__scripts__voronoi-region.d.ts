import { QuadTree } from "/base-standard/scripts/quadtree.js";
import { RegionType } from "/base-standard/scripts/voronoi-types.js";
import { RegionCell, WrapDistOptions } from "/base-standard/scripts/voronoi-utils.js";
import { Rule, ScoringContext } from "/base-standard/scripts/voronoi_rules/rules-base.js";
declare class IdScorePair {
    id: number;
    score: number;
}
export declare abstract class VoronoiRegion {
    name: string;
    id: number;
    groupId: number;
    type: RegionType;
    maxArea: number;
    playerAreas: number;
    color: float3;
    seedLocation: float2;
    considerationList: IdScorePair[];
    cellCount: number;
    latestAddedCell: RegionCell | null;
    minOrder: number;
    private scoringContext;
    private quadTree;
    constructor(name: string, id: number, groupId: number, type: RegionType, maxArea: number, playerAreas: number);
    abstract setRegionIdForCell(cell: RegionCell, id: number, scoringContext: ScoringContext): void;
    abstract getRegionIdForCell(cell: RegionCell): number;
    abstract isCellClaimed(cell: RegionCell): boolean;
    prepareGrowth(regionCells: RegionCell[], regions: VoronoiRegion[], rules: Record<string, Rule>, worldDims: float2, plateRegions: PlateRegion[], wrap: WrapDistOptions): void;
    growStep(): boolean;
    logStats(): void;
    private scoreCell;
    scoreSingleCell(regionCell: RegionCell): number;
    SetQuadTree(quadtree: QuadTree<RegionCell>): void;
}
export declare class LandmassRegion extends VoronoiRegion {
    setRegionIdForCell(cell: RegionCell, id: number, scoringContext: ScoringContext): void;
    getRegionIdForCell(cell: RegionCell): number;
    isCellClaimed(cell: RegionCell): boolean;
}
export declare class PlateRegion extends VoronoiRegion {
    m_movement: float2;
    m_rotation: number;
    constructor(name: string, id: number, type: RegionType, maxArea: number);
    setRegionIdForCell(cell: RegionCell, id: number, scoringContext: ScoringContext): void;
    getRegionIdForCell(cell: RegionCell): number;
    isCellClaimed(cell: RegionCell): boolean;
}
export {};
