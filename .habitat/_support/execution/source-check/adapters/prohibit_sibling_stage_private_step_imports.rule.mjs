import { sourceCheckRuntime as runtime } from "../runtime/rule-runtime.policy.mjs";

export const ruleId = "prohibit_sibling_stage_private_step_imports";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.sourceRefsMatching(
    rule,
    file,
    /mods\/mod-swooper-maps\/src\/recipes\/standard\/stages\/[^/]+\/.*\.ts$/,
    /.*\.\.\/[^/]+\/steps\/.*/
  );
}
