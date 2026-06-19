import {
  type DiagnosticAdapterFailureKind,
  renderDiagnosticAdapterFailure,
} from "../../lib/diagnostic-catalog/index.js";
import type { RuleRunResult } from "../../rules/architecture.js";
import type { RulePatternFacts } from "../../rules/registry/index.js";

export function infrastructureFailure(
  rule: RulePatternFacts,
  failure: DiagnosticAdapterFailureKind,
  detail = "Grit adapter failed before producing rule findings."
): RuleRunResult {
  return {
    exitCode: 1,
    diagnostics: [
      {
        ruleId: rule.id,
        path: ".",
        message: `${rule.message}\n${renderDiagnosticAdapterFailure(failure, detail)}`,
        severity: rule.lane === "advisory" ? "advisory" : "error",
        baselined: false,
      },
    ],
  };
}
