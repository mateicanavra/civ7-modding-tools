import { sourceCheckRuntime as runtime } from "../../../../../../../habitat/blueprints/toolkit/structure/triage/legacy-source-check/rule-runtime.policy.mjs";

export const ruleId = "wrapper-advanced-stage-config";
export const candidateExtensions = [".ts", ".json"];

export function diagnosticsForRule(rule, file) {
  return runtime.pathMatches(
    file,
    /mods\/mod-swooper-maps\/src\/(?:recipes\/standard|maps)\/.*\.(?:ts|json)$/
  )
    ? runtime
        .propertyNameOccurrences(file, "advanced")
        .map((line) => runtime.diagnostic(rule, file, undefined, line))
    : [];
}
