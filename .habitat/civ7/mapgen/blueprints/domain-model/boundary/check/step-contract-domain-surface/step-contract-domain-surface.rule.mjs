import { sourceCheckRuntime as runtime } from "../../../../../../../habitat/blueprints/toolkit/structure/triage/legacy-source-check/rule-runtime.policy.mjs";

export const ruleId = "step-contract-domain-surface";
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
