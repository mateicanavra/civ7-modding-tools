import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import {
  type DiagnosticScanRootDecision,
  renderDiagnosticScanRootRefusal,
} from "../../../lib/diagnostic-catalog/index.js";
import { repoRoot, toRepoRelative } from "../../../lib/paths.js";
import { decideScanRootProtection } from "../../../lib/protected-zones/index.js";
import type { RulePatternFacts } from "../../../rules/registry/index.js";
import { gritCandidateExtensions, protectedScanRootPrefixes } from "../constants.js";

export interface PatternScanRootValidationOptions {
  requireExisting?: boolean;
  allowDocsRoot?: boolean;
  approvedScanRoots?: readonly string[];
}

export function selectedScanRootsForRules(
  selectedRules: readonly RulePatternFacts[],
  scanRoots: readonly string[] | undefined
): string[] {
  if (!scanRoots) return discoverPatternScanRoots(selectedRules);
  const declaredRoots = selectedRules.flatMap((rule) => rule.scanRoots);
  if (declaredRoots.length === 0) return [...scanRoots];
  const matchingRoots = scanRoots.filter((scanRoot) =>
    declaredRoots.some((declaredRoot) => pathsOverlap(scanRoot, declaredRoot))
  );
  return matchingRoots.length > 0 ? matchingRoots : [...scanRoots];
}

export function discoverPatternScanRoots(
  selectedRules: readonly RulePatternFacts[] = []
): string[] {
  const declaredRoots = selectedRules.flatMap(declaredScanRootsForRule);
  return uniqueRepoRelative(declaredRoots).filter((scanPath) =>
    existsSync(path.join(repoRoot, scanPath))
  );
}

export function effectivePatternScanRoots(
  selectedRules: readonly RulePatternFacts[],
  scanRoots: readonly string[]
): string[] {
  if (!selectedRules.some(ruleIncludesIgnoredTestFiles)) return [...scanRoots];
  const exactTestFiles = scanRoots.flatMap(collectIgnoredTestFiles);
  if (exactTestFiles.length === 0) return [...scanRoots];
  return sortedUnique([
    ...scanRoots.filter((scanRoot) => !isIgnoredTestDirectoryRoot(scanRoot)),
    ...exactTestFiles,
  ]);
}

export function decideEffectivePatternScanRoots(
  selectedRules: readonly RulePatternFacts[],
  requestedRoots: readonly string[],
  options: PatternScanRootValidationOptions = {}
): DiagnosticScanRootDecision {
  const effectiveRoots = effectivePatternScanRoots(selectedRules, requestedRoots);
  const decision = decidePatternScanRoots(effectiveRoots, options);
  if (decision.kind !== "accepted") return decision;
  if (sameRoots(requestedRoots, effectiveRoots)) return decision;
  return {
    kind: "expanded-test-files",
    requestedRoots: [...requestedRoots],
    effectiveRoots,
  };
}

export function validateScanRoots(
  scanRoots: readonly string[],
  options: PatternScanRootValidationOptions = {}
): string | null {
  const decision = decidePatternScanRoots(scanRoots, options);
  return decision.kind === "refused" ? renderDiagnosticScanRootRefusal(decision) : null;
}

export function decidePatternScanRoots(
  scanRoots: readonly string[],
  options: PatternScanRootValidationOptions = {}
): DiagnosticScanRootDecision {
  const requireExisting = options.requireExisting ?? true;
  if (scanRoots.length === 0) return { kind: "refused", reason: "empty" };
  for (const scanRoot of scanRoots) {
    const absolute = path.resolve(repoRoot, scanRoot);
    const relative = toRepoRelative(absolute);
    if (relative === ".." || relative.startsWith("../"))
      return { kind: "refused", reason: "outside-repo", root: scanRoot };
    if (requireExisting && !existsSync(absolute))
      return { kind: "refused", reason: "missing", root: scanRoot };
    const protection = decideScanRootProtection(relative, {
      protectedPrefixes: protectedScanRootPrefixes,
    });
    if (protection.kind !== "accepted") {
      return {
        kind: "refused",
        reason: protection.reason,
        root: relative,
        owner: protection.owner,
        recovery: protection.recovery,
      };
    }
    if (!isApprovedScanRoot(relative, options)) {
      return { kind: "refused", reason: "not-approved", root: relative };
    }
  }
  return { kind: "accepted", roots: [...scanRoots], source: "rule-registry-facts" };
}

