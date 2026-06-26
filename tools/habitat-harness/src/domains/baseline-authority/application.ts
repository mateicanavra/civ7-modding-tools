import type { HabitatDiagnostic } from "../structural-check/schema.js";
import {
  type BaselineApplicationResult,
  type BaselineAuthorityState,
  type BaselineRefusal,
} from "./schema.js";
import { sameStringList } from "./utils.js";

export function violationKey(diagnostic: HabitatDiagnostic): string {
  return `${diagnostic.path}::${diagnostic.message}`;
}

export function applyBaseline(
  diagnostics: HabitatDiagnostic[],
  baseline: Set<string> | BaselineAuthorityState
): BaselineApplicationResult {
  if (baseline instanceof Set) {
    return coverDiagnostics(diagnostics, baseline);
  }
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

  return coverDiagnostics(diagnostics, new Set(baseline.keys));
}

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

function coverDiagnostics(
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
