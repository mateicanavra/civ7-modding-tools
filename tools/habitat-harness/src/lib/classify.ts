import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { type HarnessRule, rules } from "../rules/architecture.js";
import {
  findOwningProject,
  NxProjectGraphMetadataReader,
  type NxProjectMetadata,
  type NxProjectMetadataReader,
  projectHasTarget,
} from "./nx-projects.js";
import { repoRoot, toRepoRelative } from "./paths.js";

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
  source:
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

export function commandSummary(): string {
  return `rule pack: ${rules.length} rules (+ baseline-integrity built-in)`;
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
    requiredTargets: [...resolvedProjectTargets.targets, ...workspace].map(
      (target) => target.command
    ),
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
        reason:
          "Rule is owned by the project, but current metadata is not precise enough for exact path scope.",
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
        source: { kind: "nx-project-graph" as const, project: project.name, target: targetName },
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
      source: {
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
