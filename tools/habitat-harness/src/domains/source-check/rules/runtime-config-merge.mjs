import { sourceCheckRuntime as runtime } from "../rule-runtime.mjs";

export const ruleId = "runtime-config-merge";
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
