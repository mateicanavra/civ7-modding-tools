import type { RuleRunResult } from "../../rules/architecture.js";
import type { RuleGritFacts } from "../../rules/registry/index.js";
import {
  type DiagnosticAdapterFailureKind,
  renderDiagnosticAdapterFailure,
} from "../../lib/diagnostic-catalog/index.js";

export function infrastructureFailure(
  rule: RuleGritFacts,
  failureTag: DiagnosticAdapterFailureKind,
  detail = "Grit adapter failed before producing rule findings."
): RuleRunResult {
  return {
    exitCode: 1,
    diagnostics: [
      {
        ruleId: rule.id,
        path: ".",
        message: `${rule.message}\n${renderDiagnosticAdapterFailure(failureTag, detail)}`,
        severity: rule.lane === "advisory" ? "advisory" : "error",
        baselined: false,
      },
    ],
  };
}
