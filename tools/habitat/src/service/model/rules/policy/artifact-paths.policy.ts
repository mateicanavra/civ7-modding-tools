import type { RuleRegistryRecordV1 } from "../dto/registry.schema.js";

export interface HabitatArtifactRulePathInput {
  readonly id: string;
  readonly runner: RuleRegistryRecordV1["runner"];
  readonly manifestPath?: string;
  readonly manifestFilePath?: string;
  readonly artifacts?: RuleRegistryRecordV1["artifacts"];
}

export interface HabitatArtifactPathPlan {
  readonly paths: readonly string[];
  readonly allHabitatArtifacts: boolean;
  readonly hasSourceCheckArtifact: boolean;
  readonly hasGritPatternArtifact: boolean;
  readonly nonSourceCheckRuleArtifactIds: readonly string[];
  readonly hasUnclassifiedArtifact: boolean;
}

export function ruleArtifactPathFacts(
  rules: readonly RuleRegistryRecordV1[]
): HabitatArtifactRulePathInput[] {
  return rules.map((rule) => ({
    id: rule.id,
    runner: rule.runner,
    ...("manifestPath" in rule && rule.manifestPath ? { manifestPath: rule.manifestPath } : {}),
    ...("manifestFilePath" in rule && rule.manifestFilePath
      ? { manifestFilePath: rule.manifestFilePath }
      : {}),
    ...("artifacts" in rule && rule.artifacts ? { artifacts: rule.artifacts } : {}),
  }));
}

export function habitatArtifactPathPlan(
  changedPaths: readonly string[],
  rules: readonly HabitatArtifactRulePathInput[]
): HabitatArtifactPathPlan {
  const paths = changedPaths.map(normalizeRepoPath).filter(Boolean);
  const classified = classifyHabitatArtifactPaths(paths, rules);
  return {
    paths,
    allHabitatArtifacts: paths.length > 0 && paths.every(isHabitatArtifactPath),
    hasSourceCheckArtifact: classified.hasSourceCheckArtifact,
    hasGritPatternArtifact: paths.some(isGritPatternArtifactPath),
    nonSourceCheckRuleArtifactIds: classified.nonSourceCheckRuleArtifactIds,
    hasUnclassifiedArtifact: classified.hasUnclassifiedArtifact,
  };
}

function classifyHabitatArtifactPaths(
  paths: readonly string[],
  rules: readonly HabitatArtifactRulePathInput[]
): {
  hasSourceCheckArtifact: boolean;
  nonSourceCheckRuleArtifactIds: readonly string[];
  hasUnclassifiedArtifact: boolean;
} {
  let hasSourceCheckArtifact = false;
  let hasUnclassifiedArtifact = false;
  const nonSourceCheckRuleArtifactIds = new Set<string>();
  const rulesByArtifactPath = artifactPathIndex(rules);
  const sourceManifestPaths = new Set(
    rules
      .filter((rule) => rule.runner.name === "grit")
      .flatMap((rule) => (rule.manifestPath ? [normalizeRepoPath(rule.manifestPath)] : []))
  );

  for (const filePath of paths) {
    if (!isHabitatArtifactPath(filePath)) continue;
    if (filePath.startsWith(".habitat/source-check/") || sourceManifestPaths.has(filePath)) {
      hasSourceCheckArtifact = true;
      continue;
    }

    const referencedRule = rulesByArtifactPath.get(filePath);
    if (referencedRule) {
      nonSourceCheckRuleArtifactIds.add(referencedRule.id);
      continue;
    }

    if (!isGritPatternArtifactPath(filePath)) hasUnclassifiedArtifact = true;
  }

  return {
    hasSourceCheckArtifact,
    nonSourceCheckRuleArtifactIds: [...nonSourceCheckRuleArtifactIds].sort(),
    hasUnclassifiedArtifact,
  };
}

function artifactPathIndex(
  rules: readonly HabitatArtifactRulePathInput[]
): Map<string, HabitatArtifactRulePathInput> {
  const index = new Map<string, HabitatArtifactRulePathInput>();
  for (const rule of rules) {
    for (const artifactPath of referencedArtifactPaths(rule)) {
      index.set(normalizeRepoPath(artifactPath), rule);
    }
  }
  return index;
}

function referencedArtifactPaths(rule: HabitatArtifactRulePathInput): string[] {
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
  if (rule.artifacts?.baseline) paths.push(rule.artifacts.baseline);
  return paths;
}

function normalizeRepoPath(filePath: string): string {
  return filePath.replace(/\\/g, "/").replace(/^\.\//, "");
}

function isHabitatArtifactPath(filePath: string): boolean {
  return filePath === ".habitat" || filePath.startsWith(".habitat/");
}

function isGritPatternArtifactPath(filePath: string): boolean {
  return filePath.startsWith(".habitat/patterns/");
}
