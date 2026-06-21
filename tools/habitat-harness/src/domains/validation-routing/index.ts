import type { WorkspaceGraphTargetNames } from "../../providers/nx/schema.js";
import { habitatArtifactPathPlan } from "../rule-registry/artifact-paths.js";

export interface ValidationRunTarget {
  readonly project: string;
  readonly target: string;
}

export interface ValidationTargetPlan {
  readonly runTargets: readonly ValidationRunTarget[];
  readonly affectedTargets: readonly string[];
}

const habitatHarnessProject = "@internal/habitat-harness";
const packageCheckTarget = "check";
const habitatToolingPrefix = "tools/habitat-harness/";
const structuralTargetNames = ["validate:boundary-taxonomy", "validate:grit-patterns"] as const;

export function graphCheckTargetNames(targetNames: WorkspaceGraphTargetNames): readonly string[] {
  return [
    "check",
    targetNames.boundaries,
    targetNames.generatedCheck,
    targetNames.sourceCheck,
    ...structuralTargetNames,
  ];
}

export function verifyAffectedTargetNames(
  _targetNames: WorkspaceGraphTargetNames
): readonly string[] {
  return ["build", "check", "test", ...structuralTargetNames];
}

export function prePushAffectedTargetNames(
  _targetNames: WorkspaceGraphTargetNames
): readonly string[] {
  return ["check", ...structuralTargetNames];
}

export function prePushTargetNamesForChangedPaths(
  changedPaths: readonly string[],
  targetNames: WorkspaceGraphTargetNames
): readonly string[] {
  return prePushTargetPlanForChangedPaths(changedPaths, targetNames).affectedTargets;
}

export function prePushTargetPlanForChangedPaths(
  changedPaths: readonly string[],
  targetNames: WorkspaceGraphTargetNames
): ValidationTargetPlan {
  const plan = habitatArtifactPathPlan(changedPaths);
  if (plan.allHabitatArtifacts) {
    return { runTargets: [], affectedTargets: artifactAffectedTargets(plan, targetNames) };
  }

  if (plan.paths.length > 0 && plan.paths.every(isHabitatToolingPath)) {
    return {
      runTargets: [{ project: habitatHarnessProject, target: packageCheckTarget }],
      affectedTargets: [...structuralTargetNames],
    };
  }

  return { runTargets: [], affectedTargets: prePushAffectedTargetNames(targetNames) };
}

function artifactAffectedTargets(
  plan: ReturnType<typeof habitatArtifactPathPlan>,
  targetNames: WorkspaceGraphTargetNames
): readonly string[] {
  const targets = new Set<string>([targetNames.check]);
  if (plan.hasSourceCheckArtifact) targets.add(targetNames.sourceCheck);
  if (plan.hasGritPatternArtifact) targets.add("validate:grit-patterns");
  return [...targets];
}

function isHabitatToolingPath(filePath: string): boolean {
  return filePath.startsWith(habitatToolingPrefix);
}
