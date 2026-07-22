import type {
  DiagnosticProviderFailureKind,
  DiagnosticScanRootRefusal,
  HabitatDiagnostic,
} from "@habitat/cli/service/model/diagnostics/index";
import type { RuleRunResult } from "@habitat/cli/service/model/diagnostics/policy/rule-runtime/architecture.policy";
import { Context, Effect } from "effect";

export type RuleDiagnosticDemand = {
  readonly ruleIds: readonly [string, ...string[]];
  readonly scope:
    | { readonly kind: "authored" }
    | { readonly kind: "paths"; readonly paths: readonly string[] };
};

/** Provider-neutral evidence that several demanded rules shared one diagnostic execution. */
export type RuleDiagnosticExecutionTiming = Readonly<{
  kind: "shared";
  groupId: string;
  durationMs: number;
  ruleCount: number;
}>;

interface RuleDiagnosticExecutionMeasurement {
  readonly durationMs: number;
  readonly timing?: RuleDiagnosticExecutionTiming;
}

/** One terminal diagnostic disposition plus truthful dedicated or shared timing evidence. */
export type RuleDiagnosticExecutionResult = RuleDiagnosticExecutionMeasurement &
  (
    | {
        readonly kind: "executed";
        readonly result: RuleRunResult;
      }
    | {
        readonly kind: "not-applicable";
        readonly reason: "no-matched-scan-roots";
      }
    | {
        readonly kind: "failed";
        readonly failure: DiagnosticProviderFailureKind;
        readonly detail: string;
        readonly diagnostics: readonly [HabitatDiagnostic, ...HabitatDiagnostic[]];
      }
    | {
        readonly kind: "refused";
        readonly decision: DiagnosticScanRootRefusal;
        readonly detail: string;
      }
  );

/** Stable diagnostic capability consumed by rule execution. */
export interface RuleDiagnosticsService {
  readonly runRules: (demand: RuleDiagnosticDemand) => typeof emptyRuleDiagnosticExecutionResults;
}

const emptyRuleDiagnosticExecutionResults = Effect.succeed(
  new Map<string, RuleDiagnosticExecutionResult>()
);

export class RuleDiagnostics extends Context.Tag("@habitat/cli/RuleDiagnostics")<
  RuleDiagnostics,
  RuleDiagnosticsService
>() {}
