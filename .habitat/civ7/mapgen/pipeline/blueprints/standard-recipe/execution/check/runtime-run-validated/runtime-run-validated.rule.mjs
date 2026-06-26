import { sourceCheckRuntime as runtime } from "../../../../../../../../habitat/toolkit/blueprints/_self/structure/triage/legacy-source-check/rule-runtime.policy.mjs";

export const ruleId = "runtime-run-validated";
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
