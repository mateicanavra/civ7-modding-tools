import type { HabitatDiagnostic } from "@habitat/cli/service/model/check/index";
import {
  type BaselineApplicationResult,
  type BaselineAuthorityState,
  type BaselineOccurrence,
  type BaselineRefusal,
} from "./dto/baseline.schema.js";
import { sameStringList } from "./utils.policy.js";

/** Returns the stable path-and-message identity used by Habitat baseline authority. */
export function violationKey(diagnostic: HabitatDiagnostic): string {
  return `${diagnostic.path}::${diagnostic.message}`;
}

/**
 * Applies explicit baseline authority to diagnostics in place.
 *
 * Legacy key coverage admits every matching diagnostic, while occurrence
 * coverage spends one admitted count per matching diagnostic.
 */
export function applyBaseline(
  diagnostics: HabitatDiagnostic[],
  baseline: BaselineAuthorityState
): BaselineApplicationResult {
  if (baseline.kind === "baseline-refusal") {
    return { status: "refused", diagnosticsCovered: 0, refusals: [baseline] };
  }

  const preBaselinedKeys = diagnostics
    .filter((diagnostic) => diagnostic.baselined)
    .map(violationKey)
    .sort();

  if (preBaselinedKeys.length > 0) {
    return {
      status: "refused",
      diagnosticsCovered: 0,
      refusals: [
        {
          kind: "baseline-refusal",
          ruleId: baseline.ruleId,
          path: baseline.path,
          reason: "parser-owned-baseline-without-contract",
          message:
            `Rule '${baseline.ruleId}' reported parser-owned baselined diagnostics while using ` +
            "explicit Habitat baseline state; parser output must not bypass the baseline contract.",
        },
      ],
    };
  }

  return baseline.kind === "explicit-debt" && baseline.coverage === "occurrence"
    ? coverDiagnosticOccurrences(diagnostics, baseline.occurrences)
    : coverDiagnosticsByKey(
        diagnostics,
        new Set(baseline.kind === "explicit-debt" ? baseline.occurrences.map(({ key }) => key) : [])
      );
}

/** Projects a typed baseline refusal into the check report's diagnostic channel. */
export function baselineFailureDiagnostic(
  ruleId: string,
  refusal: BaselineRefusal
): HabitatDiagnostic {
  return {
    ruleId,
    path: refusal.path ?? ".",
    message: `Baseline contract failure (${refusal.reason}): ${refusal.message}`,
    severity: "error",
    baselined: false,
  };
}

function coverDiagnosticsByKey(
  diagnostics: HabitatDiagnostic[],
  keys: Set<string>
): BaselineApplicationResult {
  let diagnosticsCovered = 0;
  for (const diagnostic of diagnostics) {
    if (keys.has(violationKey(diagnostic))) {
      diagnostic.baselined = true;
      diagnosticsCovered += 1;
    }
  }
  return { status: "applied", diagnosticsCovered, refusals: [] };
}

function coverDiagnosticOccurrences(
  diagnostics: HabitatDiagnostic[],
  occurrences: readonly BaselineOccurrence[]
): BaselineApplicationResult {
  const remaining = new Map(occurrences.map(({ key, count }) => [key, count]));

  let diagnosticsCovered = 0;
  for (const diagnostic of diagnostics) {
    const key = violationKey(diagnostic);
    const available = remaining.get(key) ?? 0;
    if (available === 0) continue;
    diagnostic.baselined = true;
    diagnosticsCovered += 1;
    if (available === 1) remaining.delete(key);
    else remaining.set(key, available - 1);
  }
  return { status: "applied", diagnosticsCovered, refusals: [] };
}
