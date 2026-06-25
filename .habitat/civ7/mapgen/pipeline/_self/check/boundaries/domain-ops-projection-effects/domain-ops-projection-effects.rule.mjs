import { sourceCheckRuntime as runtime } from "../../../../../../../habitat/toolkit/_self/triage/structure/legacy-source-check/rule-runtime.policy.mjs";

export const ruleId = "domain-ops-projection-effects";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime
    .stringLiterals(file)
    .filter(() =>
      runtime.pathMatches(file, /mods\/mod-swooper-maps\/src\/domain\/.*\/ops\/.*\.ts$/)
    )
    .filter(({ value }) => value.startsWith("artifact:map.") || value.startsWith("effect:map."))
    .map(({ node }) => runtime.diagnostic(rule, file, node));
}
