import path from "node:path";
import { habitatCacheRepoPathPrefix } from "@internal/habitat-harness/resources/artifact-paths";
import { repoRoot, toRepoRelative } from "@internal/habitat-harness/resources/paths";
import { decideScanRootProtection } from "@internal/habitat-harness/service/model/host/index";
import type { RuleSourceFacts } from "@internal/habitat-harness/service/model/rules/index";
import { activeRuleSourceFacts } from "@internal/habitat-harness/service/model/rules/policy/active-facts.policy";

export const sourceCheckCandidateExtensions = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".jsx",
  ".json",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);

const protectedSourceRootPrefixes = [
  ".git/",
  habitatCacheRepoPathPrefix,
  "dist/",
  "node_modules/",
  "tools/habitat-harness/dist/",
];

export function approvedSourceScanRootsForRules(rules: readonly RuleSourceFacts[]): string[] {
  return sortedUnique(rules.flatMap((rule) => rule.scanRoots));
}

export function selectedSourceScanRootsForRules(
  selectedRules: readonly RuleSourceFacts[],
  scanRoots: readonly string[] | undefined
): string[] {
  if (!scanRoots) return approvedSourceScanRootsForRules(selectedRules);
  const declaredRoots = selectedRules.flatMap((rule) => rule.scanRoots);
  if (declaredRoots.length === 0) return [...scanRoots];
  const matchingRoots = scanRoots.filter((scanRoot) =>
    declaredRoots.some((declaredRoot) => pathsOverlap(scanRoot, declaredRoot))
  );
  return matchingRoots.length > 0 ? matchingRoots : [...scanRoots];
}

export function stagedSourceScanRoots(
  stagedPaths: readonly string[],
  approvedScanRoots: readonly string[] = []
): string[] {
  const candidates = sortedUnique(
    stagedPaths
      .map((candidate) => toRepoRelative(candidate))
      .filter((candidate) => sourceCheckCandidateExtensions.has(path.extname(candidate)))
  );
  return candidates.filter((candidate) => isApprovedSourceScanRoot(candidate, approvedScanRoots));
}

export function stagedSourceCheckPaths(
  stagedPaths: readonly string[],
  approvedScanRoots: readonly string[] = approvedSourceScanRootsForRules(activeRuleSourceFacts)
): string[] {
  return stagedSourceScanRoots(stagedPaths, approvedScanRoots);
}

export function collapsedSourceScanRoots(scanRoots: readonly string[]): string[] {
  const sortedRoots = sortedUnique(scanRoots);
  return sortedRoots.filter(
    (candidate, index) =>
      !sortedRoots.some(
        (possibleParent, parentIndex) =>
          parentIndex !== index && sourceScanRootContains(possibleParent, candidate)
      )
  );
}

export function pathsOverlap(candidate: string, declaredRoot: string): boolean {
  const normalizedCandidate = toRepoRelative(candidate);
  const normalizedRoot = toRepoRelative(declaredRoot);
  return (
    normalizedCandidate === normalizedRoot ||
    normalizedCandidate.startsWith(`${normalizedRoot}/`) ||
    normalizedRoot.startsWith(`${normalizedCandidate}/`)
  );
}

export function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values.map(toRepoRelative))].sort((a, b) => a.localeCompare(b));
}

function sourceScanRootContains(parent: string, child: string): boolean {
  const normalizedParent = toRepoRelative(parent);
  const normalizedChild = toRepoRelative(child);
  if (normalizedParent === "") return true;
  return normalizedParent === normalizedChild || normalizedChild.startsWith(`${normalizedParent}/`);
}

function isApprovedSourceScanRoot(
  candidate: string,
  approvedScanRoots: readonly string[]
): boolean {
  const absolute = path.resolve(repoRoot, candidate);
  const relative = toRepoRelative(absolute);
  if (relative === ".." || relative.startsWith("../")) return false;
  const protection = decideScanRootProtection(relative, {
    protectedPrefixes: protectedSourceRootPrefixes,
  });
  if (protection.kind !== "accepted") return false;
  return approvedScanRoots.length === 0
    ? true
    : approvedScanRoots.some((approvedRoot) => pathsOverlap(relative, approvedRoot));
}
