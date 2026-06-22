export const sourceCheckRuleRuntimeRepoPath =
  "tools/habitat-harness/src/service/model/check/policy/source/rule-runtime.mjs";

export const sourceCheckRuleModulesRepoPath =
  "tools/habitat-harness/src/service/model/check/policy/source/rules";

export function sourceCheckRuleModuleRepoPath(ruleId: string): string {
  return `${sourceCheckRuleModulesRepoPath}/${ruleId}.mjs`;
}
