import { sourceCheckRuntime as runtime } from "../../../../../../../../habitat/toolkit/blueprints/_self/structure/triage/preserve_legacy_source_check_runtime_during_cutover/rule-runtime.policy.mjs";

export const ruleId = "require_runtime_domain_op_bundle_imports";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.sourceRefsMatching(
    rule,
    file,
    /mods\/[^/]+\/src\/recipes\/.*\/recipe\.ts$/,
    /^@mapgen\/domain\/[^/]+$/
  );
}
