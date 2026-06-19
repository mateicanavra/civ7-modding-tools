import { Value } from "typebox/value";
import { workspaceGraphTargetNames as rawWorkspaceGraphTargetNames } from "../workspace-graph-contract.js";
import {
  type WorkspaceGraphTargetNameOptions,
  type WorkspaceGraphTargetNames,
  WorkspaceGraphTargetNamesSchema,
} from "./schema.js";

export function workspaceGraphTargetNames(
  options: WorkspaceGraphTargetNameOptions = {}
): WorkspaceGraphTargetNames {
  return Value.Parse(WorkspaceGraphTargetNamesSchema, rawWorkspaceGraphTargetNames(options));
}

export function classifyTargetNames(): readonly string[] {
  return ["check", "test"];
}

export function verifyTargetNames(targetNames = workspaceGraphTargetNames()): readonly string[] {
  return [
    "build",
    "check",
    "test",
    targetNames.boundaries,
    targetNames.biomeCi,
    targetNames.gritCheck,
    targetNames.generatedCheck,
  ];
}
