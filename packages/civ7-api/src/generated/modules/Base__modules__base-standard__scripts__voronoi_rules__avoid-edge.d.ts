import { RegionCell } from "/base-standard/scripts/voronoi-utils.js";
import { Rule, ScoringContext } from "/base-standard/scripts/voronoi_rules/rules-base.js";
export declare class RuleAvoidEdge extends Rule {
    parameterSpecs: ParameterSpecRecord;
    configValues: any;
    name: string;
    description: string;
    private randomOffsetTop;
    private randomOffsetBottom;
    static getName(): string;
    static getSchema(): ParameterSpecRecord;
    prepare(): void;
    score(regionCell: RegionCell, ctx: ScoringContext): number;
}
