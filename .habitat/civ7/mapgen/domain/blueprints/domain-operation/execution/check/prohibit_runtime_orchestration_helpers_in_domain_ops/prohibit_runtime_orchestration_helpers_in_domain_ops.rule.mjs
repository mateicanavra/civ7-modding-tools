import { sourceCheckRuntime as runtime } from "../../../../../../../../habitat/toolkit/blueprints/_self/structure/triage/preserve_legacy_source_check_runtime_during_cutover/rule-runtime.policy.mjs";

export const ruleId = "prohibit_runtime_orchestration_helpers_in_domain_ops";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.pathMatches(
    file,
    /mods\/mod-swooper-maps\/src\/domain\/[^/]+\/ops\/[^/]+\/index\.ts$/
  )
    ? [
        ...runtime.callExpressions(file, "runValidated"),
        ...runtime.propertyCallExpressions(file, "bind", "ops"),
      ].map((node) => runtime.diagnostic(rule, file, node))
    : [];
}
