import {
  type HabitatAuthorityRulePathInput,
  habitatAuthorityPathPlan,
} from "../../rules/policy/authority-paths.policy.ts";
import type { WorkspaceGraphTargetNames } from "../../workspace/index.ts";

export type ValidationTargetPlan =
  | { readonly kind: "run-many"; readonly targets: readonly [string, ...string[]] }
  | { readonly kind: "affected"; readonly targets: readonly ["check"] };

export function graphCheckTargetNames(_targetNames: WorkspaceGraphTargetNames): readonly string[] {
  return ["check"];
}

export function verifyAffectedTargetNames(
  _targetNames: WorkspaceGraphTargetNames
): readonly string[] {
  return ["build", "typecheck", "test", "lint"];
}

export function prePushAffectedTargetNames(
  _targetNames: WorkspaceGraphTargetNames
): readonly string[] {
  return ["check"];
}

export function prePushTargetPlanForChangedPaths(
  changedPaths: readonly string[],
  targetNames: WorkspaceGraphTargetNames,
  authorityRules: readonly HabitatAuthorityRulePathInput[]
): ValidationTargetPlan {
  const plan = habitatAuthorityPathPlan(changedPaths, authorityRules);
  if (plan.allHabitatAuthorityFiles) {
    return authorityTargetPlan(plan, targetNames, authorityRules);
  }
  return { kind: "affected", targets: ["check"] };
}

function authorityTargetPlan(
  plan: ReturnType<typeof habitatAuthorityPathPlan>,
  targetNames: WorkspaceGraphTargetNames,
  _authorityRules: readonly HabitatAuthorityRulePathInput[]
): ValidationTargetPlan {
  if (
    plan.hasUnclassifiedAuthorityFile ||
    plan.hasSourceCheckAuthorityFile ||
    plan.nonSourceCheckRuleIds.length === 0
  ) {
    return { kind: "run-many", targets: [targetNames.check] };
  }
  const [firstRuleId, ...remainingRuleIds] = plan.nonSourceCheckRuleIds;
  if (!firstRuleId) return { kind: "run-many", targets: [targetNames.check] };
  return {
    kind: "run-many",
    targets: [
      `${targetNames.rulePrefix}${firstRuleId}`,
      ...remainingRuleIds.map((ruleId) => `${targetNames.rulePrefix}${ruleId}`),
    ],
  };
}
