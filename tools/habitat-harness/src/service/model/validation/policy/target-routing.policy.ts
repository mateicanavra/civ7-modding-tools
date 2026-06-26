import {
  type HabitatArtifactRulePathInput,
  habitatArtifactPathPlan,
} from "@internal/habitat-harness/service/model/rules/policy/artifact-paths.policy";
import type { WorkspaceGraphTargetNames } from "@internal/habitat-harness/service/model/workspace/index";

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
const serviceModuleShapeTargetName = "validate:service-module-shape";
const structuralTargetNames = [
  boundaryTaxonomyTargetName,
  gritPatternsTargetName,
  serviceModuleShapeTargetName,
] as const;

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
  targetNames: WorkspaceGraphTargetNames,
  artifactRules: readonly HabitatArtifactRulePathInput[]
): readonly string[] {
  return prePushTargetPlanForChangedPaths(changedPaths, targetNames, artifactRules).affectedTargets;
}

export function prePushTargetPlanForChangedPaths(
  changedPaths: readonly string[],
  targetNames: WorkspaceGraphTargetNames,
  artifactRules: readonly HabitatArtifactRulePathInput[]
): ValidationTargetPlan {
  const plan = habitatArtifactPathPlan(changedPaths, artifactRules);
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
    if (isServiceModuleShapeToolingPath(filePath)) targets.add(serviceModuleShapeTargetName);
    if (isStructuralTargetDeclarationPath(filePath)) {
      targets.add(boundaryTaxonomyTargetName);
      targets.add(gritPatternsTargetName);
      targets.add(serviceModuleShapeTargetName);
    }
  }
  return [...targets];
}

function isBoundaryTaxonomyToolingPath(filePath: string): boolean {
  return (
    filePath === "tools/habitat-harness/scripts/validate-boundary-taxonomy.ts" ||
    filePath ===
      "tools/habitat-harness/src/service/model/graph/policy/boundary-taxonomy.policy.ts" ||
    filePath === "tools/habitat-harness/src/validation/boundary-taxonomy-inputs.ts"
  );
}

function isStructuralTargetDeclarationPath(filePath: string): boolean {
  return (
    filePath === "tools/habitat-harness/package.json" ||
    filePath ===
      "tools/habitat-harness/src/service/model/validation/policy/target-routing.policy.ts"
  );
}

function isServiceModuleShapeToolingPath(filePath: string): boolean {
  return (
    filePath === "tools/habitat-harness/scripts/validate-service-module-shape.ts" ||
    filePath.startsWith("tools/habitat-harness/src/service/modules/")
  );
}
