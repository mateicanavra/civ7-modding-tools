export const sourceCheckRuleRuntimeRepoPath =
  "tools/habitat-harness/src/service/modules/check/source/rule-runtime.mjs";

export const sourceCheckRuleModulesRepoPath =
  "tools/habitat-harness/src/service/modules/check/source/rules";

export function sourceCheckRuleModuleRepoPath(ruleId: string): string {
  return `${sourceCheckRuleModulesRepoPath}/${ruleId}.mjs`;
}
