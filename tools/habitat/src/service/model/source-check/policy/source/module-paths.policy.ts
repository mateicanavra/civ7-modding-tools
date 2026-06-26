// Habitat hierarchy V1 integration note: source-check execution uses centralized
// temporary support adapters under `.habitat/_support/execution`. Packet
// directories remain the authoring sites for policy metadata and patterns.
export const sourceCheckRuleRuntimeRepoPath =
  ".habitat/_support/execution/source-check/runtime/rule-runtime.policy.mjs";

export const sourceCheckRuleModulesRepoPath =
  ".habitat/_support/execution/source-check/adapters";

export function sourceCheckRuleModuleRepoPath(ruleId: string): string {
  return `${sourceCheckRuleModulesRepoPath}/${ruleId}.rule.mjs`;
}