export function ruleHasDocsScanRoot(rule: RulePatternFacts): boolean {
  return declaredScanRootsForRule(rule).some(isDocsScanRoot);
}

export function ruleUsesDocsApplyDryRun(rule: RulePatternFacts): boolean {
  return rule.patternName === "docs_local_checkout_paths";
}

export function isDocsScanRoot(scanRoot: string): boolean {
  return path.extname(toRepoRelative(scanRoot)) === ".md";
}

export function normalizeGritPath(gritPath: string | undefined): string {
  if (!gritPath) return ".";
  return toRepoRelative(gritPath.replace(/^\.\//, ""));
}

export function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values.map(toRepoRelative))].sort((a, b) => a.localeCompare(b));
}

function sameRoots(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function uniqueRepoRelative(values: readonly string[]): string[] {
  return [...new Set(values.map(toRepoRelative))];
}

function declaredScanRootsForRule(rule: RulePatternFacts): string[] {
  if (!ruleUsesDocsApplyDryRun(rule)) return [...rule.scanRoots];
  return rule.scanRoots.flatMap(collectMarkdownScanRoots);
}

function collectMarkdownScanRoots(scanRoot: string): string[] {
  const absolute = path.join(repoRoot, scanRoot);
  if (!existsSync(absolute)) return [];
  const relative = toRepoRelative(absolute);
  const stats = statSync(absolute);
  if (stats.isFile()) return path.extname(relative) === ".md" ? [relative] : [];
  if (!stats.isDirectory()) return [];
  const files: string[] = [];
  collectMarkdownFiles(absolute, files);
  return files.map(toRepoRelative);
}

function collectMarkdownFiles(absoluteRoot: string, files: string[]): void {
  for (const entry of readdirSync(absoluteRoot, { withFileTypes: true })) {
    const absolute = path.join(absoluteRoot, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") continue;
      collectMarkdownFiles(absolute, files);
      continue;
    }
    if (entry.isFile() && path.extname(entry.name) === ".md") files.push(absolute);
  }
}

function ruleIncludesIgnoredTestFiles(rule: RulePatternFacts): boolean {
  return rule.expandIgnoredTestDirectories === true;
}

function collectIgnoredTestFiles(scanRoot: string): string[] {
  const absolute = path.resolve(repoRoot, scanRoot);
  if (!existsSync(absolute)) return [];
  const relative = toRepoRelative(absolute);
  const stats = statSync(absolute);
  if (stats.isFile()) return isIgnoredTestCandidate(relative) ? [relative] : [];
  if (!stats.isDirectory()) return [];
  const files: string[] = [];
  collectFiles(absolute, files);
  return files.map(toRepoRelative).filter(isIgnoredTestCandidate);
}

function isIgnoredTestDirectoryRoot(scanRoot: string): boolean {
  const absolute = path.resolve(repoRoot, scanRoot);
  if (!existsSync(absolute)) return false;
  if (!statSync(absolute).isDirectory()) return false;
  const relative = toRepoRelative(absolute);
  return relative.endsWith("/test") || relative.includes("/test/");
}

function collectFiles(absoluteRoot: string, files: string[]): void {
  for (const entry of readdirSync(absoluteRoot, { withFileTypes: true })) {
    const absolute = path.join(absoluteRoot, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") continue;
      collectFiles(absolute, files);
      continue;
    }
    if (entry.isFile()) files.push(absolute);
  }
}

function isIgnoredTestCandidate(relative: string): boolean {
  if (!gritCandidateExtensions.has(path.extname(relative))) return false;
  return relative.includes("/test/") || /\.test\.[cm]?[jt]sx?$/.test(relative);
}

function isApprovedScanRoot(
  relative: string,
  options: Pick<PatternScanRootValidationOptions, "allowDocsRoot" | "approvedScanRoots"> = {}
): boolean {
  if (options.approvedScanRoots && options.approvedScanRoots.length > 0) {
    return options.approvedScanRoots.some((approvedRoot) => pathsOverlap(relative, approvedRoot));
  }
  if (!options.allowDocsRoot && path.extname(relative) === ".md") return false;
  return true;
}

function pathsOverlap(candidate: string, declaredRoot: string): boolean {
  const normalizedCandidate = toRepoRelative(candidate);
  const normalizedRoot = toRepoRelative(declaredRoot);
  return (
    normalizedCandidate === normalizedRoot ||
    normalizedCandidate.startsWith(`${normalizedRoot}/`) ||
    normalizedRoot.startsWith(`${normalizedCandidate}/`)
  );
}
