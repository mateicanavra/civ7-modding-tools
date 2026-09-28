import { RegionCell } from "/base-standard/scripts/voronoi-utils.js";
import { Rule, ScoringContext } from "/base-standard/scripts/voronoi_rules/rules-base.js";
export declare class RuleCellArea extends Rule {
    parameterSpecs: ParameterSpecRecord;
    configValues: any;
    name: string;
    description: string;
    isStatic: boolean;
    private m_diff;
    private m_invBias;
    static getName(): string;
    static getSchema(): ParameterSpecRecord;
    prepare(): void;
    score(cell: RegionCell, _ctx: ScoringContext): number;
}
