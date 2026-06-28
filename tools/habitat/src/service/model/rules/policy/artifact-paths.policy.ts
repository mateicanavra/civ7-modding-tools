import type { RuleRegistryRecordV1 } from "../dto/registry.schema.js";

export interface HabitatArtifactRulePathInput {
  readonly id: string;
  readonly runner: RuleRegistryRecordV1["runner"];
  readonly manifestPath?: string;
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
  const rulesById = new Map(rules.map((rule) => [rule.id, rule]));
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

    const ruleId = ruleArtifactId(filePath);
    if (ruleId) {
      const rule = rulesById.get(ruleId);
      if (!rule) {
        hasUnclassifiedArtifact = true;
      } else if (rule.runner.name === "grit") {
        nonSourceCheckRuleArtifactIds.add(rule.id);
      } else {
        nonSourceCheckRuleArtifactIds.add(rule.id);
      }
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

function normalizeRepoPath(filePath: string): string {
  return filePath.replace(/\\/g, "/").replace(/^\.\//, "");
}

function isHabitatArtifactPath(filePath: string): boolean {
  return filePath === ".habitat" || filePath.startsWith(".habitat/");
}

function isGritPatternArtifactPath(filePath: string): boolean {
  return filePath.startsWith(".habitat/patterns/");
}

function ruleArtifactId(filePath: string): string | undefined {
  const parts = filePath.split("/");
  const blueprintIndex = parts.indexOf("blueprints");
  if (parts[0] === ".habitat" && blueprintIndex >= 1) {
    const artifactKind = parts[blueprintIndex + 3];
    const packetId = parts[blueprintIndex + 4];
    if (
      packetId &&
      (artifactKind === "check" ||
        artifactKind === "fix" ||
        artifactKind === "generate" ||
        artifactKind === "migrate" ||
        artifactKind === "triage")
    ) {
      return packetId;
    }
  }

  const legacyRulesMatch = /^\.habitat\/rules\/([^/]+)(?:\/|$)/.exec(filePath);
  return legacyRulesMatch?.[1];
}
