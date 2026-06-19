import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import {
  type DiagnosticScanRootDecision,
  renderDiagnosticScanRootRefusal,
} from "../../../lib/diagnostic-catalog/index.js";
import { isGeneratedZoneRoot } from "../../../lib/generated-zone-catalog.js";
import { repoRoot, toRepoRelative } from "../../../lib/paths.js";
import type { RuleGritFacts } from "../../../rules/registry/index.js";
import {
  gritCandidateExtensions,
  injectedProbeRoot,
  protectedScanRootPrefixes,
} from "../constants.js";

export interface GritScanRootValidationOptions {
  requireExisting?: boolean;
  allowInjectedProbeRoot?: boolean;
  allowDocsRoot?: boolean;
  approvedScanRoots?: readonly string[];
}

export function selectedScanRootsForRules(
  selectedRules: readonly RuleGritFacts[],
  scanRoots: readonly string[] | undefined
): string[] {
  if (!scanRoots) return discoverGritScanRoots(selectedRules);
  const declaredRoots = selectedRules.flatMap((rule) => rule.scanRoots);
  if (declaredRoots.length === 0) return [...scanRoots];
  const matchingRoots = scanRoots.filter((scanRoot) =>
    declaredRoots.some((declaredRoot) => pathsOverlap(scanRoot, declaredRoot))
  );
  return matchingRoots.length > 0 ? matchingRoots : [...scanRoots];
}

export function discoverGritScanRoots(selectedRules: readonly RuleGritFacts[] = []): string[] {
  const declaredRoots = selectedRules.flatMap(declaredScanRootsForRule);
  return uniqueRepoRelative(declaredRoots).filter((scanPath) =>
    existsSync(path.join(repoRoot, scanPath))
  );
}

export function effectiveGritScanRoots(
  selectedRules: readonly RuleGritFacts[],
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

export function validateScanRoots(
  scanRoots: readonly string[],
  options: GritScanRootValidationOptions = {}
): string | null {
  const decision = decideGritScanRoots(scanRoots, options);
  return decision.kind === "refused" ? renderDiagnosticScanRootRefusal(decision) : null;
}

export function decideGritScanRoots(
  scanRoots: readonly string[],
  options: GritScanRootValidationOptions = {}
): DiagnosticScanRootDecision {
  const requireExisting = options.requireExisting ?? true;
  if (scanRoots.length === 0) return { kind: "refused", reason: "empty" };
  const acceptedInjectedProbeRoots = scanRoots.every(isInjectedProbeRoot);
  for (const scanRoot of scanRoots) {
    const absolute = path.resolve(repoRoot, scanRoot);
    const relative = toRepoRelative(absolute);
    if (relative === ".." || relative.startsWith("../"))
      return { kind: "refused", reason: "outside-repo", root: scanRoot };
    if (requireExisting && !existsSync(absolute))
      return { kind: "refused", reason: "missing", root: scanRoot };
    if (isGeneratedZoneRoot(relative))
      return { kind: "refused", reason: "generated-output", root: relative };
    if (isProtectedRoot(relative)) return { kind: "refused", reason: "protected-root", root: relative };
    if (!isApprovedScanRoot(relative, options)) {
      return {
        kind: "refused",
        reason: isInjectedProbeRoot(relative)
          ? "injected-probe-root-without-probe-mode"
          : "not-approved",
        root: relative,
      };
    }
  }
  if (options.allowInjectedProbeRoot && acceptedInjectedProbeRoots) {
    return { kind: "accepted-injected-probe-root", roots: [...scanRoots], probeOnly: true };
  }
  return { kind: "accepted", roots: [...scanRoots], source: "d2-rule-grit-facts" };
}

export function ruleHasDocsScanRoot(rule: RuleGritFacts): boolean {
  return declaredScanRootsForRule(rule).some(isDocsScanRoot);
}

export function ruleUsesDocsApplyDryRun(rule: RuleGritFacts): boolean {
  return rule.gritPattern === "docs_local_checkout_paths";
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

function uniqueRepoRelative(values: readonly string[]): string[] {
  return [...new Set(values.map(toRepoRelative))];
}

function declaredScanRootsForRule(rule: RuleGritFacts): string[] {
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

function ruleIncludesIgnoredTestFiles(rule: RuleGritFacts): boolean {
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

function isProtectedRoot(relative: string): boolean {
  const normalized = relative.endsWith("/") ? relative : `${relative}/`;
  return protectedScanRootPrefixes.some(
    (prefix) => normalized === prefix || normalized.startsWith(prefix)
  );
}

function isInjectedProbeRoot(relative: string): boolean {
  return relative === injectedProbeRoot || relative.startsWith(`${injectedProbeRoot}/`);
}

function isApprovedScanRoot(
  relative: string,
  options: Pick<
    GritScanRootValidationOptions,
    "allowInjectedProbeRoot" | "allowDocsRoot" | "approvedScanRoots"
  > = {}
): boolean {
  if (
    options.allowInjectedProbeRoot &&
    (relative === injectedProbeRoot || relative.startsWith(`${injectedProbeRoot}/`))
  ) {
    return true;
  }
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
