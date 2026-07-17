import { errorMessage } from "./context.policy.js";
import {
  type BaselineAuthorityResult,
  type BaselineAuthorityState,
  type BaselineOccurrence,
  type BaselineRefusal,
  parseBaselineKeys,
  parseOccurrenceBaselineDocument,
} from "./dto/baseline.schema.js";
import { sameStringList } from "./utils.policy.js";

/** Canonical in-memory baseline coverage used by application and integrity checks. */
export interface ParsedBaselineDocument {
  readonly coverage: "key" | "occurrence";
  readonly occurrences: BaselineOccurrence[];
}

/** Converts a loaded baseline state into its public accepted-or-refused result. */
export function baselineAuthorityResult(state: BaselineAuthorityState): BaselineAuthorityResult {
  return state.kind === "baseline-refusal"
    ? { status: "refused", refusal: state }
    : { status: "accepted", state };
}

/** Reports whether a valid explicit baseline admits no diagnostics. */
export function isBaselineLocked(state: BaselineAuthorityState): boolean {
  return state.kind === "explicit-empty";
}

/**
 * Parses either the legacy unique-key document or the opt-in exact-occurrence document.
 *
 * Both formats become sorted counted entries so application, integrity, and
 * rule-introduction admission preserve multiplicity without expanding counts.
 */
export function parseBaselineDocument(
  value: unknown,
  filePath: string,
  ruleId: string
): { ok: true; document: ParsedBaselineDocument } | { ok: false; refusal: BaselineRefusal } {
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
    return parseLegacyBaseline(value, filePath, ruleId);
  }

  let occurrences: BaselineOccurrence[];
  try {
    occurrences = parseOccurrenceBaselineDocument(value).occurrences;
  } catch (error) {
    return {
      ok: false,
      refusal: {
        kind: "baseline-refusal",
        ruleId,
        path: filePath,
        reason: "malformed-baseline",
        message:
          `Baseline '${filePath}' must be a sorted JSON string array or a closed ` +
          `schemaVersion 1 occurrence document: ${errorMessage(error)}.`,
      },
    };
  }

  const validation = validateSortedUniqueOccurrenceEntries(occurrences, filePath, ruleId);
  if (!validation.ok) return validation;
  return {
    ok: true,
    document: {
      coverage: "occurrence",
      occurrences,
    },
  };
}

function parseLegacyBaseline(
  value: unknown,
  filePath: string,
  ruleId: string
): { ok: true; document: ParsedBaselineDocument } | { ok: false; refusal: BaselineRefusal } {
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
  return {
    ok: true,
    document: {
      coverage: "key",
      occurrences: keys.map((key) => ({ key, count: 1 })),
    },
  };
}

function validateSortedUniqueOccurrenceEntries(
  occurrences: readonly BaselineOccurrence[],
  filePath: string,
  ruleId: string
): { ok: true } | { ok: false; refusal: BaselineRefusal } {
  const seen = new Set<string>();
  const duplicate = occurrences.find(({ key }) => {
    if (seen.has(key)) return true;
    seen.add(key);
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
        message: `Baseline '${filePath}' contains duplicate occurrence key '${duplicate.key}'.`,
      },
    };
  }

  const keys = occurrences.map(({ key }) => key);
  if (!sameStringList(keys, [...keys].sort())) {
    return {
      ok: false,
      refusal: {
        kind: "baseline-refusal",
        ruleId,
        path: filePath,
        reason: "unsorted-baseline",
        message: `Baseline '${filePath}' occurrence entries must be sorted lexicographically by key.`,
      },
    };
  }
  return { ok: true };
}
