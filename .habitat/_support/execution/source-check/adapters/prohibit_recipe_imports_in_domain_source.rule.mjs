import { sourceCheckRuntime as runtime } from "../runtime/rule-runtime.policy.mjs";

export const ruleId = "prohibit_recipe_imports_in_domain_source";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.sourceRefsMatching(
    rule,
    file,
    /mods\/mod-swooper-maps\/src\/domain\/.*\.ts$/,
    /(?:mod-swooper-maps\/recipes(?:\/|$)|@mapgen\/recipes(?:\/|$)|@mapgen\/recipe(?:\/|$)|@swooper\/recipes(?:\/|$)|(?:\.\.\/)+recipes(?:\/|$))/
  );
}
