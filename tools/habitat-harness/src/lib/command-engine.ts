import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { executeRule, type HarnessRule, rules } from "../rules/architecture.js";
import { renderReport } from "../rules/messages.js";
import {
  applyBaseline,
  baselineFailureDiagnostic,
  checkBaselineIntegrity,
  guardBaselineExpansion,
  isBaselineLocked,
  loadBaselineState,
  mergeBase,
  violationKey,
  writeBaseline,
} from "./baseline.js";
import type { CheckReport, RuleReport } from "./diagnostics.js";
import { validateCheckReport } from "./diagnostics.js";
import { runGritApplyPatterns } from "./grit-apply.js";

export { runHook } from "./hooks.js";

import { repoRoot, toRepoRelative } from "./paths.js";
import { run, type SpawnResult } from "./spawn.js";
import {
  findOwningProject,
  NxProjectGraphMetadataReader,
  type NxProjectMetadata,
  type NxProjectMetadataReader,
  projectHasTarget,
} from "./nx-projects.js";

export interface RuleSelection {
  owner?: string;
  rule?: string;
  tool?: string;
}

export type RuleSelectorKind = "owner" | "rule" | "tool";
export type RuleSelectionFailureReason =
  | "unknown-selector"
  | "wrong-selector-namespace"
  | "empty-selection";

export interface RuleSelectorFact {
  kind: RuleSelectorKind;
  requestedValue: string;
  known: boolean;
  matchedNamespace?: RuleSelectorKind;
  matchingRuleIds: string[];
}

export interface RuleSelectionEmptyIntersection {
  participants: RuleSelectorFact[];
  matchingRuleIdsBySelector: Record<string, string[]>;
}

export type RuleSelectionResult =
  | { ok: true; rules: HarnessRule[]; requested: RuleSelection }
  | {
      ok: false;
      requested: RuleSelection;
      reason: RuleSelectionFailureReason;
      selectorFacts: RuleSelectorFact[];
      emptyIntersection?: RuleSelectionEmptyIntersection;
      message: string;
    };

export interface CheckOptions extends RuleSelection {
  base?: string;
  commandArgs?: readonly string[];
  staged?: boolean;
}

export interface EmitCheckOptions {
  json?: boolean;
  output?: string;
}

export interface FixOptions {
  dryRun?: boolean;
}

export type BaselineExpansionResult =
  | { ok: true; messages: string[] }
  | Extract<RuleSelectionResult, { ok: false }>
  | {
      ok: false;
      requested: RuleSelection;
      reason: "baseline-contract";
      message: string;
    };

export interface VerifyOptions {
  base?: string;
  commandArgs?: readonly string[];
}

export interface Classification {
  path: string;
  project: string | null;
  projectRoot?: string;
  tags?: string[];
  rulesInScope?: string[];
  scopedRules?: ScopedRule[];
  requiredTargets?: string[];
  targets?: ClassifiedTarget[];
  unavailableTargets?: UnavailableClassifiedTarget[];
  note?: string;
}

export type RuleScopeKind =
  | "exact-path"
  | "project-owner"
  | "workspace-gate"
  | "unresolved-metadata";

export interface ScopedRule {
  ruleId: string;
  ownerTool: string;
  ownerProject: string;
  scope: RuleScopeKind;
  reason: string;
}

export interface ClassifiedTarget {
  command: string;
  owner: "project" | "workspace" | "habitat";
  project: string | null;
  target: string;
  proof:
    | { kind: "nx-project-graph"; project: string; target: string }
    | { kind: "habitat-owned"; reason: string };
}

export interface UnavailableClassifiedTarget {
  owner: "project";
  project: string;
  target: string;
  reason: "missing-nx-target";
}

export interface DiffClassification {
  schemaVersion: 1;
  inputKind: "diff";
  paths: Classification[];
}

