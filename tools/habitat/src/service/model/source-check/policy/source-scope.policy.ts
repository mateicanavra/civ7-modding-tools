import path from "node:path";
import { habitatCacheRepoPathPrefix } from "../../../../resources/authority-paths.ts";
import { decideScanRootProtection } from "../../host/index.ts";
import type { RuleDiagnosticFacts } from "../../rules/index.ts";

export interface SourceScopeContext {
  readonly repoRoot: string;
}

const sourceCheckCandidateExtensions = new Set([
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
  "tools/habitat/dist/",
];

export function approvedSourceScanRootsForRules(rules: readonly RuleDiagnosticFacts[]): string[] {
  return sortedUnique(rules.flatMap((rule) => rule.scanRoots));
}

function stagedSourceScanRoots(
  stagedPaths: readonly string[],
  approvedScanRoots: readonly string[] = [],
  context: SourceScopeContext
): string[] {
  const candidates = sortedUnique(
    stagedPaths
      .map((candidate) => toRepoRelative(context, candidate))
      .filter((candidate) => sourceCheckCandidateExtensions.has(path.extname(candidate)))
  );
  return candidates.filter((candidate) =>
    isApprovedSourceScanRoot(candidate, approvedScanRoots, context)
  );
}

export function stagedSourceCheckPaths(
  stagedPaths: readonly string[],
  approvedScanRoots: readonly string[],
  context: SourceScopeContext
): string[] {
  return stagedSourceScanRoots(stagedPaths, approvedScanRoots, context);
}

function pathsOverlap(candidate: string, declaredRoot: string): boolean {
  const normalizedCandidate = normalizeRepoPath(candidate);
  const normalizedRoot = normalizeRepoPath(declaredRoot);
  return (
    normalizedCandidate === normalizedRoot ||
    normalizedCandidate.startsWith(`${normalizedRoot}/`) ||
    normalizedRoot.startsWith(`${normalizedCandidate}/`)
  );
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values.map(normalizeRepoPath))].sort((a, b) => a.localeCompare(b));
}

function isApprovedSourceScanRoot(
  candidate: string,
  approvedScanRoots: readonly string[],
  context: SourceScopeContext
): boolean {
  const absolute = path.resolve(context.repoRoot, candidate);
  const relative = toRepoRelative(context, absolute);
  if (relative === ".." || relative.startsWith("../")) return false;
  const protection = decideScanRootProtection(relative, {
    protectedPrefixes: protectedSourceRootPrefixes,
  });
  if (protection.kind !== "accepted") return false;
  return approvedScanRoots.length === 0
    ? true
    : approvedScanRoots.some((approvedRoot) => pathsOverlap(relative, approvedRoot));
}

function toRepoRelative(context: SourceScopeContext, candidate: string): string {
  return path
    .relative(context.repoRoot, path.resolve(context.repoRoot, candidate))
    .split(path.sep)
    .join("/");
}

function normalizeRepoPath(candidate: string): string {
  const normalized = path.normalize(candidate).split(path.sep).join("/");
  return normalized === "." ? "" : normalized.replace(/^\.\//, "");
}
