import { sourceCheckRuntime as runtime } from "../../../../../../../habitat/toolkit/_self/triage/structure/legacy-source-check/rule-runtime.policy.mjs";

export const ruleId = "domain-root-catalogs";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.pathMatches(
    file,
    /mods\/mod-swooper-maps\/src\/domain\/[^/]+\/(?:tags|artifacts)\.ts$/
  )
    ? [runtime.diagnostic(rule, file)]
    : [];
}
