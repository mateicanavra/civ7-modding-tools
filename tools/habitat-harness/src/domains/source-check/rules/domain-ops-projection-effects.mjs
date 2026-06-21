import { sourceCheckRuntime as runtime } from "../rule-runtime.mjs";

export const ruleId = "domain-ops-projection-effects";

export function diagnosticsForRule(rule, file) {
  return runtime
    .stringLiterals(file)
    .filter(() =>
      runtime.pathMatches(file, /mods\/mod-swooper-maps\/src\/domain\/.*\/ops\/.*\.ts$/)
    )
    .filter(({ value }) => value.startsWith("artifact:map.") || value.startsWith("effect:map."))
    .map(({ node }) => runtime.diagnostic(rule, file, node));
}
