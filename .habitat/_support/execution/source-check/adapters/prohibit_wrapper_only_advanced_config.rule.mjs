import { sourceCheckRuntime as runtime } from "../runtime/rule-runtime.policy.mjs";

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
