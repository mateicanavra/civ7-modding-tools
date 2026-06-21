import { sourceCheckRuntime as runtime } from "../rule-runtime.mjs";

export const ruleId = "domain-ops-boundary-imports";

export function diagnosticsForRule(rule, file) {
  return [
    ...runtime
      .importRefs(file)
      .filter(() =>
        runtime.pathMatches(file, /mods\/mod-swooper-maps\/src\/domain\/.*\/ops\/.*\.ts$/)
      )
      .filter((ref) => /^@civ7\/adapter(?:\/|$)/.test(ref.source))
      .map((ref) => runtime.diagnostic(rule, file, ref.node)),
    ...runtime
      .identifierUses(file, "ExtendedMapContext")
      .filter(() =>
        runtime.pathMatches(file, /mods\/mod-swooper-maps\/src\/domain\/.*\/ops\/.*\.ts$/)
      )
      .map((node) => runtime.diagnostic(rule, file, node)),
    ...runtime
      .propertyAccesses(file, "adapter")
      .filter(() =>
        runtime.pathMatches(file, /mods\/mod-swooper-maps\/src\/domain\/.*\/ops\/.*\.ts$/)
      )
      .map((node) => runtime.diagnostic(rule, file, node)),
  ];
}
