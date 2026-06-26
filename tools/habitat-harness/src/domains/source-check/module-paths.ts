export const sourceCheckRuleRuntimeRepoPath =
  "tools/habitat-harness/src/domains/source-check/rule-runtime.mjs";

export const sourceCheckRuleModulesRepoPath =
  "tools/habitat-harness/src/domains/source-check/rules";

export function sourceCheckRuleModuleRepoPath(ruleId: string): string {
  return `${sourceCheckRuleModulesRepoPath}/${ruleId}.mjs`;
}
