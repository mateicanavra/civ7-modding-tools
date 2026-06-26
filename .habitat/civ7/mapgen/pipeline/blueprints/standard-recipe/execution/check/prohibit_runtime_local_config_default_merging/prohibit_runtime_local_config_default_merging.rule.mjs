import { sourceCheckRuntime as runtime } from "../../../../../../../../habitat/toolkit/blueprints/_self/structure/triage/preserve_legacy_source_check_runtime_during_cutover/rule-runtime.policy.mjs";

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
