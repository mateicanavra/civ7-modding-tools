import {
  type DiagnosticProviderFailureKind,
  renderDiagnosticProviderFailure,
} from "@internal/habitat-harness/service/model/check/index";
import type { RuleRunResult } from "@internal/habitat-harness/service/model/check/policy/rule-runtime/architecture.policy";
import type { RuleSourceFacts } from "@internal/habitat-harness/service/model/rules/index";

export function infrastructureFailure(
  rule: RuleSourceFacts,
  failure: DiagnosticProviderFailureKind,
  detail = "Grit provider failed before producing rule findings."
): RuleRunResult {
  return {
    exitCode: 1,
    diagnostics: [
      {
        ruleId: rule.id,
        path: ".",
        message: `${rule.message}\n${renderDiagnosticProviderFailure(failure, detail)}`,
        severity: rule.lane === "advisory" ? "advisory" : "error",
        baselined: false,
      },
    ],
  };
}
