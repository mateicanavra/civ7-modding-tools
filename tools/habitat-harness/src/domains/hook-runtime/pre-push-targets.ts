import { prePushTargetNames, workspaceGraphTargetNames } from "../../providers/nx/targets.js";
import { habitatArtifactPathPlan } from "../rule-registry/artifact-paths.js";

export function prePushTargetNamesForChangedPaths(
  changedPaths: readonly string[],
  targetNames = workspaceGraphTargetNames()
): readonly string[] {
  const plan = habitatArtifactPathPlan(changedPaths);
  if (!plan.allHabitatArtifacts) {
    return prePushTargetNames(targetNames);
  }

  const targets = new Set<string>([targetNames.check]);
  if (plan.hasSourceCheckArtifact) targets.add(targetNames.sourceCheck);
  if (plan.hasGritPatternArtifact) targets.add("validate:grit-patterns");
  return [...targets];
}
