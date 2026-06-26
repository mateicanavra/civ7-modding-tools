import { sourceCheckRuntime as runtime } from "../runtime/rule-runtime.policy.mjs";

export const ruleId = "prohibit_runtime_calls_to_runvalidated";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.pathMatches(
    file,
    /mods\/[^/]+\/src\/(?:recipes\/.*\/stages\/.*\/steps|domain\/.*\/ops\/.*\/strategies)\/.*\.ts$/
  )
    ? [
        ...runtime.callExpressions(file, "runValidated"),
        ...runtime.propertyCallExpressions(file, "runValidated"),
      ].map((node) => runtime.diagnostic(rule, file, node))
    : [];
}
