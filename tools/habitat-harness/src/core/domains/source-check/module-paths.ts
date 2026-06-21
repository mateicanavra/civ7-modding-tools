export const sourceCheckRuleRuntimeRepoPath =
  "tools/habitat-harness/src/core/domains/source-check/rule-runtime.mjs";

export const sourceCheckRuleModulesRepoPath =
  "tools/habitat-harness/src/core/domains/source-check/rules";

export function sourceCheckRuleModuleRepoPath(ruleId: string): string {
  return `${sourceCheckRuleModulesRepoPath}/${ruleId}.mjs`;
}
