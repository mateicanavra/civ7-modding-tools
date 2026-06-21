import {
  type DiagnosticAdapterFailureKind,
  renderDiagnosticAdapterFailure,
} from "@internal/habitat-harness/core/domains/diagnostic-pattern-catalog/index";
import type { RuleSourceFacts } from "@internal/habitat-harness/core/domains/rule-registry/index";
import type { RuleRunResult } from "@internal/habitat-harness/core/rules/architecture";

export function infrastructureFailure(
  rule: RuleSourceFacts,
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
