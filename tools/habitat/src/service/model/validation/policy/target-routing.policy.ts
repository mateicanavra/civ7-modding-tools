import {
  type HabitatAuthorityRulePathInput,
  habitatAuthorityPathPlan,
} from "../../rules/policy/authority-paths.policy.ts";
import type { WorkspaceGraphTargetNames } from "../../workspace/index.ts";

export interface ValidationRunTarget {
  readonly project: string;
  readonly target: string;
}

export interface ValidationTargetPlan {
  readonly runTargets: readonly ValidationRunTarget[];
  readonly affectedTargets: readonly string[];
}

const habitatHarnessProject = "habitat";
const packageCheckTarget = "check";
const packageLintTarget = "lint";
const habitatToolingPrefixes = ["tools/habitat/", ".habitat/tooling/"] as const;
const structuralTargetNames = [packageLintTarget] as const;

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
  authorityRules: readonly HabitatAuthorityRulePathInput[]
): readonly string[] {
  return prePushTargetPlanForChangedPaths(changedPaths, targetNames, authorityRules)
    .affectedTargets;
}

export function prePushTargetPlanForChangedPaths(
  changedPaths: readonly string[],
  targetNames: WorkspaceGraphTargetNames,
  authorityRules: readonly HabitatAuthorityRulePathInput[]
): ValidationTargetPlan {
  const plan = habitatAuthorityPathPlan(changedPaths, authorityRules);
  if (plan.allHabitatAuthorityFiles) {
    return { runTargets: [], affectedTargets: authorityAffectedTargets(plan, targetNames) };
  }

  if (plan.paths.length > 0 && plan.paths.every(isHabitatToolingPath)) {
    return {
      runTargets: [{ project: habitatHarnessProject, target: packageCheckTarget }],
      affectedTargets: habitatToolingStructuralTargetNames(plan.paths),
    };
  }

  return { runTargets: [], affectedTargets: prePushAffectedTargetNames(targetNames) };
}

function authorityAffectedTargets(
  plan: ReturnType<typeof habitatAuthorityPathPlan>,
  targetNames: WorkspaceGraphTargetNames
): readonly string[] {
  const targets = new Set<string>();
  if (plan.hasSourceCheckAuthorityFile) targets.add(targetNames.sourceCheck);
  for (const ruleId of plan.nonSourceCheckRuleIds) {
    targets.add(`${targetNames.rulePrefix}${ruleId}`);
  }
  if (plan.hasUnclassifiedAuthorityFile || targets.size === 0) targets.add(targetNames.check);
  return [...targets];
}

function isHabitatToolingPath(filePath: string): boolean {
  return habitatToolingPrefixes.some((prefix) => filePath.startsWith(prefix));
}

function habitatToolingStructuralTargetNames(paths: readonly string[]): readonly string[] {
  const targets = new Set<string>();
  for (const filePath of paths) {
    if (isBoundaryTaxonomyToolingPath(filePath)) targets.add(packageLintTarget);
    if (isServiceModuleShapeToolingPath(filePath)) targets.add(packageLintTarget);
    if (isStructuralTargetDeclarationPath(filePath)) {
      targets.add(packageLintTarget);
    }
  }
  return [...targets];
}

function isBoundaryTaxonomyToolingPath(filePath: string): boolean {
  return (
    filePath === "tools/habitat/scripts/validate-boundary-taxonomy-against-workspace-graph.ts" ||
    filePath ===
      "tools/habitat/src/service/model/graph/policy/validate_boundary_taxonomy_against_workspace_graph.policy.ts" ||
    filePath ===
      "tools/habitat/src/validation/validate_boundary_taxonomy_against_workspace_graph-inputs.ts"
  );
}

function isStructuralTargetDeclarationPath(filePath: string): boolean {
  return (
    filePath === "tools/habitat/package.json" ||
    filePath === "tools/habitat/src/service/model/validation/policy/target-routing.policy.ts"
  );
}

function isServiceModuleShapeToolingPath(filePath: string): boolean {
  return (
    filePath ===
      ".habitat/habitat/toolkit/_blueprints/service-module/validate_habitat_service_module_file_shape/check.ts" ||
    filePath.startsWith("tools/habitat/src/service/modules/")
  );
}
