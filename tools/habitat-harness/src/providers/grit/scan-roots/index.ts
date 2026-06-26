import { existsSync } from "node:fs";
import path from "node:path";
import { repoRoot, toRepoRelative } from "@internal/habitat-harness/resources/paths";
import {
  type DiagnosticScanRootDecision,
  decideScanRootProtection,
  renderDiagnosticScanRootRefusal,
} from "@internal/habitat-harness/service/model/check/index";
import type { RuleSourceFacts } from "@internal/habitat-harness/service/model/rules/index";
import { protectedScanRootPrefixes } from "../constants.js";

export interface PatternScanRootValidationOptions {
  requireExisting?: boolean;
  allowDocsRoot?: boolean;
  approvedScanRoots?: readonly string[];
  pathExists?: (absolutePath: string) => boolean;
}

export function selectedScanRootsForRules(
  selectedRules: readonly RuleSourceFacts[],
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
  selectedRules: readonly RuleSourceFacts[] = [],
  options: Pick<PatternScanRootValidationOptions, "pathExists"> = {}
): string[] {
  const pathExists = options.pathExists ?? existsSync;
  const declaredRoots = selectedRules.flatMap(declaredScanRootsForRule);
  return uniqueRepoRelative(declaredRoots).filter((scanPath) =>
    pathExists(path.join(repoRoot, scanPath))
  );
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
  const pathExists = options.pathExists ?? existsSync;
  if (scanRoots.length === 0) return { kind: "refused", reason: "empty" };
  for (const scanRoot of scanRoots) {
    const absolute = path.resolve(repoRoot, scanRoot);
    const relative = toRepoRelative(absolute);
    if (relative === ".." || relative.startsWith("../"))
      return { kind: "refused", reason: "outside-repo", root: scanRoot };
    if (requireExisting && !pathExists(absolute))
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

export function ruleHasDocsScanRoot(rule: RuleSourceFacts): boolean {
  return declaredScanRootsForRule(rule).some(isDocsScanRoot);
}

export function ruleUsesDocsApplyDryRun(rule: RuleSourceFacts): boolean {
  return rule.patternName === "docs_local_checkout_paths";
}

export function isDocsScanRoot(scanRoot: string): boolean {
  const relative = toRepoRelative(scanRoot);
  return relative === "docs" || relative.startsWith("docs/") || path.extname(relative) === ".md";
}

export function normalizeGritPath(gritPath: string | undefined): string {
  if (!gritPath) return ".";
  return toRepoRelative(gritPath.replace(/^\.\//, ""));
}

export function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values.map(toRepoRelative))].sort((a, b) => a.localeCompare(b));
}

function uniqueRepoRelative(values: readonly string[]): string[] {
  return [...new Set(values.map(toRepoRelative))];
}

function declaredScanRootsForRule(rule: RuleSourceFacts): string[] {
  return [...rule.scanRoots];
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

export function pathsOverlap(candidate: string, declaredRoot: string): boolean {
  const normalizedCandidate = toRepoRelative(candidate);
  const normalizedRoot = toRepoRelative(declaredRoot);
  return (
    normalizedCandidate === normalizedRoot ||
    normalizedCandidate.startsWith(`${normalizedRoot}/`) ||
    normalizedRoot.startsWith(`${normalizedCandidate}/`)
  );
}