export function selectRules(
  selection: RuleSelection = {},
  registry: readonly HarnessRule[] = rules
): RuleSelectionResult {
  const facts = selectorFacts(selection, registry);
  const wrongNamespace = facts.find((fact) => !fact.known && fact.matchedNamespace);
  if (wrongNamespace) {
    return {
      ok: false,
      requested: selection,
      reason: "wrong-selector-namespace",
      selectorFacts: facts,
      message: describeSelectorFacts([wrongNamespace]),
    };
  }

  const unknown = facts.find((fact) => !fact.known);
  if (unknown) {
    return {
      ok: false,
      requested: selection,
      reason: "unknown-selector",
      selectorFacts: facts,
      message: describeSelectorFacts([unknown]),
    };
  }

  const selected = filterRules(selection, registry);
  if (facts.length > 0 && selected.length === 0) {
    return {
      ok: false,
      requested: selection,
      reason: "empty-selection",
      selectorFacts: facts,
      emptyIntersection: {
        participants: facts,
        matchingRuleIdsBySelector: Object.fromEntries(
          facts.map((fact) => [selectorKey(fact), fact.matchingRuleIds])
        ),
      },
      message: `No Habitat rules match the requested selector combination: ${facts
        .map((fact) => `${selectorLabel(fact.kind)} ${JSON.stringify(fact.requestedValue)}`)
        .join(", ")}.`,
    };
  }

  return { ok: true, requested: selection, rules: selected };
}

export function buildHabitatCommand(command: string, argv: readonly string[] = []): string {
  const tail = argv.length > 0 ? ` ${argv.join(" ")}` : "";
  return `habitat ${command}${tail}`;
}

export async function createCheckReport(options: CheckOptions = {}): Promise<CheckReport> {
  const selection = selectRules(options);
  if (!selection.ok) return createRuleSelectionFailureReport(selection, options);

  const reports: RuleReport[] = [];
  const ruleResults = await executeSelectedRules(selection.rules, options);
  for (const rule of selection.rules) {
    const baseline = loadBaselineState(rule);
    const execution = ruleResults.get(rule.id);
    if (!execution) throw new Error(`habitat internal error: missing rule result for ${rule.id}`);
    const { diagnostics } = execution.result;
    const baselineFailures = applyBaseline(diagnostics, baseline);
    diagnostics.push(...baselineFailures.map((failure) => baselineFailureDiagnostic(rule.id, failure)));
    const newViolations = diagnostics.filter(
      (diagnostic) => !diagnostic.baselined && diagnostic.severity === "error"
    );
    const status: RuleReport["status"] =
      rule.lane === "advisory"
        ? diagnostics.length > 0
          ? "advisory-findings"
          : "pass"
        : newViolations.length > 0
          ? "fail"
          : "pass";
    reports.push({
      ruleId: rule.id,
      ownerTool: rule.ownerTool,
      lane: rule.lane,
      status,
      locked: isBaselineLocked(baseline),
      durationMs: execution.durationMs,
      diagnostics,
      detect: rule.detect,
      message: rule.message,
      remediate: rule.remediate,
    });
  }

  const integrityStarted = Date.now();
  const integrity = checkBaselineIntegrity(options.base ?? "main", { registry: rules });
  reports.push({
    ruleId: "baseline-integrity",
    ownerTool: "habitat-native",
    lane: "enforced",
    status: integrity.length > 0 ? "fail" : "pass",
    locked: true,
    durationMs: Date.now() - integrityStarted,
    diagnostics: integrity.map((finding) => ({
      ruleId: "baseline-integrity",
      path: finding.file,
      message: finding.reason,
      severity: "error" as const,
      baselined: false,
    })),
    detect: ["habitat", "check", "(built-in)"],
    message:
      "Baselines are shrink-only; additions are valid only in the change that introduces the rule itself.",
    remediate: null,
  });

  return {
    schemaVersion: 1,
    command: buildHabitatCommand("check", options.commandArgs),
    startedAt: new Date().toISOString(),
    ok: reports.every((report) => report.status !== "fail"),
    rules: reports,
  };
}

