import { sourceCheckRuntime as runtime } from "../../../../../../../../habitat/toolkit/blueprints/_self/structure/triage/preserve_legacy_source_check_runtime_during_cutover/rule-runtime.policy.mjs";

export const ruleId = "prohibit_cross_op_runtime_calls";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.sourceRefsMatching(
    rule,
    file,
    /mods\/mod-swooper-maps\/src\/domain\/[^/]+\/ops\/[^/]+\/index\.ts$/,
    /^(?:\.\.\/[^/]+\/index\.js|@mapgen\/domain\/[^/]+\/ops(?:\/index\.js)?)$/
  );
}
