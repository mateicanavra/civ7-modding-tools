import { sourceCheckRuntime as runtime } from "../rule-runtime.policy.mjs";

export const ruleId = "recipe-runtime-domain-ops";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.sourceRefsMatching(
    rule,
    file,
    /mods\/[^/]+\/src\/recipes\/.*\/recipe\.ts$/,
    /^@mapgen\/domain\/[^/]+$/
  );
}
