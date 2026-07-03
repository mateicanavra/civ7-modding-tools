import { sourceCheckRuntime as runtime } from "../runtime/rule-runtime.policy.mjs";

export const ruleId = "domain-deep-import";
export const candidateExtensions = [".ts", ".tsx"];

export function diagnosticsForRule(rule, file) {
  return runtime.sourceRefsMatching(
    rule,
    file,
    /mods\/[^/]+\/src\/(?:recipes|maps)\/.*\.tsx?$/,
    /^@mapgen\/domain\/[^/]+\/(?:ops\/.+|ops-by-id|rules\/.+|strategies\/+.+)$/
  );
}