export async function expandBaselines(
  selection: RuleSelection = {},
  options: { base?: string } = {}
): Promise<BaselineExpansionResult> {
  const selected = selectRules(selection);
  if (!selected.ok) return selected;

  const messages: string[] = [];
  const ruleResults = await executeSelectedRules(selected.rules);
  for (const rule of selected.rules) {
    const baseline = loadBaselineState(rule);
    if (baseline.kind === "contract-failure") {
      return {
        ok: false,
        requested: selection,
        reason: "baseline-contract",
        message: baseline.message,
      };
    }
    const execution = ruleResults.get(rule.id);
    if (!execution) throw new Error(`habitat internal error: missing rule result for ${rule.id}`);
    const { diagnostics } = execution.result;
    const baselineFailures = applyBaseline(diagnostics, baseline);
    if (baselineFailures.length > 0) {
      return {
        ok: false,
        requested: selection,
        reason: "baseline-contract",
        message: baselineFailures.map((failure) => failure.message).join(" "),
      };
    }
    const keys = diagnostics
      .filter((diagnostic) => diagnostic.severity === "error" && !diagnostic.baselined)
      .map(violationKey);
    if (keys.length > 0) {
      const guard = guardBaselineExpansion(rule.id, keys, options.base ?? "main", { registry: rules });
      if (!guard.ok) {
        return {
          ok: false,
          requested: selection,
          reason: "baseline-contract",
          message: guard.message,
        };
      }
      writeBaseline(rule.id, keys);
      messages.push(`baseline written: ${rule.id} (${keys.length} entries)`);
    }
  }
  return { ok: true, messages };
}

async function executeSelectedRules(
  selectedRules: readonly HarnessRule[],
  options: Pick<CheckOptions, "staged"> = {}
): Promise<Map<string, { result: Awaited<ReturnType<typeof executeRule>>; durationMs: number }>> {
  const results = new Map<string, { result: Awaited<ReturnType<typeof executeRule>>; durationMs: number }>();
  const gritRules = selectedRules.filter((rule) => rule.ownerTool === "grit-check");
  if (gritRules.length > 0) {
    const { runGritRules } = await import("./grit.js");
    const started = Date.now();
    const gritResults = await runGritRules(gritRules);
    const durationMs = Date.now() - started;
    for (const rule of gritRules) {
      const result = gritResults.get(rule.id);
      if (result) results.set(rule.id, { result, durationMs });
    }
  }

  for (const rule of selectedRules) {
    if (rule.ownerTool === "grit-check") continue;
    const started = Date.now();
    const result = await executeRule(rule, { staged: options.staged });
    results.set(rule.id, { result, durationMs: Date.now() - started });
  }

  return results;
}

export function renderCheckReport(report: CheckReport, options: EmitCheckOptions = {}): string {
  const json = stringifyCheckReport(report);
  if (options.output) writeFileSync(path.resolve(repoRoot, options.output), `${json}\n`);
  return options.json ? json : renderReport(report);
}

export function stringifyCheckReport(report: CheckReport): string {
  const schemaErrors = validateCheckReport(report);
  if (schemaErrors.length > 0) {
    throw new Error(
      `habitat internal error: report violates its own schema:\n${schemaErrors.join("\n")}`
    );
  }
  return JSON.stringify(report, null, 2);
}

function filterRules(selection: RuleSelection, registry: readonly HarnessRule[]): HarnessRule[] {
  let selected = [...registry];
  if (selection.owner) selected = selected.filter((rule) => rule.ownerProject === selection.owner);
  if (selection.rule) selected = selected.filter((rule) => rule.id === selection.rule);
  if (selection.tool) selected = selected.filter((rule) => rule.ownerTool === selection.tool);
  return selected;
}

function selectorFacts(
  selection: RuleSelection,
  registry: readonly HarnessRule[]
): RuleSelectorFact[] {
  const facts: RuleSelectorFact[] = [];
  if (selection.owner) facts.push(selectorFact("owner", selection.owner, registry));
  if (selection.rule) facts.push(selectorFact("rule", selection.rule, registry));
  if (selection.tool) facts.push(selectorFact("tool", selection.tool, registry));
  return facts;
}

function selectorFact(
  kind: RuleSelectorKind,
  requestedValue: string,
  registry: readonly HarnessRule[]
): RuleSelectorFact {
  const matchingRuleIds = matchingRulesForKind(kind, requestedValue, registry).map(
    (rule) => rule.id
  );
  const matchedNamespace =
    matchingRuleIds.length > 0 ? undefined : firstMatchingNamespace(kind, requestedValue, registry);
  return {
    kind,
    requestedValue,
    known: matchingRuleIds.length > 0,
    matchedNamespace,
    matchingRuleIds,
  };
}

