import { sourceCheckRuntime as runtime } from "../../../../../../../../habitat/toolkit/blueprints/_self/structure/triage/preserve_legacy_source_check_runtime_during_cutover/rule-runtime.policy.mjs";

export const ruleId = "prohibit_wrapper_only_advanced_config";
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
