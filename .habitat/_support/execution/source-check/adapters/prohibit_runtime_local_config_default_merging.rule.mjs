import { sourceCheckRuntime as runtime } from "../runtime/rule-runtime.policy.mjs";

export const ruleId = "prohibit_runtime_local_config_default_merging";
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