function matchingRulesForKind(
  kind: RuleSelectorKind,
  value: string,
  registry: readonly HarnessRule[]
): HarnessRule[] {
  switch (kind) {
    case "owner":
      return registry.filter((rule) => rule.ownerProject === value);
    case "rule":
      return registry.filter((rule) => rule.id === value);
    case "tool":
      return registry.filter((rule) => rule.ownerTool === value);
  }
}

function firstMatchingNamespace(
  requestedKind: RuleSelectorKind,
  value: string,
  registry: readonly HarnessRule[]
): RuleSelectorKind | undefined {
  return (["owner", "rule", "tool"] as const).find(
    (kind) => kind !== requestedKind && matchingRulesForKind(kind, value, registry).length > 0
  );
}

function selectorKey(fact: RuleSelectorFact): string {
  return `${fact.kind}:${fact.requestedValue}`;
}

function selectorLabel(kind: RuleSelectorKind): string {
  if (kind === "owner") return "owner id";
  if (kind === "rule") return "rule id";
  return "tool id";
}

function describeSelectorFacts(facts: RuleSelectorFact[]): string {
  return facts
    .map((fact) => {
      const label = selectorLabel(fact.kind);
      if (fact.matchedNamespace) {
        return `${JSON.stringify(fact.requestedValue)} is a known ${selectorLabel(
          fact.matchedNamespace
        )}, not a ${label}.`;
      }
      return `Unknown Habitat ${label}: ${JSON.stringify(fact.requestedValue)}.`;
    })
    .join(" ");
}

export function describeRuleSelectionFailure(failure: { message: string }): string {
  return failure.message;
}

function createRuleSelectionFailureReport(
  failure: Extract<RuleSelectionResult, { ok: false }>,
  options: CheckOptions
): CheckReport {
  const started = Date.now();
  return {
    schemaVersion: 1,
    command: buildHabitatCommand("check", options.commandArgs),
    startedAt: new Date().toISOString(),
    ok: false,
    rules: [
      {
        ruleId: "rule-selection-integrity",
        ownerTool: "habitat-native",
        lane: "enforced",
        status: "fail",
        locked: true,
        durationMs: Date.now() - started,
        diagnostics: [
          {
            ruleId: "rule-selection-integrity",
            path: ".",
            message: describeRuleSelectionFailure(failure),
            severity: "error",
            baselined: false,
          },
        ],
        detect: ["habitat", "check", "(selector-validation)"],
        message:
          "Requested Habitat selectors must match real rule owners, rule ids, tools, and non-empty intersections before rule execution.",
        remediate:
          "Use --owner for owner project ids, --rule for rule ids, --tool for enforcement tool ids, or omit selectors to run all rules.",
      },
    ],
  };
}

export async function runFix(options: FixOptions = {}): Promise<SpawnResult> {
  return runGritApplyPatterns({ dryRun: options.dryRun });
}

export function resolveVerifyBase(base?: string): string {
  return base ?? mergeBase("main") ?? "main";
}

export function runAffectedVerification(base: string): SpawnResult {
  return run(
    [
      "nx",
      "affected",
      "-t",
      "build,check,test,boundaries,biome:ci,grit:check,generated:check",
      "--base",
      base,
    ],
    {
      cwd: repoRoot,
    }
  );
}

