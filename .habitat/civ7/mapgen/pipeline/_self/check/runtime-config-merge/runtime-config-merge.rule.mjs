import { sourceCheckRuntime as runtime } from "../../../../../../habitat/toolkit/_self/triage/legacy-source-check/rule-runtime.policy.mjs";

export const ruleId = "runtime-config-merge";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.pathMatches(
    file,
    /mods\/mod-swooper-maps\/src\/(?:recipes\/.*\/stages\/.*\/steps|domain\/.*\/ops)\/.*\.ts$/
  )
    ? [
        ...runtime.emptyObjectNullish(file),
        ...runtime.propertyCallExpressions(file, "Default", "Value"),
      ].map((node) => runtime.diagnostic(rule, file, node))
    : [];
}
