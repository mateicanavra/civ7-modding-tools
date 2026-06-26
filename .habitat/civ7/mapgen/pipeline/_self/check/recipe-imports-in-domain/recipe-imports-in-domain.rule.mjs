import { sourceCheckRuntime as runtime } from "../runtime/rule-runtime.policy.mjs";

export const ruleId = "recipe-imports-in-domain";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.sourceRefsMatching(
    rule,
    file,
    /mods\/mod-swooper-maps\/src\/domain\/.*\.ts$/,
    /(?:mod-swooper-maps\/recipes(?:\/|$)|@mapgen\/recipes(?:\/|$)|@mapgen\/recipe(?:\/|$)|@swooper\/recipes(?:\/|$)|(?:\.\.\/)+recipes(?:\/|$))/
  );
}
