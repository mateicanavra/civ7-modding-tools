import { sourceCheckRuntime as runtime } from "../runtime/rule-runtime.policy.mjs";

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
