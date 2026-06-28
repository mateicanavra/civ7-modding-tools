// Source-check has no active rule records after the Grit migration. Keep the
// retired module path convention only so stale selections fail with the same
// loader diagnostics if a source-check record is reintroduced.
export const sourceCheckRuleModulesRepoPath = ".habitat/_support/execution/source-check/adapters";

export function sourceCheckRuleModuleRepoPath(ruleId: string): string {
  return `${sourceCheckRuleModulesRepoPath}/${ruleId}.rule.mjs`;
}
