import { sourceCheckRuntime as runtime } from "../../../../../../../../habitat/toolkit/blueprints/_self/structure/triage/preserve_legacy_source_check_runtime_during_cutover/rule-runtime.policy.mjs";

export const ruleId = "block_adapter_context_imports_from_domain_ops";
export const candidateExtensions = [".ts"];

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
