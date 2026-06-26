import { sourceCheckRuntime as runtime } from "../runtime/rule-runtime.policy.mjs";

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
