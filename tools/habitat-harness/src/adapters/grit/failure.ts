import type { RuleRunResult } from "../../rules/architecture.js";
import type { RuleGritFacts } from "../../rules/registry/index.js";
import { renderGritAdapterFailure } from "../../lib/grit-failures.js";
import type { GritAdapterFailureTag } from "../../lib/habitat-process.js";

export function infrastructureFailure(
  rule: RuleGritFacts,
  failureTag: GritAdapterFailureTag,
  detail = "Grit adapter failed before producing rule findings."
): RuleRunResult {
  return {
    exitCode: 1,
    diagnostics: [
      {
        ruleId: rule.id,
        path: ".",
        message: `${rule.message}\n${renderGritAdapterFailure(failureTag, detail)}`,
        severity: rule.lane === "advisory" ? "advisory" : "error",
        baselined: false,
      },
    ],
  };
}
