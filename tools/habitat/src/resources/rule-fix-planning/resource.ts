import type {
  DiagnosticProviderFailureKind,
  DiagnosticScanRootRefusal,
} from "@habitat/cli/service/model/diagnostics/index";
import { Context, type Effect } from "effect";

export interface RuleFixPlanningDemand {
  readonly ruleIds?: readonly [string, ...string[]];
}

export type RuleFixPlanningRuleResult =
  | {
      readonly kind: "observed";
      readonly ruleId: string;
      readonly affectedPaths: readonly string[];
    }
  | {
      readonly kind: "not-applicable";
      readonly ruleId: string;
      readonly reason: "no-matched-scan-roots";
    }
  | {
      readonly kind: "provider-failed";
      readonly ruleId: string;
      readonly failure: DiagnosticProviderFailureKind;
      readonly detail: string;
    }
  | {
      readonly kind: "scope-refused";
      readonly ruleId: string;
      readonly decision: DiagnosticScanRootRefusal;
      readonly detail: string;
    };

export type RuleFixPlanningResult =
  | {
      readonly kind: "selection-refused";
      readonly unknownRuleIds: readonly string[];
      readonly unadmittedRuleIds: readonly string[];
    }
  | {
      readonly kind: "completed";
      readonly results: readonly RuleFixPlanningRuleResult[];
    };

type RuleFixPlanningEffect = ReturnType<typeof Effect.succeed<RuleFixPlanningResult>>;

/** Plans only explicitly admitted rule transformations and never writes source files. */
export interface RuleFixPlanningService {
  readonly plan: (demand: RuleFixPlanningDemand) => RuleFixPlanningEffect;
}

export class RuleFixPlanning extends Context.Tag("@habitat/cli/RuleFixPlanning")<
  RuleFixPlanning,
  RuleFixPlanningService
>() {}
