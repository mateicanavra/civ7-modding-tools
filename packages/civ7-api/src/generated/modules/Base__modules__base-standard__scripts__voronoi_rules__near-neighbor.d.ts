import { RegionCell } from "/base-standard/scripts/voronoi-utils.js";
import { Rule, ScoringContext } from "/base-standard/scripts/voronoi_rules/rules-base.js";
export declare class RuleNearNeighbor extends Rule {
    parameterSpecs: ParameterSpecRecord;
    configValues: any;
    name: string;
    description: string;
    private m_diff;
    private m_invBias;
    static getName(): string;
    static getSchema(): ParameterSpecRecord;
    prepare(): void;
    score(regionCell: RegionCell, ctx: ScoringContext): number;
}
