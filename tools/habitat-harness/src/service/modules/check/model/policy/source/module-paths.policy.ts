export const sourceCheckRuleRuntimeRepoPath =
  "tools/habitat-harness/src/service/modules/check/model/policy/source/rule-runtime.policy.mjs";

export const sourceCheckRuleModulesRepoPath =
  "tools/habitat-harness/src/service/modules/check/model/policy/source/rules";

export function sourceCheckRuleModuleRepoPath(ruleId: string): string {
  return `${sourceCheckRuleModulesRepoPath}/${ruleId}.rule.mjs`;
}
