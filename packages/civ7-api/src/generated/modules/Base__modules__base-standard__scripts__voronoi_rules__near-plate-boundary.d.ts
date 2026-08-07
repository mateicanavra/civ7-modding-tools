import { kdTree } from "/base-standard/scripts/kd-tree.js";
import { PlateBoundary, RegionCell } from "/base-standard/scripts/voronoi-utils.js";
import { Rule, ScoringContext } from "/base-standard/scripts/voronoi_rules/rules-base.js";
export declare class RuleNearPlateBoundary extends Rule {
    parameterSpecs: ParameterSpecRecord;
    configValues: any;
    name: string;
    description: string;
    private m_plateBoundaries;
    static getName(): string;
    static getSchema(): ParameterSpecRecord;
    init(plateBoundaries: kdTree<PlateBoundary>): void;
    prepare(): void;
    score(regionCell: RegionCell, _ctx: ScoringContext): number;
}