export function runGraph(options: { json?: boolean } = {}): SpawnResult {
  const dir = mkdtempSync(path.join(tmpdir(), "habitat-graph-"));
  const graphPath = path.join(dir, "graph.json");
  try {
    const graphResult = run(["nx", "graph", "--file", graphPath], {
      cwd: repoRoot,
    });
    if (graphResult.exitCode !== 0) return graphResult;
    const graph = JSON.parse(readFileSync(graphPath, "utf8"));
    return {
      exitCode: 0,
      stdout: `${JSON.stringify(graph.graph ?? graph, null, options.json ? 0 : 2)}\n`,
      stderr: "",
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

export interface ClassifyOptions {
  nxProjects?: NxProjectMetadataReader;
}

export async function classifyTarget(
  target: string,
  options: ClassifyOptions = {}
): Promise<Classification | DiffClassification> {
  const diff = diffText(target);
  if (diff) {
    const projects = await readNxProjects(options);
    return {
      schemaVersion: 1,
      inputKind: "diff",
      paths: extractDiffPaths(diff).map((diffPath) => classifyPathWithProjects(diffPath, projects)),
    };
  }
  return classifyPath(target, options);
}

export async function classifyPath(
  target: string,
  options: ClassifyOptions = {}
): Promise<Classification> {
  const projects = await readNxProjects(options);
  return classifyPathWithProjects(target, projects);
}

function classifyPathWithProjects(
  target: string,
  projects: readonly NxProjectMetadata[]
): Classification {
  const rel = toRepoRelative(target);
  const owner = findOwningProject(rel, projects);
  const workspace = workspaceTargets();
  if (!owner) {
    return {
      path: rel,
      project: null,
      note: "workspace-level path",
      requiredTargets: workspace.map((target) => target.command),
      targets: workspace,
    };
  }
  const scopedRules = rulesInScopeForPath(rel, owner);
  const resolvedProjectTargets = projectTargets(owner);
  return {
    path: rel,
    project: owner.name,
    projectRoot: owner.root,
    tags: owner.tags,
    rulesInScope: scopedRules.map((rule) => rule.ruleId),
    scopedRules,
    requiredTargets: [...resolvedProjectTargets.targets, ...workspace].map((target) => target.command),
    targets: [...resolvedProjectTargets.targets, ...workspace],
    unavailableTargets: resolvedProjectTargets.unavailableTargets,
  };
}

function rulesInScopeForPath(pathInRepo: string, owner: NxProjectMetadata): ScopedRule[] {
  return rules
    .map((rule) => classifyRuleScope(rule, pathInRepo, owner))
    .filter((rule): rule is ScopedRule => Boolean(rule))
    .sort((a, b) => a.ruleId.localeCompare(b.ruleId));
}

function classifyRuleScope(
  rule: HarnessRule,
  pathInRepo: string,
  owner: NxProjectMetadata
): ScopedRule | undefined {
  const matchedPattern = scopePathPatterns(rule).find((pattern) =>
    scopePatternMatches(pattern, pathInRepo)
  );
  if (matchedPattern) {
    return {
      ruleId: rule.id,
      ownerTool: rule.ownerTool,
      ownerProject: rule.ownerProject,
      scope: "exact-path",
      reason: `Path matches rule scope pattern ${matchedPattern}.`,
    };
  }

  if (rule.ownerProject === owner.name) {
    if (requiresExplicitScanRoot(rule)) {
      return {
        ruleId: rule.id,
        ownerTool: rule.ownerTool,
        ownerProject: rule.ownerProject,
        scope: "unresolved-metadata",
        reason: "Rule is owned by the project, but current metadata is not precise enough for exact path scope.",
      };
    }
    return {
      ruleId: rule.id,
      ownerTool: rule.ownerTool,
      ownerProject: rule.ownerProject,
      scope: "project-owner",
      reason: `Rule owner project matches ${owner.name}.`,
    };
  }

  if (isWorkspaceGate(rule)) {
    return {
      ruleId: rule.id,
      ownerTool: rule.ownerTool,
      ownerProject: rule.ownerProject,
      scope: "workspace-gate",
      reason: "Workspace-level Habitat gate relevant beyond a single owning project.",
    };
  }

  return undefined;
}

function requiresExplicitScanRoot(rule: HarnessRule): boolean {
  return rule.ownerTool === "grit-check" || rule.ownerTool === "wrapped-test";
}

function isWorkspaceGate(rule: HarnessRule): boolean {
  if (rule.ownerProject !== "@internal/habitat-harness") return false;
  const scope = rule.scope.toLowerCase();
  return (
    scope.includes("all ") ||
    scope.includes("live repo") ||
    scope.includes("workspace") ||
    scope.includes("staged ") ||
    scope.includes("package.json") ||
    scope.includes("docs/") ||
    scope.includes("package-manager")
  );
}

function scopePathPatterns(rule: HarnessRule): string[] {
  if (!scopeIsMachineParseable(rule.scope)) return [];
  const patterns: string[] = [];
  const matches = rule.scope.matchAll(/\b(apps|docs|mods|packages|scripts|tools)\/[^\s;)]+/g);
  for (const match of matches) {
    const pattern = trimScopePattern(match[0]);
    if (pattern) patterns.push(...expandScopePattern(pattern));
  }
  return [...new Set(patterns)];
}

function scopeIsMachineParseable(scope: string): boolean {
  const normalized = scope.toLowerCase();
  const unmodeledQualifiers = [
    " outside ",
    " except ",
    " excluding ",
    " and root ",
    " or root ",
    " and ",
    " or ",
  ];
  return !unmodeledQualifiers.some((qualifier) => normalized.includes(qualifier));
}

function trimScopePattern(pattern: string): string {
  return pattern.replace(/[,.]+$/g, "").replace(/^`|`$/g, "");
}

function expandScopePattern(pattern: string): string[] {
  const brace = pattern.match(/^(.*)\{([^{}]+)\}(.*)$/);
  if (!brace) return [pattern];
  const [, prefix, values, suffix] = brace;
  return values.split(",").flatMap((value) => expandScopePattern(`${prefix}${value}${suffix}`));
}

function scopePatternMatches(pattern: string, pathInRepo: string): boolean {
  const normalized = pattern.replaceAll("\\", "/");
  if (!normalized.includes("*")) {
    return pathInRepo === normalized || pathInRepo.startsWith(`${normalized}/`);
  }
  return globToRegExp(normalized).test(pathInRepo);
}

function globToRegExp(pattern: string): RegExp {
  let source = "^";
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    const next = pattern[index + 1];
    if (char === "*" && next === "*") {
      if (pattern[index + 2] === "/") {
        source += "(?:.*/)?";
        index += 2;
        continue;
      }
      source += ".*";
      index += 1;
      continue;
    }
    if (char === "*") {
      source += "[^/]*";
      continue;
    }
    if (char === "?") {
      source += "[^/]";
      continue;
    }
    source += escapeRegExp(char);
  }
  source += "$";
  return new RegExp(source);
}

function escapeRegExp(char: string): string {
  return /[\\^$+?.()|[\]{}]/.test(char) ? `\\${char}` : char;
}

function projectTargets(project: NxProjectMetadata): {
  targets: ClassifiedTarget[];
  unavailableTargets: UnavailableClassifiedTarget[];
} {
  const targetNames = ["check", "test"];
  return {
    targets: targetNames
      .filter((targetName) => projectHasTarget(project, targetName))
      .map((targetName) => ({
        command: `nx run ${project.name}:${targetName}`,
        owner: "project" as const,
        project: project.name,
        target: targetName,
        proof: { kind: "nx-project-graph" as const, project: project.name, target: targetName },
      })),
    unavailableTargets: targetNames
      .filter((targetName) => !projectHasTarget(project, targetName))
      .map((targetName) => ({
        owner: "project" as const,
        project: project.name,
        target: targetName,
        reason: "missing-nx-target" as const,
      })),
  };
}

function workspaceTargets(): ClassifiedTarget[] {
  return [
    {
      command: "bun run lint",
      owner: "workspace",
      project: null,
      target: "lint",
      proof: {
        kind: "habitat-owned",
        reason: "workspace-level structural gate from root package scripts",
      },
    },
  ];
}

async function readNxProjects(options: ClassifyOptions): Promise<NxProjectMetadata[]> {
  return (options.nxProjects ?? new NxProjectGraphMetadataReader()).readProjects();
}

function diffText(target: string): string | undefined {
  if (target.includes("\n") || target.startsWith("diff --git ")) return target;
  const candidate = path.resolve(repoRoot, target);
  if (existsSync(candidate) && (candidate.endsWith(".diff") || candidate.endsWith(".patch"))) {
    const text = readFileSync(candidate, "utf8");
    if (text.includes("diff --git ") || text.includes("\n+++ b/")) return text;
  }
  return undefined;
}

function extractDiffPaths(diff: string): string[] {
  const paths = new Set<string>();
  for (const line of diff.split("\n")) {
    const gitHeader = line.match(/^diff --git a\/(.+?) b\/(.+)$/);
    if (gitHeader) {
      paths.add(gitHeader[2]);
      continue;
    }
    const changedFile = line.match(/^\+\+\+ b\/(.+)$/);
    if (changedFile && changedFile[1] !== "/dev/null") paths.add(changedFile[1]);
  }
  return [...paths].sort();
}

export function commandSummary(): string {
  return `rule pack: ${rules.length} rules (+ baseline-integrity built-in)`;
}
