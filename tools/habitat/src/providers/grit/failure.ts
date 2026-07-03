import {
  type DiagnosticProviderFailureKind,
  renderDiagnosticProviderFailure,
} from "@habitat/cli/service/model/diagnostics/index";
import type { RuleRunResult } from "@habitat/cli/service/model/diagnostics/policy/rule-runtime/architecture.policy";
import type { RuleSourceFacts } from "@habitat/cli/service/model/rules/index";

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
