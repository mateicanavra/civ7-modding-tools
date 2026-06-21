import { Value } from "typebox/value";
import {
  type WorkspaceGraphTargetNameOptions,
  type WorkspaceGraphTargetNames,
  WorkspaceGraphTargetNamesSchema,
} from "./schema.ts";

export function workspaceGraphTargetNames(
  options: WorkspaceGraphTargetNameOptions = {}
): WorkspaceGraphTargetNames {
  return Value.Parse(WorkspaceGraphTargetNamesSchema, {
    aggregateCheck: options.aggregateCheckTargetName ?? "habitat:check:all",
    biomeCheck: options.biomeCheckTargetName ?? "biome:check",
    biomeCi: options.biomeCiTargetName ?? "biome:ci",
    biomeFormat: options.biomeFormatTargetName ?? "biome:format",
    boundaries: options.boundariesTargetName ?? "boundaries",
    check: options.checkTargetName ?? "habitat:check",
    generatedCheck: options.generatedCheckTargetName ?? "generated:check",
    sourceCheck: options.sourceCheckTargetName ?? "source:check",
    lint: options.lintTargetName ?? "lint",
    rulePrefix: options.ruleTargetPrefix ?? "habitat:rule:",
  });
}

export function classifyTargetNames(): readonly string[] {
  return ["check", "test"];
}

export function affectedCheckTargetNames(
  targetNames = workspaceGraphTargetNames()
): readonly string[] {
  return [
    "check",
    targetNames.boundaries,
    targetNames.generatedCheck,
    targetNames.sourceCheck,
    "validate:boundary-taxonomy",
    "validate:grit-patterns",
  ];
}

export function verifyTargetNames(targetNames = workspaceGraphTargetNames()): readonly string[] {
  void targetNames;
  return ["build", "check", "test", "validate:boundary-taxonomy", "validate:grit-patterns"];
}

export function prePushTargetNames(targetNames = workspaceGraphTargetNames()): readonly string[] {
  void targetNames;
  return ["check", "validate:boundary-taxonomy", "validate:grit-patterns"];
}

export function prePushTargetNamesForChangedPaths(
  changedPaths: readonly string[],
  targetNames = workspaceGraphTargetNames()
): readonly string[] {
  const paths = changedPaths.map(normalizeRepoPath).filter(Boolean);
  if (paths.length === 0 || !paths.every(isHabitatArtifactPath)) {
    return prePushTargetNames(targetNames);
  }

  const targets = new Set<string>([targetNames.check]);
  if (paths.some(isSourceCheckArtifactPath)) targets.add(targetNames.sourceCheck);
  if (paths.some(isGritPatternArtifactPath)) targets.add("validate:grit-patterns");
  return [...targets];
}

function normalizeRepoPath(filePath: string): string {
  return filePath.replace(/\\/g, "/").replace(/^\.\//, "");
}

function isHabitatArtifactPath(filePath: string): boolean {
  return filePath === ".habitat" || filePath.startsWith(".habitat/");
}

function isSourceCheckArtifactPath(filePath: string): boolean {
  return filePath.startsWith(".habitat/source-check/") || filePath.startsWith(".habitat/rules/");
}

function isGritPatternArtifactPath(filePath: string): boolean {
  return filePath.startsWith(".habitat/patterns/");
}
