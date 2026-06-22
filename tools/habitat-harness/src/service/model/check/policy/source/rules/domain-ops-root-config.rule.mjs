import { sourceCheckRuntime as runtime } from "../rule-runtime.policy.mjs";

export const ruleId = "domain-ops-root-config";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.sourceRefsMatching(
    rule,
    file,
    /mods\/mod-swooper-maps\/src\/domain\/.*\/ops\/.*\.ts$/,
    /^(?:\.\.\/){2,}config\.js$/
  );
}
