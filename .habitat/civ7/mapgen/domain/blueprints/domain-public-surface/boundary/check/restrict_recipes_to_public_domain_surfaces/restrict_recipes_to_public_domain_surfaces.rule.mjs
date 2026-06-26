import { sourceCheckRuntime as runtime } from "../../../../../../../../habitat/toolkit/blueprints/_self/structure/triage/preserve_legacy_source_check_runtime_during_cutover/rule-runtime.policy.mjs";

export const ruleId = "restrict_recipes_to_public_domain_surfaces";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime
    .importRefs(file)
    .filter(() => runtime.pathMatches(file, /mods\/mod-swooper-maps\/src\/recipes\/.*\.ts$/))
    .filter((ref) => /@mapgen\/domain\/[^/]+\/.+/.test(ref.source))
    .filter((ref) => !/@mapgen\/domain\/[^/]+\/(?:ops|config\.js)$/.test(ref.source))
    .filter(
      (ref) =>
        !/@mapgen\/domain\/[^/]+\/(?:ops\/.+|ops-by-id|rules\/.+|strategies\/.+)/.test(ref.source)
    )
    .map((ref) => runtime.diagnostic(rule, file, ref.node));
}
