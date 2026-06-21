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
  return affectedCheckTargetNames(targetNames);
}
