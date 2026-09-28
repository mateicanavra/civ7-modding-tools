import { QuadTree } from "/base-standard/scripts/quadtree.js";
import { RegionCell } from "/base-standard/scripts/voronoi-utils.js";
import { Rule, ScoringContext } from "/base-standard/scripts/voronoi_rules/rules-base.js";
export declare class RuleAvoidOtherRegions extends Rule {
    parameterSpecs: ParameterSpecRecord;
    configValues: any;
    name: string;
    description: string;
    private quadtree;
    private m_minDistance;
    private m_maxDistance;
    private m_minDistanceSq;
    private m_maxDistanceSq;
    private m_filter;
    prepare(): void;
    static getName(): string;
    static getSchema(): ParameterSpecRecord;
    setFilter(filter: (ctx: ScoringContext, item: RegionCell) => boolean): void;
    score(regionCell: RegionCell, ctx: ScoringContext): number;
    setQuadTree(quadtree: QuadTree<RegionCell>): void;
}
