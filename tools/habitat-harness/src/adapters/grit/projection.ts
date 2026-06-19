import type { RuleRunResult } from "../../rules/architecture.js";
import type { RuleGritFacts } from "../../rules/registry/index.js";
import { infrastructureFailure } from "./failure.js";
import { normalizeGritPath } from "./scan-roots/index.js";
import type { GritProjectionOptions, GritReport, GritResult } from "./types.js";

export function projectGritResults(
  selectedRules: readonly RuleGritFacts[],
  report: GritReport,
  options: GritProjectionOptions = {}
): Map<string, RuleRunResult> {
  const selectedPatterns = new Set(selectedRules.map((rule) => rule.gritPattern));
  if (options.rejectUnexpectedPatternIdentity) {
    const unexpected = report.results
      .map(resultPatternIdentity)
      .find((identity): identity is string => Boolean(identity && !selectedPatterns.has(identity)));
    if (unexpected) {
      return new Map(
        selectedRules.map((rule) => [
          rule.id,
          infrastructureFailure(
            rule,
            "GritUnexpectedPatternIdentity",
            `Grit output included unexpected pattern identity: ${unexpected}.`
          ),
        ])
      );
    }
  }

  return new Map(
    selectedRules.map((rule) => {
      const pattern = rule.gritPattern;
      const diagnostics = report.results
        .filter((result) => matchesPattern(result, pattern))
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

function matchesPattern(result: GritResult, pattern: string): boolean {
  return result.local_name === pattern || result.check_id?.includes(`#${pattern}/`) === true;
}

function resultPatternIdentity(result: GritResult): string | undefined {
  if (result.local_name) return result.local_name;
  const match = result.check_id?.match(/#([^/]+)\//);
  return match?.[1];
}
