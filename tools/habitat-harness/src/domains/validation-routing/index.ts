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
const boundaryTaxonomyTargetName = "validate:boundary-taxonomy";
const gritPatternsTargetName = "validate:grit-patterns";
const structuralTargetNames = [boundaryTaxonomyTargetName, gritPatternsTargetName] as const;

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
      affectedTargets: habitatToolingStructuralTargetNames(plan.paths),
    };
  }

  return { runTargets: [], affectedTargets: prePushAffectedTargetNames(targetNames) };
}

function artifactAffectedTargets(
  plan: ReturnType<typeof habitatArtifactPathPlan>,
  targetNames: WorkspaceGraphTargetNames
): readonly string[] {
  const targets = new Set<string>();
  if (plan.hasSourceCheckArtifact) targets.add(targetNames.sourceCheck);
  for (const ruleId of plan.nonSourceCheckRuleArtifactIds) {
    targets.add(`${targetNames.rulePrefix}${ruleId}`);
  }
  if (plan.hasGritPatternArtifact) targets.add(gritPatternsTargetName);
  if (plan.hasUnclassifiedArtifact || targets.size === 0) targets.add(targetNames.check);
  return [...targets];
}

function isHabitatToolingPath(filePath: string): boolean {
  return filePath.startsWith(habitatToolingPrefix);
}

function habitatToolingStructuralTargetNames(paths: readonly string[]): readonly string[] {
  const targets = new Set<string>();
  for (const filePath of paths) {
    if (isBoundaryTaxonomyToolingPath(filePath)) targets.add(boundaryTaxonomyTargetName);
    if (isStructuralTargetDeclarationPath(filePath)) {
      targets.add(boundaryTaxonomyTargetName);
      targets.add(gritPatternsTargetName);
    }
  }
  return [...targets];
}

function isBoundaryTaxonomyToolingPath(filePath: string): boolean {
  return (
    filePath === "tools/habitat-harness/scripts/validate-boundary-taxonomy.ts" ||
    filePath === "tools/habitat-harness/src/lib/boundary-taxonomy.ts"
  );
}

function isStructuralTargetDeclarationPath(filePath: string): boolean {
  return filePath === "tools/habitat-harness/package.json";
}
