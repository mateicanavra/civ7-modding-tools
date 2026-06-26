// Habitat hierarchy V1 integration note: these paths still point at the old
// `.habitat/tooling/components/legacy-source-check` compatibility shape. The
// legacy rule modules now live under the provisional Habitat authority niche,
// and a later Toolkit slice must either rewire this loader through the accepted
// authority resolver or remove it when the remaining source-check rules convert
// to Grit-backed subjects.
export const sourceCheckRuleRuntimeRepoPath =
  ".habitat/tooling/components/legacy-source-check/runtime/rule-runtime.policy.mjs";

export const sourceCheckRuleModulesRepoPath =
  ".habitat/tooling/components/legacy-source-check/rules";

export function sourceCheckRuleModuleRepoPath(ruleId: string): string {
  return `${sourceCheckRuleModulesRepoPath}/${ruleId}.rule.mjs`;
}
