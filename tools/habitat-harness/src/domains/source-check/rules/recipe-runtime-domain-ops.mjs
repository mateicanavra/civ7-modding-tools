import { sourceCheckRuntime as runtime } from "../rule-runtime.mjs";

export const ruleId = "recipe-runtime-domain-ops";

export function diagnosticsForRule(rule, file) {
  return runtime.sourceRefsMatching(
    rule,
    file,
    /mods\/[^/]+\/src\/recipes\/.*\/recipe\.ts$/,
    /^@mapgen\/domain\/[^/]+$/
  );
}
