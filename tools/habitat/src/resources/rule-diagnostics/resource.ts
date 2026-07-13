import type {
  DiagnosticProviderFailureKind,
  DiagnosticScanRootRefusal,
  HabitatDiagnostic,
} from "@habitat/cli/service/model/diagnostics/index";
import type { RuleRunResult } from "@habitat/cli/service/model/diagnostics/policy/rule-runtime/architecture.policy";
import { Context, type Effect } from "effect";

export type RuleDiagnosticDemand = {
  readonly ruleIds: readonly [string, ...string[]];
  readonly scope:
    | { readonly kind: "authored" }
    | { readonly kind: "paths"; readonly paths: readonly string[] };
};

export type RuleDiagnosticExecutionResult =
  | {
      readonly kind: "executed";
      readonly result: RuleRunResult;
      readonly durationMs: number;
    }
  | {
      readonly kind: "not-applicable";
      readonly reason: "no-matched-scan-roots";
      readonly durationMs: number;
    }
  | {
      readonly kind: "failed";
      readonly failure: DiagnosticProviderFailureKind;
      readonly detail: string;
      readonly diagnostics: readonly [HabitatDiagnostic, ...HabitatDiagnostic[]];
      readonly durationMs: number;
    }
  | {
      readonly kind: "refused";
      readonly decision: DiagnosticScanRootRefusal;
      readonly detail: string;
      readonly durationMs: number;
    };

/** Stable diagnostic capability consumed by rule execution. */
export interface RuleDiagnosticsService {
  readonly runRules: (
    demand: RuleDiagnosticDemand
  ) => Effect.Effect<ReadonlyMap<string, RuleDiagnosticExecutionResult>, never>;
}

export class RuleDiagnostics extends Context.Tag("@habitat/cli/RuleDiagnostics")<
  RuleDiagnostics,
  RuleDiagnosticsService
>() {}
