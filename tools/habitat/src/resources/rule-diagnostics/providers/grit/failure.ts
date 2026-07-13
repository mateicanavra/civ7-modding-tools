import {
  type DiagnosticProviderFailureKind,
  diagnosticProviderFailureDiagnostic,
} from "@habitat/cli/service/model/diagnostics/index";
import type { RuleRunResult } from "@habitat/cli/service/model/diagnostics/policy/rule-runtime/architecture.policy";
import type { RuleGritFacts } from "@habitat/cli/service/model/rules/index";

export function infrastructureFailure(
  rule: RuleGritFacts,
  failure: DiagnosticProviderFailureKind,
  detail = "Grit provider failed before producing rule findings."
): RuleRunResult {
  return {
    exitCode: 1,
    diagnostics: [diagnosticProviderFailureDiagnostic(rule, failure, detail)],
  };
}
