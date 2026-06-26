// Habitat hierarchy V1 integration note: source-check execution now searches
// subject-local `.rule.mjs` files under `.habitat`, while this legacy module
// path remains the fallback diagnostic label until source-check disappears or
// the final authority resolver owns module lookup.
export const sourceCheckRuleRuntimeRepoPath =
  ".habitat/habitat/toolkit/blueprints/_self/structure/triage/legacy-source-check/rule-runtime.policy.mjs";

export const sourceCheckRuleModulesRepoPath =
  ".habitat/tooling/components/legacy-source-check/rules";

export function sourceCheckRuleModuleRepoPath(ruleId: string): string {
  return `${sourceCheckRuleModulesRepoPath}/${ruleId}.rule.mjs`;
}
