import { prePushTargetNames, workspaceGraphTargetNames } from "../../providers/nx/targets.js";
import { habitatArtifactPathPlan } from "../rule-registry/artifact-paths.js";

export interface PrePushRunTarget {
  readonly project: string;
  readonly target: string;
}

export interface PrePushTargetPlan {
  readonly runTargets: readonly PrePushRunTarget[];
  readonly affectedTargets: readonly string[];
}

const habitatHarnessProject = "@internal/habitat-harness";
const packageCheckTarget = "check";
const habitatToolingPrefix = "tools/habitat-harness/";
const structuralTargetNames = ["validate:boundary-taxonomy", "validate:grit-patterns"] as const;

export function prePushTargetNamesForChangedPaths(
  changedPaths: readonly string[],
  targetNames = workspaceGraphTargetNames()
): readonly string[] {
  return prePushTargetPlanForChangedPaths(changedPaths, targetNames).affectedTargets;
}

export function prePushTargetPlanForChangedPaths(
  changedPaths: readonly string[],
  targetNames = workspaceGraphTargetNames()
): PrePushTargetPlan {
  const plan = habitatArtifactPathPlan(changedPaths);
  if (plan.allHabitatArtifacts) {
    return { runTargets: [], affectedTargets: artifactAffectedTargets(plan, targetNames) };
  }

  if (plan.paths.length > 0 && plan.paths.every(isHabitatToolingPath)) {
    return {
      runTargets: [{ project: habitatHarnessProject, target: packageCheckTarget }],
      affectedTargets: [targetNames.check, targetNames.sourceCheck, ...structuralTargetNames],
    };
  }

  return { runTargets: [], affectedTargets: prePushTargetNames(targetNames) };
}

function artifactAffectedTargets(
  plan: ReturnType<typeof habitatArtifactPathPlan>,
  targetNames: ReturnType<typeof workspaceGraphTargetNames>
): readonly string[] {
  const targets = new Set<string>([targetNames.check]);
  if (plan.hasSourceCheckArtifact) targets.add(targetNames.sourceCheck);
  if (plan.hasGritPatternArtifact) targets.add("validate:grit-patterns");
  return [...targets];
}

function isHabitatToolingPath(filePath: string): boolean {
  return filePath.startsWith(habitatToolingPrefix);
}
