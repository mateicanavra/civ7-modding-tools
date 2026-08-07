import { RegionCell } from "/base-standard/scripts/voronoi-utils.js";
import { Rule, ScoringContext } from "/base-standard/scripts/voronoi_rules/rules-base.js";
export declare class RuleNeighborsInRegion extends Rule {
    parameterSpecs: ParameterSpecRecord;
    configValues: any;
    name: string;
    description: string;
    static getName(): string;
    static getSchema(): ParameterSpecRecord;
    inRegionCheck: (ctx: ScoringContext, _thisCell: RegionCell, neighborCell: RegionCell) => boolean;
    score(regionCell: RegionCell, ctx: ScoringContext): number;
}
