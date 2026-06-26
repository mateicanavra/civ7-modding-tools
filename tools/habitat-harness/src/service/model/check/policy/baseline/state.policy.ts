import { errorMessage } from "./context.policy.js";
import {
  type BaselineAuthorityResult,
  type BaselineAuthorityState,
  type BaselineRefusal,
  parseBaselineKeys,
} from "./schema.js";
import { sameStringList } from "./utils.policy.js";

export function baselineAuthorityResult(state: BaselineAuthorityState): BaselineAuthorityResult {
  return state.kind === "baseline-refusal"
    ? { status: "refused", refusal: state }
    : { status: "accepted", state };
}

export function isBaselineLocked(state: BaselineAuthorityState): boolean {
  return state.kind === "explicit-empty";
}

export function parseBaselineArray(
  value: unknown,
  filePath: string,
  ruleId: string
): { ok: true; keys: string[] } | { ok: false; refusal: BaselineRefusal } {
  if (Array.isArray(value)) {
    const nonStringIndex = value.findIndex((entry) => typeof entry !== "string");
    if (nonStringIndex >= 0) {
      return {
        ok: false,
        refusal: {
          kind: "baseline-refusal",
          ruleId,
          path: filePath,
          reason: "non-string-baseline-key",
          message: `Baseline '${filePath}' contains a non-string entry at index ${nonStringIndex}.`,
        },
      };
    }
  }
  let keys: string[];
  try {
    keys = parseBaselineKeys(value);
  } catch (error) {
    return {
      ok: false,
      refusal: {
        kind: "baseline-refusal",
        ruleId,
        path: filePath,
        reason: "malformed-baseline",
        message: `Baseline '${filePath}' must be a JSON array of strings: ${errorMessage(error)}.`,
      },
    };
  }

  const seen = new Set<string>();
  const duplicate = keys.find((entry) => {
    if (seen.has(entry)) return true;
    seen.add(entry);
    return false;
  });
  if (duplicate) {
    return {
      ok: false,
      refusal: {
        kind: "baseline-refusal",
        ruleId,
        path: filePath,
        reason: "duplicate-baseline-key",
        message: `Baseline '${filePath}' contains duplicate key '${duplicate}'.`,
      },
    };
  }

  const sorted = [...keys].sort();
  if (!sameStringList(keys, sorted)) {
    return {
      ok: false,
      refusal: {
        kind: "baseline-refusal",
        ruleId,
        path: filePath,
        reason: "unsorted-baseline",
        message: `Baseline '${filePath}' entries must be sorted lexicographically.`,
      },
    };
  }
  return { ok: true, keys };
}
