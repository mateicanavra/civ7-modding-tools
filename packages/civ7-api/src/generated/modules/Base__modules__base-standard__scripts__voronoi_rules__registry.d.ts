import { ParameterSpecRecord } from "/base-standard/scripts/voronoi-types.js";
import { Rule } from "/base-standard/scripts/voronoi_rules/rules-base.js";
export type RuleCtor<T extends Rule = Rule> = new () => T;
export declare function RegisterRule(name: string, ctor: RuleCtor, schema: ParameterSpecRecord): void;
export declare function ConstructRule(name: string): Rule;
export declare function GetRuleSpec(name: string): ParameterSpecRecord;
