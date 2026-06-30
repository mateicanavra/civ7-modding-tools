import type { RuleRegistryRecord } from "../dto/registry.schema.js";

export interface HabitatAuthorityRulePathInput {
  readonly id: string;
  readonly runner: RuleRegistryRecord["runner"];
  readonly manifestPath?: string;
  readonly manifestFilePath?: string;
  readonly supportFiles?: RuleRegistryRecord["supportFiles"];
}

export interface HabitatAuthorityPathPlan {
  readonly paths: readonly string[];
  readonly allHabitatAuthorityFiles: boolean;
  readonly hasSourceCheckAuthorityFile: boolean;
  readonly hasGritPatternAuthorityFile: boolean;
  readonly nonSourceCheckRuleIds: readonly string[];
  readonly hasUnclassifiedAuthorityFile: boolean;
}

export function ruleAuthorityPathFacts(
  rules: readonly RuleRegistryRecord[]
): HabitatAuthorityRulePathInput[] {
  return rules.map((rule) => ({
    id: rule.id,
    runner: rule.runner,
    ...("manifestPath" in rule && rule.manifestPath ? { manifestPath: rule.manifestPath } : {}),
    ...("manifestFilePath" in rule && rule.manifestFilePath
      ? { manifestFilePath: rule.manifestFilePath }
      : {}),
    ...("supportFiles" in rule && rule.supportFiles ? { supportFiles: rule.supportFiles } : {}),
  }));
}

export function habitatAuthorityPathPlan(
  changedPaths: readonly string[],
  rules: readonly HabitatAuthorityRulePathInput[]
): HabitatAuthorityPathPlan {
  const paths = changedPaths.map(normalizeRepoPath).filter(Boolean);
  const classified = classifyHabitatAuthorityPaths(paths, rules);
  return {
    paths,
    allHabitatAuthorityFiles: paths.length > 0 && paths.every(isHabitatAuthorityPath),
    hasSourceCheckAuthorityFile: classified.hasSourceCheckAuthorityFile,
    hasGritPatternAuthorityFile: paths.some(isGritPatternAuthorityPath),
    nonSourceCheckRuleIds: classified.nonSourceCheckRuleIds,
    hasUnclassifiedAuthorityFile: classified.hasUnclassifiedAuthorityFile,
  };
}

function classifyHabitatAuthorityPaths(
  paths: readonly string[],
  rules: readonly HabitatAuthorityRulePathInput[]
): {
  hasSourceCheckAuthorityFile: boolean;
  nonSourceCheckRuleIds: readonly string[];
  hasUnclassifiedAuthorityFile: boolean;
} {
  let hasSourceCheckAuthorityFile = false;
  let hasUnclassifiedAuthorityFile = false;
  const nonSourceCheckRuleIds = new Set<string>();
  const rulesByAuthorityPath = authorityPathIndex(rules);
  const sourceManifestPaths = new Set(
    rules
      .filter((rule) => rule.runner.name === "grit")
      .flatMap((rule) => (rule.manifestPath ? [normalizeRepoPath(rule.manifestPath)] : []))
  );

  for (const filePath of paths) {
    if (!isHabitatAuthorityPath(filePath)) continue;
    if (filePath.startsWith(".habitat/source-check/") || sourceManifestPaths.has(filePath)) {
      hasSourceCheckAuthorityFile = true;
      continue;
    }

    const referencedRule = rulesByAuthorityPath.get(filePath);
    if (referencedRule) {
      nonSourceCheckRuleIds.add(referencedRule.id);
      continue;
    }

    if (!isGritPatternAuthorityPath(filePath)) hasUnclassifiedAuthorityFile = true;
  }

  return {
    hasSourceCheckAuthorityFile,
    nonSourceCheckRuleIds: [...nonSourceCheckRuleIds].sort(),
    hasUnclassifiedAuthorityFile,
  };
}

function authorityPathIndex(
  rules: readonly HabitatAuthorityRulePathInput[]
): Map<string, HabitatAuthorityRulePathInput> {
  const index = new Map<string, HabitatAuthorityRulePathInput>();
  for (const rule of rules) {
    for (const authorityPath of referencedAuthorityPaths(rule)) {
      index.set(normalizeRepoPath(authorityPath), rule);
    }
  }
  return index;
}

function referencedAuthorityPaths(rule: HabitatAuthorityRulePathInput): string[] {
  const paths: string[] = [];
  if (rule.manifestFilePath) paths.push(rule.manifestFilePath);
  if (rule.runner.name === "grit") {
    paths.push(rule.runner.files.pattern);
    if (rule.runner.files.applyPattern) paths.push(rule.runner.files.applyPattern);
  }
  if (rule.runner.name === "habitat" && rule.runner.mode === "structure") {
    paths.push(rule.runner.files.structure);
  }
  if (rule.runner.name === "habitat" && rule.runner.mode === "script") {
    paths.push(rule.runner.files.script);
  }
  if (rule.supportFiles?.baseline) paths.push(rule.supportFiles.baseline);
  return paths;
}

function normalizeRepoPath(filePath: string): string {
  return filePath.replace(/\\/g, "/").replace(/^\.\//, "");
}

function isHabitatAuthorityPath(filePath: string): boolean {
  return filePath === ".habitat" || filePath.startsWith(".habitat/");
}

function isGritPatternAuthorityPath(filePath: string): boolean {
  return filePath.startsWith(".habitat/patterns/");
}
