import { sourceCheckRuntime as runtime } from "../runtime/rule-runtime.policy.mjs";

export const ruleId = "require_domain_contract_roots_in_step_contracts";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime
    .sourceRefsMatching(
      rule,
      file,
      /mods\/[^/]+\/src\/recipes\/.*\/stages\/.*\/steps\/(?:.*\/)?(?:contract|[^/]+\.contract)\.ts$/,
      /^@mapgen\/domain\/[^/]+\/.+$/
    )
    .filter(() => !/\/(?:__tests__|__type_tests__)\//.test(file.path));
}
