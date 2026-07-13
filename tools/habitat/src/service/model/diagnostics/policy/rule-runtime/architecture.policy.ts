import type { SpawnResult } from "@habitat/cli/resources/command/index";
import type {
  DiagnosticProviderFailureKind,
  DiagnosticScanRootRefusal,
  HabitatDiagnostic,
} from "@habitat/cli/service/model/diagnostics/index";
import type {
  RuleCommandExecutionFacts,
  RuleGraphFacts,
} from "@habitat/cli/service/model/rules/index";

/**
 * The rule pack is authored in .habitat and consumed through the registry
 * schema boundary. This module supplies per-rule output parsers.
 */

type CommandResultRuleFacts = Pick<
  RuleCommandExecutionFacts | RuleGraphFacts,
  "id" | "lane" | "message"
>;

function coarse(rule: CommandResultRuleFacts, res: SpawnResult): HabitatDiagnostic[] {
  if (res.exitCode === 0) return [];
  const tail = (res.stdout + res.stderr).trim().split("\n").slice(-12).join("\n");
  return [
    {
      ruleId: rule.id,
      path: ".",
      message: `${rule.message}\n--- tool output (tail) ---\n${tail}`,
      severity: rule.lane === "advisory" ? "advisory" : "error",
      baselined: false,
    },
  ];
}

export interface RuleRunResult {
  exitCode: number;
  diagnostics: HabitatDiagnostic[];
}

export interface RuleDiagnosticExecutionResult {
  readonly result: RuleRunResult;
  readonly durationMs: number;
  readonly disposition:
    | { readonly kind: "executed" }
    | { readonly kind: "not-applicable"; readonly reason: "no-matched-scan-roots" }
    | {
        readonly kind: "failed";
        readonly failure: DiagnosticProviderFailureKind;
        readonly detail: string;
      }
    | {
        readonly kind: "refused";
        readonly decision: DiagnosticScanRootRefusal;
        readonly detail: string;
      };
}

export function ruleDiagnosticsFromCommandResult(
  rule: CommandResultRuleFacts,
  res: SpawnResult
): HabitatDiagnostic[] {
  return coarse(rule, res);
}
