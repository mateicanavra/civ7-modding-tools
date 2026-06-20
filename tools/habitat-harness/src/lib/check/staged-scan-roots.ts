import path from "node:path";
import { validateScanRoots } from "../../adapters/grit/index.js";
import { activeRulePatternFacts } from "../../rules/facts.js";
import type { RulePatternFacts } from "../../rules/registry/index.js";
import { toRepoRelative } from "../paths.js";

export function stagedPatternScanRoots(
  stagedPaths: readonly string[],
  approvedScanRoots: readonly string[] = approvedScanRootsForRules(activeRulePatternFacts)
): string[] {
  const candidates = sortedUnique(
    stagedPaths
      .map((candidate) => toRepoRelative(candidate))
      .filter((candidate) => gritCandidateExtensions.has(path.extname(candidate)))
  );
  return candidates.filter(
    (candidate) =>
      validateScanRoots([candidate], {
        requireExisting: false,
        approvedScanRoots,
      }) === null
  );
}

export function approvedScanRootsForRules(rules: readonly RulePatternFacts[]): string[] {
  return [...new Set(rules.flatMap((rule) => rule.scanRoots).map(toRepoRelative))];
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

const gritCandidateExtensions = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);
