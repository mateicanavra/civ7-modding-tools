// Integration note: these paths intentionally point at `.habitat` because the
// legacy native source-check rule modules are authored enforcement artifacts,
// not service-model source. This adapter should be removed when the remaining
// source-check rules are converted to Grit-backed `.habitat/patterns`.
export const sourceCheckRuleRuntimeRepoPath =
  ".habitat/tooling/components/legacy-source-check/runtime/rule-runtime.policy.mjs";

export const sourceCheckRuleModulesRepoPath =
  ".habitat/tooling/components/legacy-source-check/rules";

export function sourceCheckRuleModuleRepoPath(ruleId: string): string {
  return `${sourceCheckRuleModulesRepoPath}/${ruleId}.rule.mjs`;
}
