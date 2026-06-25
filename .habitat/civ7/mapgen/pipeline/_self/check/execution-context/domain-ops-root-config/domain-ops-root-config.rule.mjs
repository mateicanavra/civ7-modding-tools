import { sourceCheckRuntime as runtime } from "../../../../../../../habitat/toolkit/_self/triage/structure/legacy-source-check/rule-runtime.policy.mjs";

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
