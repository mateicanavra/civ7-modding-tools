import { sourceCheckRuntime as runtime } from "../rule-runtime.mjs";

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
