import type { RuleRunResult } from "../../rules/architecture.js";
import type { RuleGritFacts } from "../../rules/registry/index.js";
import {
  gritDiagnosticIdentity,
  observedGritDiagnosticIdentity,
  observedGritIdentityMatches,
  renderUnexpectedObservedGritIdentity,
} from "../../lib/diagnostic-catalog/index.js";
import { infrastructureFailure } from "./failure.js";
import { normalizeGritPath } from "./scan-roots/index.js";
import type { GritProjectionOptions, GritReport, GritResult } from "./types.js";

export function projectGritResults(
  selectedRules: readonly RuleGritFacts[],
  report: GritReport,
  options: GritProjectionOptions = {}
): Map<string, RuleRunResult> {
  const selectedPatterns = new Set(selectedRules.map((rule) => rule.gritPattern));
  const unexpected = report.results
    .map(observedGritDiagnosticIdentity)
    .find(
      (observed) =>
        observed?.kind === "observed-identity-mismatch" ||
        (options.rejectUnexpectedPatternIdentity &&
          observed?.kind === "observed-grit-pattern" &&
          !selectedPatterns.has(observed.observedPatternIdentity))
    );
  if (unexpected) {
    return new Map(
      selectedRules.map((rule) => [
        rule.id,
        infrastructureFailure(
          rule,
          "GritUnexpectedDiagnosticIdentity",
          renderUnexpectedObservedGritIdentity(unexpected)
        ),
      ])
    );
  }

  return new Map(
    selectedRules.map((rule) => {
      const pattern = rule.gritPattern;
      const diagnosticIdentity = gritDiagnosticIdentity(pattern);
      const diagnostics = report.results
        .filter((result) =>
          observedGritIdentityMatches(observedGritDiagnosticIdentity(result), diagnosticIdentity)
        )
        .map((result) => ({
          ruleId: rule.id,
          path: normalizeGritPath(result.path),
          line: result.start?.line,
          message: result.extra?.message ?? rule.message,
          severity: rule.lane === "advisory" ? ("advisory" as const) : ("error" as const),
          baselined: false,
        }));
      if (options.requirePatternFinding && diagnostics.length === 0) {
        return [
          rule.id,
          infrastructureFailure(
            rule,
            "GritPatternProjectionMiss",
            `Expected Grit pattern identity was not projected: ${pattern}.`
          ),
        ];
      }
      return [rule.id, { exitCode: diagnostics.length > 0 ? 1 : 0, diagnostics }];
    })
  );
}
