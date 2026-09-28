import { BoundingBox } from "/core/scripts/external/TypeScript-Voronoi-master/src/bounding_box.js";
import { QuadTree } from "/base-standard/scripts/quadtree.js";
import { RegionCell, WrapType } from "/base-standard/scripts/voronoi-utils.js";
import { Rule, ScoringContext } from "/base-standard/scripts/voronoi_rules/rules-base.js";
export interface RegionIdPos {
    regionId: number;
    regionGroupId: number;
    pos: float2;
}
export declare class RuleNearOtherRegion extends Rule {
    parameterSpecs: ParameterSpecRecord;
    configValues: any;
    name: string;
    description: string;
    private regionConnection;
    private regionConnectionLive;
    private quadtree;
    static getName(): string;
    static getSchema(): ParameterSpecRecord;
    prepare(): void;
    score(regionCell: RegionCell, ctx: ScoringContext): number;
    buildFromDelaunayTriangulation(regions: RegionIdPos[], bounds: BoundingBox, wrap?: WrapType): void;
    addRegionConnection(from: number, to: RegionIdPos): void;
    setQuadTree(quadtree: QuadTree<RegionCell>): void;
}
