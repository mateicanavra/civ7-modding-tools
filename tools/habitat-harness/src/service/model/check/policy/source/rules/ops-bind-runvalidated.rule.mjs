import { sourceCheckRuntime as runtime } from "../rule-runtime.policy.mjs";

export const ruleId = "ops-bind-runvalidated";
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
